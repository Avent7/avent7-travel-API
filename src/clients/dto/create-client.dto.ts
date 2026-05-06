import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ClientSegment, DocumentType, Gender } from '../enums/client.enum';

export class PrimaryDocumentDto {
  @ApiProperty({ enum: DocumentType })
  @IsEnum(DocumentType)
  type: DocumentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiProperty({ example: 'BR' })
  @IsString()
  @IsNotEmpty()
  country: string;
}

export class CreateClientDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  emailPrimary: string;

  @ApiProperty({ type: PrimaryDocumentDto })
  @ValidateNested()
  @Type(() => PrimaryDocumentDto)
  primaryDocument: PrimaryDocumentDto;

  @ApiPropertyOptional({ enum: ClientSegment })
  @IsOptional()
  @IsEnum(ClientSegment)
  segment?: ClientSegment;

  @ApiPropertyOptional({ enum: Gender })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  socialName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  company?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailSecondary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phonePrimary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneAlternative?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  address?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  travelPreferences?: Record<string, any>;
}
