import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TripStyle, TripType } from '../enums/briefing.enum';

export class CreateBriefingDto {
  @ApiProperty({ description: 'ID do template de briefing' })
  @IsMongoId()
  templateId: string;

  @ApiPropertyOptional({ description: 'ID da viagem (opcional)' })
  @IsOptional()
  @IsMongoId()
  viagemId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  passengerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  expiresAt?: string;

  // Legacy optional fields
  @ApiPropertyOptional({ enum: TripType })
  @IsOptional()
  @IsEnum(TripType)
  tripType?: TripType;

  @ApiPropertyOptional({ enum: TripStyle })
  @IsOptional()
  @IsEnum(TripStyle)
  tripStyle?: TripStyle;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  destinations?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalNights?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  adultCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  childCount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  budgetUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
