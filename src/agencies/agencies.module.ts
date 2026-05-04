import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Agency, AgencySchema } from './schemas/agency.schema';
import { AgenciesService } from './agencies.service';
import { AgenciesController } from './agencies.controller';
import { AgencyMongooseRepository } from './repositories/agency.mongoose.repository';
import { AGENCY_REPOSITORY } from './interfaces/agency.repository.interface';

@Module({
  imports: [MongooseModule.forFeature([{ name: Agency.name, schema: AgencySchema }])],
  controllers: [AgenciesController],
  providers: [
    AgenciesService,
    { provide: AGENCY_REPOSITORY, useClass: AgencyMongooseRepository },
  ],
  exports: [AgenciesService],
})
export class AgenciesModule {}
