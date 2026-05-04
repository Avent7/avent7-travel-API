import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BLOCK_REPOSITORY, IBlockRepository } from './interfaces/itinerary-block.repository.interface';
import { IItineraryBlock } from './interfaces/itinerary-block.interface';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';

@Injectable()
export class ItineraryBlocksService {
  constructor(
    @Inject(BLOCK_REPOSITORY) private readonly repo: IBlockRepository,
  ) {}

  async findByItinerary(itineraryId: string): Promise<IItineraryBlock[]> {
    return this.repo.findByItinerary(itineraryId);
  }

  async findById(id: string): Promise<IItineraryBlock> {
    const block = await this.repo.findById(id);
    if (!block) throw new NotFoundException('Bloco não encontrado.');
    return block;
  }

  async create(itineraryId: string, dto: CreateBlockDto): Promise<IItineraryBlock> {
    return this.repo.create({ ...dto, itineraryId });
  }

  async update(id: string, dto: UpdateBlockDto): Promise<IItineraryBlock> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Bloco não encontrado.');
    return updated;
  }

  async reorder(itineraryId: string, orderedIds: string[]): Promise<IItineraryBlock[]> {
    return this.repo.reorder(itineraryId, orderedIds);
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Bloco não encontrado.');
  }
}
