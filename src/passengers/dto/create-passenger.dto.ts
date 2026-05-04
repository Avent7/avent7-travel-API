import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsObject, IsOptional, IsString } from 'class-validator';
import { ClientSegment, Gender } from '../enums/passenger.enum';

export class CreatePassengerDto {
  @ApiProperty()
  @IsString()
  fullName: string;

  @ApiProperty()
  @IsEmail()
  emailPrimary: string;

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
  documents?: Record<string, string>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  travelPreferences?: Record<string, any>;
}
