import { IBriefing } from './briefing.interface';
import { CreateBriefingDto } from '../dto/create-briefing.dto';
import { UpdateBriefingDto } from '../dto/update-briefing.dto';

export const BRIEFING_REPOSITORY = Symbol('IBriefingRepository');

export interface IBriefingRepository {
  findAll(agencyId: string): Promise<IBriefing[]>;
  findByPassenger(agencyId: string, passengerId: string): Promise<IBriefing[]>;
  findById(id: string): Promise<IBriefing | null>;
  create(dto: CreateBriefingDto & { agencyId: string }): Promise<IBriefing>;
  update(id: string, dto: UpdateBriefingDto): Promise<IBriefing | null>;
  remove(id: string): Promise<boolean>;
}
