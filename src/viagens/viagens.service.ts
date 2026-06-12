import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as sharp from 'sharp';
import { VIAGEM_REPOSITORY, IViagemRepository } from './interfaces/viagem.repository.interface';
import { IViagem, IViagemDetail } from './interfaces/viagem.interface';
import { IPipelineViagem, IPipelineColumnData, IPipelineResponse } from './interfaces/pipeline-viagem.interface';
import { CreateViagemDto } from './dto/create-viagem.dto';
import { UpdateViagemDto } from './dto/update-viagem.dto';
import { ViagemQueryDto } from './dto/viagem-query.dto';
import { ViagemStatus } from './enums/viagem.enum';
import { PagedResult } from '../common/types/paged-result.type';
import { ClientsService } from '../clients/clients.service';
import { S3Service } from '../storage/s3.service';
import { BriefingsService } from '../briefings/briefings.service';
import { PropostasService } from '../propostas/propostas.service';
import { PassengersService } from '../passengers/passengers.service';
import { BriefingTemplatesService } from '../briefing-templates/briefing-templates.service';

@Injectable()
export class ViagensService {
  constructor(
    @Inject(VIAGEM_REPOSITORY) private readonly repo: IViagemRepository,
    private readonly clientsService: ClientsService,
    private readonly s3: S3Service,
    private readonly briefingsService: BriefingsService,
    private readonly propostasService: PropostasService,
    private readonly passengersService: PassengersService,
    private readonly briefingTemplatesService: BriefingTemplatesService,
  ) {}

  private generateCode(): string {
    const ts = Date.now().toString(36).toUpperCase();
    return `VGM-${ts}`;
  }

  async findPaged(agencyId: string, query: ViagemQueryDto): Promise<PagedResult<IPipelineViagem>> {
    return this.repo.findPaged(agencyId, query);
  }

  async findAll(agencyId: string): Promise<IViagem[]> {
    return this.repo.findAll(agencyId);
  }

  async findPipelineAll(agencyId: string, pageSize: number): Promise<IPipelineResponse> {
    return this.repo.findPipelineAll(agencyId, pageSize);
  }

  async findPipelineColumn(
    agencyId: string,
    status: ViagemStatus,
    page: number,
    pageSize: number,
  ): Promise<IPipelineColumnData> {
    return this.repo.findPipelineColumn(agencyId, status, page, pageSize);
  }

  async findByClient(agencyId: string, clientId: string): Promise<IViagem[]> {
    return this.repo.findByClient(agencyId, clientId);
  }

  async findById(id: string): Promise<IViagem> {
    const viagem = await this.repo.findById(id);
    if (!viagem) throw new NotFoundException('Viagem não encontrada.');
    return viagem;
  }

  async findByIdDetail(id: string, agencyId: string): Promise<IViagemDetail> {
    const viagem = await this.repo.findById(id);
    if (!viagem) throw new NotFoundException('Viagem não encontrada.');

    const [briefings, propostas, briefingTemplates, passengers] = await Promise.all([
      this.briefingsService.findByViagem(agencyId, id),
      this.propostasService.findByViagem(agencyId, id),
      this.briefingTemplatesService.findActive(agencyId),
      this.passengersService.findByClientId(viagem.clientId),
    ]);

    return { ...viagem, briefings, propostas, briefingTemplates, passengers };
  }

  async create(dto: CreateViagemDto, agencyId: string, userId: string | null): Promise<IViagem> {
    const viagemCode = this.generateCode();
    const viagem = await this.repo.create({ ...dto, agencyId, viagemCode, createdByUserId: userId });
    await this.clientsService.incrementTripCount(dto.clientId, 1);
    return viagem;
  }

  async update(id: string, dto: UpdateViagemDto): Promise<IViagem> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Viagem não encontrada.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const viagem = await this.findById(id);

    // Cascata: briefings e propostas da viagem não podem ficar órfãos.
    const [briefings, propostas] = await Promise.all([
      this.briefingsService.findByViagem(viagem.agencyId, id),
      this.propostasService.findByViagem(viagem.agencyId, id),
    ]);
    await Promise.all([
      ...briefings.map((b) => this.briefingsService.remove(b.id)),
      ...propostas.map((p) => this.propostasService.remove(p.id)),
    ]);

    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Viagem não encontrada.');
    await this.clientsService.incrementTripCount(viagem.clientId, -1);
  }

  async uploadCover(id: string, file: Express.Multer.File): Promise<IViagem> {
    if (!file?.buffer?.length) throw new BadRequestException('Nenhum arquivo enviado.');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Arquivo deve ser uma imagem.');

    const webp = await (sharp as any)(file.buffer)
      .rotate()
      .resize(1200, 630, { fit: 'cover' })
      .webp({ quality: 88 })
      .toBuffer();

    const key = `viagens/covers/${id}.webp`;
    const url = await this.s3.uploadFile(key, webp, 'image/webp');
    const coverImageUrl = `${url}?v=${Date.now()}`;

    const updated = await this.repo.update(id, { coverImageUrl });
    if (!updated) throw new NotFoundException('Viagem não encontrada.');
    return updated;
  }
}
