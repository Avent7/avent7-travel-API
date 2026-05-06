import { PartialType } from '@nestjs/swagger';
import { CreatePassengerDto } from './create-passenger.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdatePassengerDto extends PartialType(CreatePassengerDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
