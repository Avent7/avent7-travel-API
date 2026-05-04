import { PartialType } from '@nestjs/swagger';
import { CreateBriefingDto } from './create-briefing.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { BriefingStatus } from '../enums/briefing.enum';

export class UpdateBriefingDto extends PartialType(CreateBriefingDto) {
  @ApiPropertyOptional({ enum: BriefingStatus })
  @IsOptional()
  @IsEnum(BriefingStatus)
  status?: BriefingStatus;
}
