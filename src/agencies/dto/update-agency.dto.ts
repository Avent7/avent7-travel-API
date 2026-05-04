import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateAgencyDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  brandConfig?: {
    logoUrl?: string;
    primaryColor?: string;
    accentColor?: string;
    customDomain?: string;
    supportEmail?: string;
    supportPhone?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  pricingConfig?: {
    defaultMarkupPct?: number;
    platformTakeRatePct?: number;
    minCommissionUsd?: number;
    serviceFeeFixed?: number;
    serviceFeeMode?: 'fixed' | 'pct';
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
