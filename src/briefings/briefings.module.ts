import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Briefing, BriefingSchema } from './schemas/briefing.schema';
import { BriefingsService } from './briefings.service';
import { BriefingsController } from './briefings.controller';
import { BriefingMongooseRepository } from './repositories/briefing.mongoose.repository';
import { BRIEFING_REPOSITORY } from './interfaces/briefing.repository.interface';
import { BriefingTemplatesModule } from '../briefing-templates/briefing-templates.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Briefing.name, schema: BriefingSchema }]),
    BriefingTemplatesModule,
  ],
  controllers: [BriefingsController],
  providers: [
    BriefingsService,
    { provide: BRIEFING_REPOSITORY, useClass: BriefingMongooseRepository },
  ],
  exports: [BriefingsService],
})
export class BriefingsModule {}
