import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingMongooseRepository } from './repositories/booking.mongoose.repository';
import { BOOKING_REPOSITORY } from './interfaces/booking.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
  controllers: [BookingsController],
  providers: [
    BookingsService,
    { provide: BOOKING_REPOSITORY, useClass: BookingMongooseRepository },
  ],
  exports: [BookingsService],
})
export class BookingsModule {}
