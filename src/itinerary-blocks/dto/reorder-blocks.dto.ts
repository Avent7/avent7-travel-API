import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsMongoId } from 'class-validator';

export class ReorderBlocksDto {
  @ApiProperty({ type: [String], description: 'Ordered array of block IDs' })
  @IsArray()
  @IsMongoId({ each: true })
  orderedIds: string[];
}
