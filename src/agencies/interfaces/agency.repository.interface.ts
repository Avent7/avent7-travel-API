import { IAgency } from './agency.interface';
import { CreateAgencyDto } from '../dto/create-agency.dto';
import { UpdateAgencyDto } from '../dto/update-agency.dto';

export const AGENCY_REPOSITORY = Symbol('IAgencyRepository');

export interface IAgencyRepository {
  findById(id: string): Promise<IAgency | null>;
  findBySlug(slug: string): Promise<IAgency | null>;
  create(dto: CreateAgencyDto): Promise<IAgency>;
  update(id: string, dto: UpdateAgencyDto): Promise<IAgency | null>;
}
