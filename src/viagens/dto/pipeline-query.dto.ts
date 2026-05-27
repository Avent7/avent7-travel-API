import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ViagemStatus } from '../enums/viagem.enum';

export class PipelineQueryDto {
  @ApiPropertyOptional({ enum: ViagemStatus, description: 'Filtra por status específico (paginação de coluna)' })
  @IsOptional()
  @IsEnum(ViagemStatus)
  status?: ViagemStatus;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 5, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize?: number = 5;
}
