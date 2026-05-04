import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ItineraryBlock, ItineraryBlockSchema } from './schemas/itinerary-block.schema';
import { ItineraryBlocksService } from './itinerary-blocks.service';
import { ItineraryBlocksController } from './itinerary-blocks.controller';
import { BlockMongooseRepository } from './repositories/itinerary-block.mongoose.repository';
import { BLOCK_REPOSITORY } from './interfaces/itinerary-block.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: ItineraryBlock.name, schema: ItineraryBlockSchema }])],
  controllers: [ItineraryBlocksController],
  providers: [
    ItineraryBlocksService,
    { provide: BLOCK_REPOSITORY, useClass: BlockMongooseRepository },
  ],
  exports: [ItineraryBlocksService],
})
export class ItineraryBlocksModule {}
