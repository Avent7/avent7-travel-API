import { IBriefingTemplate } from './briefing-template.interface';
import { CreateBriefingTemplateDto } from '../dto/create-briefing-template.dto';
import { UpdateBriefingTemplateDto } from '../dto/update-briefing-template.dto';
import { BriefingTemplateQueryDto } from '../dto/briefing-template-query.dto';
import { PagedResult } from '../../common/types/paged-result.type';

export const BRIEFING_TEMPLATE_REPOSITORY = Symbol('IBriefingTemplateRepository');

export interface IBriefingTemplateRepository {
  findPaged(agencyId: string, query: BriefingTemplateQueryDto): Promise<PagedResult<IBriefingTemplate>>;
  findById(id: string): Promise<IBriefingTemplate | null>;
  create(dto: CreateBriefingTemplateDto & { agencyId: string | null }): Promise<IBriefingTemplate>;
  update(id: string, dto: UpdateBriefingTemplateDto): Promise<IBriefingTemplate | null>;
  remove(id: string): Promise<boolean>;
}
