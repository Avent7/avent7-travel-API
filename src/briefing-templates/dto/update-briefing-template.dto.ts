import { PartialType } from '@nestjs/swagger';
import { CreateBriefingTemplateDto } from './create-briefing-template.dto';

export class UpdateBriefingTemplateDto extends PartialType(CreateBriefingTemplateDto) {}
