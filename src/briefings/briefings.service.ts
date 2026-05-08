import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BRIEFING_REPOSITORY, IBriefingRepository } from './interfaces/briefing.repository.interface';
import { IBriefing } from './interfaces/briefing.interface';
import { CreateBriefingDto } from './dto/create-briefing.dto';
import { UpdateBriefingDto } from './dto/update-briefing.dto';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';
import { BriefingDocumentStatus, BriefingStatus } from './enums/briefing.enum';
import { BriefingTemplatesService } from '../briefing-templates/briefing-templates.service';
import { IBriefingSection } from '../briefing-templates/interfaces/briefing-template.interface';

export interface IPublicBriefingForm {
  templateId: string;
  templateName: string;
  sections: IBriefingSection[];
  note: string | null;
  expiresAt: Date | null;
}

@Injectable()
export class BriefingsService {
  constructor(
    @Inject(BRIEFING_REPOSITORY) private readonly repo: IBriefingRepository,
    private readonly templatesService: BriefingTemplatesService,
  ) {}

  async findAll(agencyId: string): Promise<IBriefing[]> {
    return this.repo.findAll(agencyId);
  }

  async findByViagem(agencyId: string, viagemId: string): Promise<IBriefing[]> {
    return this.repo.findByViagem(agencyId, viagemId);
  }

  async findById(id: string): Promise<IBriefing> {
    const briefing = await this.repo.findById(id);
    if (!briefing) throw new NotFoundException('Briefing não encontrado.');
    return briefing;
  }

  async create(dto: CreateBriefingDto, agencyId: string): Promise<IBriefing> {
    const briefing = await this.repo.create({ ...dto, agencyId });
    const publicUrl = `/briefing/${briefing.id}`;
    const updated = await this.repo.update(briefing.id, { publicUrl } as UpdateBriefingDto);
    return updated ?? briefing;
  }

  async update(id: string, dto: UpdateBriefingDto): Promise<IBriefing> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Briefing não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Briefing não encontrado.');
  }

  async getPublicBriefing(briefingId: string): Promise<IPublicBriefingForm> {
    const briefing = await this.repo.findById(briefingId);
    if (!briefing) throw new NotFoundException('Briefing não encontrado.');

    if (briefing.expiresAt && new Date() > new Date(briefing.expiresAt)) {
      throw new NotFoundException('Este briefing expirou.');
    }

    if (!briefing.templateId) {
      throw new NotFoundException('Template de briefing não configurado.');
    }

    const template = await this.templatesService.findById(briefing.templateId);

    return {
      templateId: template.id,
      templateName: template.name,
      sections: template.sections,
      note: briefing.note,
      expiresAt: briefing.expiresAt,
    };
  }

  async submitPublicBriefing(briefingId: string, dto: SubmitBriefingDto): Promise<IBriefing> {
    const briefing = await this.repo.findById(briefingId);
    if (!briefing) throw new NotFoundException('Briefing não encontrado.');

    const updated = await this.repo.update(briefingId, {
      clientInfo: {
        name: dto.clientName,
        email: dto.clientEmail,
        phone: dto.clientPhone,
        cityRegion: dto.clientCityRegion,
      },
      answers: dto.answers,
      briefingDocumentStatus: BriefingDocumentStatus.SUBMITTED,
      status: BriefingStatus.COMPLETED,
    } as UpdateBriefingDto);

    if (!updated) throw new NotFoundException('Briefing não encontrado.');
    return updated;
  }
}
