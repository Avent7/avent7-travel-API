import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsMongoId, IsOptional, IsString, Max, Min } from 'class-validator';

export const CLIENT_SORT_FIELDS = [
  'fullName',
  'emailPrimary',
  'phonePrimary',
  'isActive',
  'tripCount',
  'passengerCount',
  'createdAt',
  'segmentName',
] as const;

export class ClientQueryDto {
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  segmentId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ enum: CLIENT_SORT_FIELDS })
  @IsOptional()
  @IsIn(CLIENT_SORT_FIELDS as unknown as string[])
  sortBy?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';
}
