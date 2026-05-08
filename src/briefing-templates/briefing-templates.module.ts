import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BriefingTemplate,
  BriefingTemplateSchema,
} from './schemas/briefing-template.schema';
import { BriefingTemplatesService } from './briefing-templates.service';
import { BriefingTemplatesController } from './briefing-templates.controller';
import { BriefingTemplateMongooseRepository } from './repositories/briefing-template.mongoose.repository';
import { BRIEFING_TEMPLATE_REPOSITORY } from './interfaces/briefing-template.repository.interface';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BriefingTemplate.name, schema: BriefingTemplateSchema },
    ]),
  ],
  controllers: [BriefingTemplatesController],
  providers: [
    BriefingTemplatesService,
    { provide: BRIEFING_TEMPLATE_REPOSITORY, useClass: BriefingTemplateMongooseRepository },
  ],
  exports: [BriefingTemplatesService],
})
export class BriefingTemplatesModule {}
