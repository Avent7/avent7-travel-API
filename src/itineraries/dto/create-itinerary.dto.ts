import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class CreateItineraryDto {
  @ApiProperty()
  @IsMongoId()
  passengerId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsMongoId()
  briefingId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;
}
