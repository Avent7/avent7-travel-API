import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class SetupAgencyDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'URL-safe slug', example: 'minha-agencia' })
  @IsString()
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @ApiPropertyOptional({ enum: ['starter', 'pro', 'enterprise'] })
  @IsOptional()
  @IsEnum(['starter', 'pro', 'enterprise'])
  plan?: 'starter' | 'pro' | 'enterprise';
}
