import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Itinerary, ItinerarySchema } from './schemas/itinerary.schema';
import { ItinerariesService } from './itineraries.service';
import { ItinerariesController } from './itineraries.controller';
import { ItineraryMongooseRepository } from './repositories/itinerary.mongoose.repository';
import { ITINERARY_REPOSITORY } from './interfaces/itinerary.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: Itinerary.name, schema: ItinerarySchema }])],
  controllers: [ItinerariesController],
  providers: [
    ItinerariesService,
    { provide: ITINERARY_REPOSITORY, useClass: ItineraryMongooseRepository },
  ],
  exports: [ItinerariesService],
})
export class ItinerariesModule {}
