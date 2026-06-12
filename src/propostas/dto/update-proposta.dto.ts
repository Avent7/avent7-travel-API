import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsEnum, IsMongoId, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
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

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  passengerIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  clientIsTraveling?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  baseCurrency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  fxRates?: Record<string, number>;

  @ApiPropertyOptional({ description: 'Cidades visitadas por dia do roteiro (chave = nº do dia)', example: { '1': ['Roma'], '2': ['Florença', 'Pisa'] } })
  @IsOptional()
  @IsObject()
  citiesByDay?: Record<string, string[]>;
}
