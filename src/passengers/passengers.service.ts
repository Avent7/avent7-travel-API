import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { IPassengerRepository, PASSENGER_REPOSITORY } from './interfaces/passenger.repository.interface';
import { IPassenger } from './interfaces/passenger.interface';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';

@Injectable()
export class PassengersService {
  constructor(
    @Inject(PASSENGER_REPOSITORY) private readonly repo: IPassengerRepository,
  ) {}

  private generateClientCode(): string {
    const ts = Date.now().toString(36).toUpperCase();
    return `AP-${ts}`;
  }

  async findAll(agencyId: string): Promise<IPassenger[]> {
    return this.repo.findAll(agencyId);
  }

  async findById(id: string): Promise<IPassenger> {
    const pax = await this.repo.findById(id);
    if (!pax) throw new NotFoundException('Passageiro não encontrado.');
    return pax;
  }

  async create(dto: CreatePassengerDto, agencyId: string): Promise<IPassenger> {
    const clientCode = this.generateClientCode();
    return this.repo.create({ ...dto, agencyId, clientCode });
  }

  async update(id: string, dto: UpdatePassengerDto): Promise<IPassenger> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Passageiro não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Passageiro não encontrado.');
  }
}
