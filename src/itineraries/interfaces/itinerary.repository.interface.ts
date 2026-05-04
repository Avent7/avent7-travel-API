import { IItinerary } from './itinerary.interface';
import { CreateItineraryDto } from '../dto/create-itinerary.dto';
import { UpdateItineraryDto } from '../dto/update-itinerary.dto';

export const ITINERARY_REPOSITORY = Symbol('IItineraryRepository');

export interface IItineraryRepository {
  findAll(agencyId: string): Promise<IItinerary[]>;
  findByPassenger(agencyId: string, passengerId: string): Promise<IItinerary[]>;
  findById(id: string): Promise<IItinerary | null>;
  create(dto: CreateItineraryDto & { agencyId: string; itineraryCode: string }): Promise<IItinerary>;
  update(id: string, dto: UpdateItineraryDto): Promise<IItinerary | null>;
  remove(id: string): Promise<boolean>;
}
