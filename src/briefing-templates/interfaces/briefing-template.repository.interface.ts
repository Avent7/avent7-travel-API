import { IBriefingTemplate } from './briefing-template.interface';
import { CreateBriefingTemplateDto } from '../dto/create-briefing-template.dto';
import { UpdateBriefingTemplateDto } from '../dto/update-briefing-template.dto';

export const BRIEFING_TEMPLATE_REPOSITORY = Symbol('IBriefingTemplateRepository');

export interface IBriefingTemplateRepository {
  findAllForAgency(agencyId: string): Promise<IBriefingTemplate[]>;
  findById(id: string): Promise<IBriefingTemplate | null>;
  create(dto: CreateBriefingTemplateDto & { agencyId: string | null }): Promise<IBriefingTemplate>;
  update(id: string, dto: UpdateBriefingTemplateDto): Promise<IBriefingTemplate | null>;
  remove(id: string): Promise<boolean>;
}
