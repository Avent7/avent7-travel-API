import {
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

  async findByClientId(clientId: string): Promise<IPassenger[]> {
    return this.repo.findByClientId(clientId);
  }

  async findById(id: string): Promise<IPassenger> {
    const pax = await this.repo.findById(id);
    if (!pax) throw new NotFoundException('Passageiro não encontrado.');
    return pax;
  }

  async create(dto: CreatePassengerDto, agencyId: string): Promise<IPassenger> {
    return this.repo.create({ ...dto, agencyId });
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
