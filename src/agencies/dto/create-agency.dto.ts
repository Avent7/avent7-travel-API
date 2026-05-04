import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';

export class CreateAgencyDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ description: 'URL-safe slug', example: 'avent7-prive' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @ApiPropertyOptional({ enum: ['starter', 'pro', 'enterprise'] })
  @IsOptional()
  @IsEnum(['starter', 'pro', 'enterprise'])
  plan?: 'starter' | 'pro' | 'enterprise';
}
