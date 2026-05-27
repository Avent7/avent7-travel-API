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
import { memoryStorage } from 'multer';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientQueryDto } from './dto/client-query.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('clients')
@ApiBearerAuth()
@Controller('clients')
export class ClientsController {
  constructor(
    private readonly clientsService: ClientsService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List clients (paginated, filterable)' })
  findAll(@Query() query: ClientQueryDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.clientsService.findPaged(agencyId!, query);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get client by id' })
  findOne(@Param('id') id: string) {
    return this.clientsService.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_client')
  @ApiOperation({ summary: 'Create a new client' })
  create(@Body() dto: CreateClientDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.clientsService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_client')
  @ApiOperation({ summary: 'Update client' })
  update(@Param('id') id: string, @Body() dto: UpdateClientDto) {
    return this.clientsService.update(id, dto);
  }

  @Post(':id/photo')
  @Auth()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload client photo' })
  uploadPhoto(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.clientsService.uploadPhoto(id, file);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_client')
  @ApiOperation({ summary: 'Delete client' })
  remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
