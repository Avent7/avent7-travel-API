import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Proposta, PropostaSchema } from '../propostas/schemas/proposta.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Proposta.name, schema: PropostaSchema },
      { name: Booking.name, schema: BookingSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
