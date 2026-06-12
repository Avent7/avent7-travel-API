import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ImagesService } from './images.service';
import { Auth } from '../common/decorators/auth.decorator';

class ImageSearchQueryDto {
  @IsString()
  q: string;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(1)
  perPage?: number = 3;
}

@ApiTags('images')
@ApiBearerAuth()
@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Get('search')
  @Auth()
  @ApiOperation({ summary: 'Search images via Google Places (fallbacks: Unsplash, Pexels)' })
  search(@Query() query: ImageSearchQueryDto) {
    return this.imagesService.searchImages(query.q, query.page, query.perPage);
  }
}
