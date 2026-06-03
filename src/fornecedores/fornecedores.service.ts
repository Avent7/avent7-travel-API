import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as sharp from 'sharp';
import {
  ISupplierRepository,
  SUPPLIER_REPOSITORY,
} from './interfaces/supplier.repository.interface';
import { ISupplier } from './interfaces/supplier.interface';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { PagedResult } from '../common/types/paged-result.type';
import { S3Service } from '../storage/s3.service';
import { PropostasService } from '../propostas/propostas.service';

@Injectable()
export class FornecedoresService {
  constructor(
    @Inject(SUPPLIER_REPOSITORY) private readonly repo: ISupplierRepository,
    private readonly s3: S3Service,
    private readonly propostasService: PropostasService,
  ) {}

  async findAll(agencyId: string): Promise<ISupplier[]> {
    return this.repo.findAll(agencyId);
  }

  async findPaged(agencyId: string, query: SupplierQueryDto): Promise<PagedResult<ISupplier>> {
    return this.repo.findPaged(agencyId, query);
  }

  async findById(id: string): Promise<ISupplier> {
    const supplier = await this.repo.findById(id);
    if (!supplier) throw new NotFoundException('Fornecedor não encontrado.');
    return supplier;
  }

  async create(dto: CreateSupplierDto, agencyId: string): Promise<ISupplier> {
    return this.repo.create({ ...dto, agencyId });
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<ISupplier> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Fornecedor não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Fornecedor não encontrado.');
    // Cascade: limpa o vínculo deste fornecedor em todos os blocos de propostas.
    await this.propostasService.unsetSupplierFromBlocks(id);
  }

  async uploadLogo(id: string, file: Express.Multer.File): Promise<ISupplier> {
    if (!file?.buffer?.length) throw new BadRequestException('Nenhum arquivo enviado.');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Arquivo deve ser uma imagem.');

    const webp = await (sharp as any)(file.buffer)
      .rotate()
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 86 })
      .toBuffer();

    const key = `avatars/fornecedores/${id}.webp`;
    const url = await this.s3.uploadFile(key, webp, 'image/webp');
    const logoUrl = `${url}?v=${Date.now()}`;

    const updated = await this.repo.update(id, { logoUrl });
    if (!updated) throw new NotFoundException('Fornecedor não encontrado.');
    return updated;
  }
}
