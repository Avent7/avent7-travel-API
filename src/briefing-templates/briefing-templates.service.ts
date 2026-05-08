import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  BRIEFING_TEMPLATE_REPOSITORY,
  IBriefingTemplateRepository,
} from './interfaces/briefing-template.repository.interface';
import { IBriefingTemplate } from './interfaces/briefing-template.interface';
import { CreateBriefingTemplateDto } from './dto/create-briefing-template.dto';
import { UpdateBriefingTemplateDto } from './dto/update-briefing-template.dto';

@Injectable()
export class BriefingTemplatesService {
  constructor(
    @Inject(BRIEFING_TEMPLATE_REPOSITORY)
    private readonly repo: IBriefingTemplateRepository,
  ) {}

  async findAllForAgency(agencyId: string): Promise<IBriefingTemplate[]> {
    return this.repo.findAllForAgency(agencyId);
  }

  async findById(id: string): Promise<IBriefingTemplate> {
    const template = await this.repo.findById(id);
    if (!template) throw new NotFoundException('Template não encontrado.');
    return template;
  }

  async create(dto: CreateBriefingTemplateDto, agencyId: string): Promise<IBriefingTemplate> {
    return this.repo.create({ ...dto, agencyId });
  }

  async update(id: string, dto: UpdateBriefingTemplateDto): Promise<IBriefingTemplate> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Template não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Template não encontrado.');
  }
}
