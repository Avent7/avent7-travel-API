import { IBooking } from './booking.interface';
import { CreateBookingDto } from '../dto/create-booking.dto';
import { BookingStatus } from '../enums/booking.enum';

export const BOOKING_REPOSITORY = Symbol('IBookingRepository');

export interface IBookingRepository {
  findAll(agencyId: string): Promise<IBooking[]>;
  findByItinerary(itineraryId: string): Promise<IBooking[]>;
  findById(id: string): Promise<IBooking | null>;
  create(dto: CreateBookingDto & { agencyId: string }): Promise<IBooking>;
  updateStatus(id: string, status: BookingStatus, extra?: Partial<IBooking>): Promise<IBooking | null>;
  remove(id: string): Promise<boolean>;
}
