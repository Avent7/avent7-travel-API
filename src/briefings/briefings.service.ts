import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BRIEFING_REPOSITORY, IBriefingRepository } from './interfaces/briefing.repository.interface';
import { IBriefing } from './interfaces/briefing.interface';
import { CreateBriefingDto } from './dto/create-briefing.dto';
import { UpdateBriefingDto } from './dto/update-briefing.dto';

@Injectable()
export class BriefingsService {
  constructor(
    @Inject(BRIEFING_REPOSITORY) private readonly repo: IBriefingRepository,
  ) {}

  async findAll(agencyId: string): Promise<IBriefing[]> {
    return this.repo.findAll(agencyId);
  }

  async findByPassenger(agencyId: string, passengerId: string): Promise<IBriefing[]> {
    return this.repo.findByPassenger(agencyId, passengerId);
  }

  async findById(id: string): Promise<IBriefing> {
    const briefing = await this.repo.findById(id);
    if (!briefing) throw new NotFoundException('Briefing não encontrado.');
    return briefing;
  }

  async create(dto: CreateBriefingDto, agencyId: string): Promise<IBriefing> {
    return this.repo.create({ ...dto, agencyId });
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
}
