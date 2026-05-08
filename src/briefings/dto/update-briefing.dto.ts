import { PartialType } from '@nestjs/swagger';
import { CreateBriefingDto } from './create-briefing.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { BriefingDocumentStatus, BriefingStatus } from '../enums/briefing.enum';
import { IClientInfo } from '../interfaces/briefing.interface';

export class UpdateBriefingDto extends PartialType(CreateBriefingDto) {
  @ApiPropertyOptional({ enum: BriefingStatus })
  @IsOptional()
  @IsEnum(BriefingStatus)
  status?: BriefingStatus;

  @ApiPropertyOptional({ enum: BriefingDocumentStatus })
  @IsOptional()
  @IsEnum(BriefingDocumentStatus)
  briefingDocumentStatus?: BriefingDocumentStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publicUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  answers?: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  clientInfo?: IClientInfo;
}
