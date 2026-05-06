import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsObject, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { Gender } from '../enums/passenger.enum';

export class CreatePassengerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty()
  @IsString()
  fullName: string;

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
  @IsObject()
  documents?: {
    passportNumber?: string;
    passportExpiry?: string;
    passportCountry?: string;
    visaInfo?: string;
  };

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  travelPreferences?: Record<string, any>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  emergencyContact?: Record<string, string>;
}
