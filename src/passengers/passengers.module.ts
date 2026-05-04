import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Passenger, PassengerSchema } from './schemas/passenger.schema';
import { PassengersService } from './passengers.service';
import { PassengersController } from './passengers.controller';
import { PassengerMongooseRepository } from './repositories/passenger.mongoose.repository';
import { PASSENGER_REPOSITORY } from './interfaces/passenger.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: Passenger.name, schema: PassengerSchema }])],
  controllers: [PassengersController],
  providers: [
    PassengersService,
    { provide: PASSENGER_REPOSITORY, useClass: PassengerMongooseRepository },
  ],
  exports: [PassengersService],
})
export class PassengersModule {}
