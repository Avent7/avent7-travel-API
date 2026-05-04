import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { BOOKING_REPOSITORY, IBookingRepository } from './interfaces/booking.repository.interface';
import { IBooking } from './interfaces/booking.interface';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingStatus } from './enums/booking.enum';

@Injectable()
export class BookingsService {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly repo: IBookingRepository,
  ) {}

  async findAll(agencyId: string): Promise<IBooking[]> {
    return this.repo.findAll(agencyId);
  }

  async findByItinerary(itineraryId: string): Promise<IBooking[]> {
    return this.repo.findByItinerary(itineraryId);
  }

  async findById(id: string): Promise<IBooking> {
    const booking = await this.repo.findById(id);
    if (!booking) throw new NotFoundException('Reserva não encontrada.');
    return booking;
  }

  async create(dto: CreateBookingDto, agencyId: string): Promise<IBooking> {
    return this.repo.create({ ...dto, agencyId });
  }

  async confirm(id: string): Promise<IBooking> {
    const updated = await this.repo.updateStatus(id, BookingStatus.CONFIRMED);
    if (!updated) throw new NotFoundException('Reserva não encontrada.');
    return updated;
  }

  async cancel(id: string): Promise<IBooking> {
    const updated = await this.repo.updateStatus(id, BookingStatus.CANCELLED);
    if (!updated) throw new NotFoundException('Reserva não encontrada.');
    return updated;
  }
}
