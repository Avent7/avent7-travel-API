import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BriefingTemplatesService } from './briefing-templates.service';
import { CreateBriefingTemplateDto } from './dto/create-briefing-template.dto';
import { UpdateBriefingTemplateDto } from './dto/update-briefing-template.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';

@ApiTags('briefing-templates')
@ApiBearerAuth()
@Controller('briefing-templates')
export class BriefingTemplatesController {
  constructor(
    private readonly service: BriefingTemplatesService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List briefing templates for the agency' })
  findAll() {
    const agencyId = this.requestContext.getAgencyId();
    return this.service.findAllForAgency(agencyId!);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get briefing template by id' })
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  @Auth()
  @ApiOperation({ summary: 'Create briefing template' })
  create(@Body() dto: CreateBriefingTemplateDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.service.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @ApiOperation({ summary: 'Update briefing template' })
  update(@Param('id') id: string, @Body() dto: UpdateBriefingTemplateDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete briefing template' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
