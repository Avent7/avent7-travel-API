import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as sharp from 'sharp';
import { IPassengerRepository, PASSENGER_REPOSITORY, PassengerQuery } from './interfaces/passenger.repository.interface';
import { IPassenger, IPassengerPage } from './interfaces/passenger.interface';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { S3Service } from '../storage/s3.service';
import { ClientsService } from '../clients/clients.service';
import { ClientSegmentsService } from '../client-segments/client-segments.service';

@Injectable()
export class PassengersService {
  constructor(
    @Inject(PASSENGER_REPOSITORY) private readonly repo: IPassengerRepository,
    private readonly s3: S3Service,
    private readonly clientsService: ClientsService,
    private readonly segmentsService: ClientSegmentsService,
  ) {}

  async findAll(agencyId: string): Promise<IPassenger[]> {
    return this.repo.findAll(agencyId);
  }

  async findByClientId(clientId: string): Promise<IPassenger[]> {
    return this.repo.findByClientId(clientId);
  }

  async findPaginated(agencyId: string, query: PassengerQuery): Promise<IPassengerPage> {
    const [paged, segments] = await Promise.all([
      this.repo.findPaginated(agencyId, query),
      this.segmentsService.findAllForAgency(agencyId).catch(() => []),
    ]);
    return { ...paged, segments };
  }

  async findById(id: string): Promise<IPassenger> {
    const pax = await this.repo.findById(id);
    if (!pax) throw new NotFoundException('Passageiro não encontrado.');
    return pax;
  }

  async create(dto: CreatePassengerDto, agencyId: string): Promise<IPassenger> {
    const passenger = await this.repo.create({ ...dto, agencyId });
    await this.clientsService.incrementPassengerCount(dto.clientId, 1);
    return passenger;
  }

  async update(id: string, dto: UpdatePassengerDto): Promise<IPassenger> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Passageiro não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const passenger = await this.findById(id);
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Passageiro não encontrado.');
    await this.clientsService.incrementPassengerCount(passenger.clientId, -1);
  }

  async uploadPhoto(id: string, file: Express.Multer.File): Promise<IPassenger> {
    if (!file?.buffer?.length) throw new BadRequestException('Nenhum arquivo enviado.');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Arquivo deve ser uma imagem.');

    const webp = await (sharp as any)(file.buffer)
      .rotate()
      .resize(512, 512, { fit: 'cover' })
      .webp({ quality: 86 })
      .toBuffer();

    const key = `avatars/passageiros/${id}.webp`;
    const url = await this.s3.uploadFile(key, webp, 'image/webp');
    const photoUrl = `${url}?v=${Date.now()}`;

    const updated = await this.repo.update(id, { photoUrl });
    if (!updated) throw new NotFoundException('Passageiro não encontrado.');
    return updated;
  }
}
