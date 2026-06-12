import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SugerirBlocoDto {
  @ApiProperty({ example: 'experiencia', description: 'experiencia | restaurante — demais tipos não têm sugestão por IA' })
  @IsString()
  @IsIn(['experiencia', 'restaurante'])
  blockType: string;

  @ApiPropertyOptional({ example: 'Hotel boutique 5 estrelas perto do Coliseu, em Roma' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  hint?: string;

  @ApiPropertyOptional({ example: '2025-07-12' })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  passengers?: number;

  @ApiPropertyOptional({ example: 'Toscana Romântica 7 dias' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  propostaTitle?: string;

  @ApiPropertyOptional({ example: '2025-07-18' })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiPropertyOptional({ example: 7 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  totalNights?: number;

  @ApiPropertyOptional({ example: 'Dia 1: Hospedagem no Villa Medici\nDia 2: Experiência no Coliseu' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  contextSummary?: string;
}
