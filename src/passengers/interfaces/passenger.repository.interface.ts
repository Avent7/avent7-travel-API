import { IPassenger, IPassengerPage } from './passenger.interface';
import { CreatePassengerDto } from '../dto/create-passenger.dto';
import { UpdatePassengerDto } from '../dto/update-passenger.dto';

export const PASSENGER_REPOSITORY = Symbol('IPassengerRepository');

export interface PassengerQuery {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
}

export interface IPassengerRepository {
  findAll(agencyId: string): Promise<IPassenger[]>;
  findByClientId(clientId: string): Promise<IPassenger[]>;
  findPaginated(agencyId: string, query: PassengerQuery): Promise<IPassengerPage>;
  findById(id: string): Promise<IPassenger | null>;
  create(dto: CreatePassengerDto & { agencyId: string }): Promise<IPassenger>;
  update(id: string, dto: UpdatePassengerDto): Promise<IPassenger | null>;
  remove(id: string): Promise<boolean>;
}
