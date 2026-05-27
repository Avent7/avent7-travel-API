import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as sharp from 'sharp';
import { IClientRepository, CLIENT_REPOSITORY } from './interfaces/client.repository.interface';
import { IClient } from './interfaces/client.interface';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';
import { IClientsListResult } from './interfaces/clients-list-result.interface';
import { S3Service } from '../storage/s3.service';
import { ClientSegmentsService } from '../client-segments/client-segments.service';

@Injectable()
export class ClientsService {
  constructor(
    @Inject(CLIENT_REPOSITORY) private readonly repo: IClientRepository,
    private readonly s3: S3Service,
    private readonly segmentsService: ClientSegmentsService,
  ) {}

  private generateClientCode(): string {
    const ts = Date.now().toString(36).toUpperCase();
    return `AP-${ts}`;
  }

  async findAll(agencyId: string): Promise<IClient[]> {
    return this.repo.findAll(agencyId);
  }

  async findPaged(agencyId: string, query: ClientQueryDto): Promise<IClientsListResult> {
    const [paged, segments] = await Promise.all([
      this.repo.findPaged(agencyId, query),
      this.segmentsService.findAllForAgency(agencyId).catch(() => []),
    ]);
    return { ...paged, segments };
  }

  async findById(id: string): Promise<IClient> {
    const client = await this.repo.findById(id);
    if (!client) throw new NotFoundException('Cliente não encontrado.');
    return client;
  }

  async create(dto: CreateClientDto, agencyId: string): Promise<IClient> {
    await this.segmentsService.assertBelongsToAgency(dto.segmentId, agencyId);
    const clientCode = this.generateClientCode();
    return this.repo.create({ ...dto, agencyId, clientCode });
  }

  async update(id: string, dto: UpdateClientDto): Promise<IClient> {
    if (dto.segmentId) {
      const existing = await this.repo.findById(id);
      if (!existing) throw new NotFoundException('Cliente não encontrado.');
      await this.segmentsService.assertBelongsToAgency(dto.segmentId, existing.agencyId);
    }
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Cliente não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Cliente não encontrado.');
  }

  async incrementTripCount(clientId: string, delta: 1 | -1): Promise<void> {
    await this.repo.incrementCount(clientId, 'tripCount', delta);
  }

  async incrementPassengerCount(clientId: string, delta: 1 | -1): Promise<void> {
    await this.repo.incrementCount(clientId, 'passengerCount', delta);
  }

  async uploadPhoto(id: string, file: Express.Multer.File): Promise<IClient> {
    if (!file?.buffer?.length) throw new BadRequestException('Nenhum arquivo enviado.');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Arquivo deve ser uma imagem.');

    const webp = await (sharp as any)(file.buffer)
      .rotate()
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 86 })
      .toBuffer();

    const key = `avatars/clientes/${id}.webp`;
    const url = await this.s3.uploadFile(key, webp, 'image/webp');
    const photoUrl = `${url}?v=${Date.now()}`;

    const updated = await this.repo.update(id, { photoUrl });
    if (!updated) throw new NotFoundException('Cliente não encontrado.');
    return updated;
  }
}
