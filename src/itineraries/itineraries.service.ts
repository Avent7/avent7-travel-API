import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ITINERARY_REPOSITORY, IItineraryRepository } from './interfaces/itinerary.repository.interface';
import { IItinerary } from './interfaces/itinerary.interface';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';

@Injectable()
export class ItinerariesService {
  constructor(
    @Inject(ITINERARY_REPOSITORY) private readonly repo: IItineraryRepository,
  ) {}

  private generateCode(): string {
    const ts = Date.now().toString(36).toUpperCase();
    return `ITN-${ts}`;
  }

  async findAll(agencyId: string): Promise<IItinerary[]> {
    return this.repo.findAll(agencyId);
  }

  async findByPassenger(agencyId: string, passengerId: string): Promise<IItinerary[]> {
    return this.repo.findByPassenger(agencyId, passengerId);
  }

  async findById(id: string): Promise<IItinerary> {
    const itn = await this.repo.findById(id);
    if (!itn) throw new NotFoundException('Itinerário não encontrado.');
    return itn;
  }

  async create(dto: CreateItineraryDto, agencyId: string): Promise<IItinerary> {
    const itineraryCode = this.generateCode();
    return this.repo.create({ ...dto, agencyId, itineraryCode });
  }

  async update(id: string, dto: UpdateItineraryDto): Promise<IItinerary> {
    const updated = await this.repo.update(id, dto);
    if (!updated) throw new NotFoundException('Itinerário não encontrado.');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const deleted = await this.repo.remove(id);
    if (!deleted) throw new NotFoundException('Itinerário não encontrado.');
  }
}
