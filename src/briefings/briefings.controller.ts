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
import { BriefingsService } from './briefings.service';
import { CreateBriefingDto } from './dto/create-briefing.dto';
import { UpdateBriefingDto } from './dto/update-briefing.dto';
import { SubmitBriefingDto } from './dto/submit-briefing.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('briefings')
@Controller('briefings')
export class BriefingsController {
  constructor(
    private readonly briefingsService: BriefingsService,
    private readonly requestContext: RequestContextService,
  ) {}

  // ─── Public endpoints (no auth) ───────────────────────────────────────────

  @Get('public/:id')
  @ApiOperation({ summary: 'Get public briefing form (no auth)' })
  getPublicBriefing(@Param('id') id: string) {
    return this.briefingsService.getPublicBriefing(id);
  }

  @Post('public/:id/submit')
  @HttpCode(200)
  @ApiOperation({ summary: 'Submit public briefing (no auth)' })
  submitPublicBriefing(@Param('id') id: string, @Body() dto: SubmitBriefingDto) {
    return this.briefingsService.submitPublicBriefing(id, dto);
  }

  // ─── Authenticated endpoints ──────────────────────────────────────────────

  @Get()
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all briefings' })
  @ApiQuery({ name: 'viagemId', required: false })
  findAll(@Query('viagemId') viagemId?: string) {
    const agencyId = this.requestContext.getAgencyId();
    if (viagemId) {
      return this.briefingsService.findByViagem(agencyId!, viagemId);
    }
    return this.briefingsService.findAll(agencyId!);
  }

  @Get(':id')
  @Auth()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get briefing by id' })
  findOne(@Param('id') id: string) {
    return this.briefingsService.findById(id);
  }

  @Post()
  @Auth()
  @ApiBearerAuth()
  @LogOperation('create_briefing')
  @ApiOperation({ summary: 'Create a new briefing' })
  create(@Body() dto: CreateBriefingDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.briefingsService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @ApiBearerAuth()
  @LogOperation('update_briefing')
  @ApiOperation({ summary: 'Update briefing' })
  update(@Param('id') id: string, @Body() dto: UpdateBriefingDto) {
    return this.briefingsService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @ApiBearerAuth()
  @HttpCode(204)
  @LogOperation('delete_briefing')
  @ApiOperation({ summary: 'Delete briefing' })
  remove(@Param('id') id: string) {
    return this.briefingsService.remove(id);
  }
}
