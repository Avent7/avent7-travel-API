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
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('briefings')
@ApiBearerAuth()
@Controller('briefings')
export class BriefingsController {
  constructor(
    private readonly briefingsService: BriefingsService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all briefings' })
  @ApiQuery({ name: 'passengerId', required: false })
  findAll(@Query('passengerId') passengerId?: string) {
    const agencyId = this.requestContext.getAgencyId();
    if (passengerId) {
      return this.briefingsService.findByPassenger(agencyId!, passengerId);
    }
    return this.briefingsService.findAll(agencyId!);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get briefing by id' })
  findOne(@Param('id') id: string) {
    return this.briefingsService.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_briefing')
  @ApiOperation({ summary: 'Create a new briefing' })
  create(@Body() dto: CreateBriefingDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.briefingsService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_briefing')
  @ApiOperation({ summary: 'Update briefing' })
  update(@Param('id') id: string, @Body() dto: UpdateBriefingDto) {
    return this.briefingsService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_briefing')
  @ApiOperation({ summary: 'Delete briefing' })
  remove(@Param('id') id: string) {
    return this.briefingsService.remove(id);
  }
}
