import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ItineraryBlocksService } from './itinerary-blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('itinerary-blocks')
@ApiBearerAuth()
@Controller('itineraries/:itineraryId/blocks')
export class ItineraryBlocksController {
  constructor(private readonly service: ItineraryBlocksService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all blocks of an itinerary (sorted by sortOrder)' })
  findAll(@Param('itineraryId') itineraryId: string) {
    return this.service.findByItinerary(itineraryId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get block by id' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_block')
  @ApiOperation({ summary: 'Add a block to an itinerary' })
  create(@Param('itineraryId') itineraryId: string, @Body() dto: CreateBlockDto) {
    return this.service.create(itineraryId, dto);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_block')
  @ApiOperation({ summary: 'Update a block' })
  update(@Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.service.update(id, dto);
  }

  @Put('reorder')
  @Auth()
  @LogOperation('reorder_blocks')
  @ApiOperation({ summary: 'Reorder blocks (drag-and-drop)' })
  reorder(@Param('itineraryId') itineraryId: string, @Body() dto: ReorderBlocksDto) {
    return this.service.reorder(itineraryId, dto.orderedIds);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_block')
  @ApiOperation({ summary: 'Delete a block' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
