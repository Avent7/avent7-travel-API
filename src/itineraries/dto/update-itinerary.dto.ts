import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ItineraryStatus } from '../enums/itinerary.enum';

export class UpdateItineraryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ enum: ItineraryStatus })
  @IsOptional()
  @IsEnum(ItineraryStatus)
  status?: ItineraryStatus;

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
  totalCostUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalSaleUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  totalMarkupUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  platformFeeUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  agencyProfitUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  heroImageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  clientMessage?: string;
}
