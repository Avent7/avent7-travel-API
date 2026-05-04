import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsMongoId, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { Provider } from '../enums/booking.enum';

export class CreateBookingDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  itineraryId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  blockId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  passengerId?: string;

  @ApiProperty({ enum: Provider })
  @IsEnum(Provider)
  provider: Provider;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  providerBookingRef?: string;

  @ApiProperty()
  @IsNumber()
  netCostUsd: number;

  @ApiProperty()
  @IsNumber()
  saleUsd: number;

  @ApiProperty()
  @IsNumber()
  markupUsd: number;

  @ApiProperty()
  @IsNumber()
  platformFeeUsd: number;

  @ApiProperty()
  @IsNumber()
  agencyProfitUsd: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  serviceFeeUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  pricingSnapshot?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notes?: string;
}
