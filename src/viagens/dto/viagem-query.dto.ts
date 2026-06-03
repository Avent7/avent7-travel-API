import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';
import { ViagemStatus } from '../enums/viagem.enum';

export const VIAGEM_SORT_FIELDS = ['title', 'status', 'createdAt', 'clientName', 'createdByName'] as const;

export class ViagemQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  clientId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  pageSize?: number = 10;

  @ApiPropertyOptional({ enum: ViagemStatus })
  @IsOptional()
  @IsEnum(ViagemStatus)
  status?: ViagemStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: VIAGEM_SORT_FIELDS })
  @IsOptional()
  @IsIn(VIAGEM_SORT_FIELDS as unknown as string[])
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
