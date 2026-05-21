import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get('kpis')
  @Auth()
  @ApiOperation({ summary: 'KPI cards (GMV, lucro, take rate, ticket médio — YTD)' })
  getKpis() {
    const agencyId = this.requestContext.getAgencyId();
    return this.dashboardService.getKpis(agencyId!);
  }

  @Get('revenue')
  @Auth()
  @ApiOperation({ summary: 'Revenue breakdown — últimos 6 meses' })
  getRevenue() {
    const agencyId = this.requestContext.getAgencyId();
    return this.dashboardService.getRevenueBreakdown(agencyId!);
  }

  @Get('engagement-trends')
  @Auth()
  @ApiOperation({ summary: 'Tendência de engajamento — últimos 12 meses' })
  getEngagementTrends() {
    const agencyId = this.requestContext.getAgencyId();
    return this.dashboardService.getEngagementTrends(agencyId!);
  }
}
