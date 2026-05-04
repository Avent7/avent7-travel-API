import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgenciesService } from './agencies.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from '../users/enums/user-role.enum';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('agencies')
@ApiBearerAuth()
@Controller('agencies')
export class AgenciesController {
  constructor(
    private readonly agenciesService: AgenciesService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get current agency' })
  getMyAgency() {
    const agencyId = this.requestContext.getAgencyId();
    return this.agenciesService.findById(agencyId!);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new agency (bootstrap — no auth required)' })
  create(@Body() dto: CreateAgencyDto) {
    return this.agenciesService.create(dto);
  }

  @Patch('me')
  @Auth(UserRole.ADMIN)
  @LogOperation('update_agency')
  @ApiOperation({ summary: 'Update agency branding & pricing config' })
  update(@Body() dto: UpdateAgencyDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.agenciesService.update(agencyId!, dto);
  }
}
