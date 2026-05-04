import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { BlockType } from '../enums/block.enum';

export class CreateBlockDto {
  @ApiProperty({ enum: BlockType })
  @IsEnum(BlockType)
  blockType: BlockType;

  @ApiProperty()
  @IsNumber()
  dayNumber: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  locationName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  costUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  saleUsd?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  markupPct?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  blockData?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isConfirmed?: boolean;
}
