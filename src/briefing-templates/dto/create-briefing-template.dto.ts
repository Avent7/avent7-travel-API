import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FieldOptionDto {
  @IsString()
  label: string;

  @IsString()
  value: string;
}

export class DependsOnDto {
  @IsString()
  field: string;

  value: string | string[];
}

export class BriefingFieldDto {
  @IsString()
  id: string;

  @IsString()
  label: string;

  @IsEnum(['text', 'textarea', 'number', 'date', 'select', 'radio', 'checkbox', 'checkbox-group'])
  type: 'text' | 'textarea' | 'number' | 'date' | 'select' | 'radio' | 'checkbox' | 'checkbox-group';

  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldOptionDto)
  options?: FieldOptionDto[];

  @IsOptional()
  @IsString()
  placeholder?: string;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DependsOnDto)
  dependsOn?: DependsOnDto;
}

export class BriefingSectionDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BriefingFieldDto)
  fields: BriefingFieldDto[];
}

export class CreateBriefingTemplateDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isGlobal?: boolean;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [BriefingSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BriefingSectionDto)
  sections: BriefingSectionDto[];
}
