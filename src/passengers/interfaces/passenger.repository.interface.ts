import { IPassenger } from './passenger.interface';
import { CreatePassengerDto } from '../dto/create-passenger.dto';
import { UpdatePassengerDto } from '../dto/update-passenger.dto';

export const PASSENGER_REPOSITORY = Symbol('IPassengerRepository');

export interface IPassengerRepository {
  findAll(agencyId: string): Promise<IPassenger[]>;
  findById(id: string): Promise<IPassenger | null>;
  findByClientCode(clientCode: string): Promise<IPassenger | null>;
  create(dto: CreatePassengerDto & { agencyId: string; clientCode: string }): Promise<IPassenger>;
  update(id: string, dto: UpdatePassengerDto): Promise<IPassenger | null>;
  remove(id: string): Promise<boolean>;
}
