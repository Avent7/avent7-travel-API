import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PropostasService } from './propostas.service';
import { CreatePropostaDto } from './dto/create-proposta.dto';
import { UpdatePropostaDto } from './dto/update-proposta.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('propostas')
@ApiBearerAuth()
@Controller('propostas')
export class PropostasController {
  constructor(
    private readonly propostasService: PropostasService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all propostas' })
  @ApiQuery({ name: 'tripId', required: false })
  findAll(@Query('tripId') tripId?: string) {
    const agencyId = this.requestContext.getAgencyId();
    if (tripId) {
      return this.propostasService.findByViagem(agencyId!, tripId);
    }
    return this.propostasService.findAll(agencyId!);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get proposta by id' })
  findOne(@Param('id') id: string) {
    return this.propostasService.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_proposta')
  @ApiOperation({ summary: 'Create a new proposta' })
  create(@Body() dto: CreatePropostaDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.propostasService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_proposta')
  @ApiOperation({ summary: 'Update proposta' })
  update(@Param('id') id: string, @Body() dto: UpdatePropostaDto) {
    return this.propostasService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_proposta')
  @ApiOperation({ summary: 'Delete proposta' })
  remove(@Param('id') id: string) {
    return this.propostasService.remove(id);
  }
}
