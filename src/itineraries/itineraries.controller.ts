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
import { ItinerariesService } from './itineraries.service';
import { CreateItineraryDto } from './dto/create-itinerary.dto';
import { UpdateItineraryDto } from './dto/update-itinerary.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('itineraries')
@ApiBearerAuth()
@Controller('itineraries')
export class ItinerariesController {
  constructor(
    private readonly itinerariesService: ItinerariesService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all itineraries' })
  @ApiQuery({ name: 'passengerId', required: false })
  findAll(@Query('passengerId') passengerId?: string) {
    const agencyId = this.requestContext.getAgencyId();
    if (passengerId) {
      return this.itinerariesService.findByPassenger(agencyId!, passengerId);
    }
    return this.itinerariesService.findAll(agencyId!);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get itinerary by id' })
  findOne(@Param('id') id: string) {
    return this.itinerariesService.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_itinerary')
  @ApiOperation({ summary: 'Create a new itinerary' })
  create(@Body() dto: CreateItineraryDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.itinerariesService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_itinerary')
  @ApiOperation({ summary: 'Update itinerary' })
  update(@Param('id') id: string, @Body() dto: UpdateItineraryDto) {
    return this.itinerariesService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_itinerary')
  @ApiOperation({ summary: 'Delete itinerary' })
  remove(@Param('id') id: string) {
    return this.itinerariesService.remove(id);
  }
}
