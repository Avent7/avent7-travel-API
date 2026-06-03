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
import { FornecedoresService } from './fornecedores.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { SupplierQueryDto } from './dto/supplier-query.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('fornecedores')
@ApiBearerAuth()
@Controller('fornecedores')
export class FornecedoresController {
  constructor(
    private readonly fornecedoresService: FornecedoresService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List suppliers (paginated, filterable)' })
  findAll(@Query() query: SupplierQueryDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.fornecedoresService.findPaged(agencyId!, query);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get supplier by id' })
  findOne(@Param('id') id: string) {
    return this.fornecedoresService.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_supplier')
  @ApiOperation({ summary: 'Create a new supplier' })
  create(@Body() dto: CreateSupplierDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.fornecedoresService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_supplier')
  @ApiOperation({ summary: 'Update supplier' })
  update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.fornecedoresService.update(id, dto);
  }

  @Post(':id/logo')
  @Auth()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload supplier logo' })
  uploadLogo(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.fornecedoresService.uploadLogo(id, file);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_supplier')
  @ApiOperation({ summary: 'Delete supplier' })
  remove(@Param('id') id: string) {
    return this.fornecedoresService.remove(id);
  }
}
