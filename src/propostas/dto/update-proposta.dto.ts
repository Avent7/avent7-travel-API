import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsMongoId, IsNumber, IsOptional, IsString } from 'class-validator';
import { PropostaStatus } from '../enums/proposta.enum';

export class UpdatePropostaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  briefingId?: string;

  @ApiPropertyOptional({ enum: PropostaStatus })
  @IsOptional()
  @IsEnum(PropostaStatus)
  status?: PropostaStatus;

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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  destinations?: string[];
}
