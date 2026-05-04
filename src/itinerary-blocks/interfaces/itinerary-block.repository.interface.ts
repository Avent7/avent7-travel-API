import { IItineraryBlock } from './itinerary-block.interface';
import { CreateBlockDto } from '../dto/create-block.dto';
import { UpdateBlockDto } from '../dto/update-block.dto';

export const BLOCK_REPOSITORY = Symbol('IBlockRepository');

export interface IBlockRepository {
  findByItinerary(itineraryId: string): Promise<IItineraryBlock[]>;
  findById(id: string): Promise<IItineraryBlock | null>;
  create(dto: CreateBlockDto & { itineraryId: string }): Promise<IItineraryBlock>;
  update(id: string, dto: UpdateBlockDto): Promise<IItineraryBlock | null>;
  reorder(itineraryId: string, orderedIds: string[]): Promise<IItineraryBlock[]>;
  remove(id: string): Promise<boolean>;
}
