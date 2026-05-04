import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { TripStyle, TripType } from '../enums/briefing.enum';

export class CreateBriefingDto {
  @ApiProperty()
  @IsMongoId()
  passengerId: string;

  @ApiProperty({ enum: TripType })
  @IsEnum(TripType)
  tripType: TripType;

  @ApiProperty({ enum: TripStyle })
  @IsEnum(TripStyle)
  tripStyle: TripStyle;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  destinations: string[];

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

  @ApiProperty()
  @IsNumber()
  adultCount: number;

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
