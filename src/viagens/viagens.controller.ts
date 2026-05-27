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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ViagensService } from './viagens.service';
import { CreateViagemDto } from './dto/create-viagem.dto';
import { UpdateViagemDto } from './dto/update-viagem.dto';
import { ViagemQueryDto } from './dto/viagem-query.dto';
import { PipelineQueryDto } from './dto/pipeline-query.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('viagens')
@ApiBearerAuth()
@Controller('viagens')
export class ViagensController {
  constructor(
    private readonly viagensService: ViagensService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List viagens (paginated)' })
  findAll(@Query() query: ViagemQueryDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.viagensService.findPaged(agencyId!, query);
  }

  @Get('pipeline')
  @Auth()
  @ApiOperation({
    summary: 'Pipeline view — carrega viagens por coluna com populate de cliente/operador e contagens',
    description:
      'Sem `status`: retorna todas as colunas (carga inicial, 5 por status). ' +
      'Com `status`: retorna a página solicitada daquela coluna (scroll infinito).',
  })
  findPipeline(@Query() query: PipelineQueryDto) {
    const agencyId = this.requestContext.getAgencyId();
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 5;
    if (query.status) {
      return this.viagensService.findPipelineColumn(agencyId!, query.status, page, pageSize);
    }
    return this.viagensService.findPipelineAll(agencyId!, pageSize);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get viagem by id with briefings and propostas' })
  findOne(@Param('id') id: string) {
    const agencyId = this.requestContext.getAgencyId();
    return this.viagensService.findByIdDetail(id, agencyId!);
  }

  @Post()
  @Auth()
  @LogOperation('create_viagem')
  @ApiOperation({ summary: 'Create a new viagem' })
  create(@Body() dto: CreateViagemDto) {
    const agencyId = this.requestContext.getAgencyId();
    const userId = this.requestContext.getUserId();
    return this.viagensService.create(dto, agencyId!, userId);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_viagem')
  @ApiOperation({ summary: 'Update viagem' })
  update(@Param('id') id: string, @Body() dto: UpdateViagemDto) {
    return this.viagensService.update(id, dto);
  }

  @Post(':id/cover')
  @Auth()
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload viagem cover image' })
  uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.viagensService.uploadCover(id, file);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_viagem')
  @ApiOperation({ summary: 'Delete viagem' })
  remove(@Param('id') id: string) {
    return this.viagensService.remove(id);
  }
}
