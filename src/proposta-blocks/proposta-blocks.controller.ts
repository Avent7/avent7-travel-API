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
import { PropostaBlocksService } from './proposta-blocks.service';
import { CreateBlockDto } from './dto/create-block.dto';
import { UpdateBlockDto } from './dto/update-block.dto';
import { ReorderBlocksDto } from './dto/reorder-blocks.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('proposta-blocks')
@ApiBearerAuth()
@Controller('propostas/:propostaId/blocks')
export class PropostaBlocksController {
  constructor(private readonly service: PropostaBlocksService) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all blocks of a proposta' })
  findAll(@Param('propostaId') propostaId: string) {
    return this.service.findByProposta(propostaId);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get block by id' })
  findOne(@Param('propostaId') propostaId: string, @Param('id') id: string) {
    return this.service.findById(propostaId, id);
  }

  @Post()
  @Auth()
  @LogOperation('create_block')
  @ApiOperation({ summary: 'Add a block to a proposta' })
  create(@Param('propostaId') propostaId: string, @Body() dto: CreateBlockDto) {
    return this.service.create(propostaId, dto);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_block')
  @ApiOperation({ summary: 'Update a block' })
  update(@Param('propostaId') propostaId: string, @Param('id') id: string, @Body() dto: UpdateBlockDto) {
    return this.service.update(propostaId, id, dto);
  }

  @Put('reorder')
  @Auth()
  @LogOperation('reorder_blocks')
  @ApiOperation({ summary: 'Reorder blocks (drag-and-drop)' })
  reorder(@Param('propostaId') propostaId: string, @Body() dto: ReorderBlocksDto) {
    return this.service.reorder(propostaId, dto.orderedIds);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_block')
  @ApiOperation({ summary: 'Delete a block' })
  remove(@Param('propostaId') propostaId: string, @Param('id') id: string) {
    return this.service.remove(propostaId, id);
  }
}
