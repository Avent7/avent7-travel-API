import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('bookings')
@ApiBearerAuth()
@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all bookings' })
  @ApiQuery({ name: 'itineraryId', required: false })
  findAll(@Query('itineraryId') itineraryId?: string) {
    if (itineraryId) return this.bookingsService.findByItinerary(itineraryId);
    const agencyId = this.requestContext.getAgencyId();
    return this.bookingsService.findAll(agencyId!);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get booking by id' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_booking')
  @ApiOperation({ summary: 'Create a new booking' })
  create(@Body() dto: CreateBookingDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.bookingsService.create(dto, agencyId!);
  }

  @Post(':id/confirm')
  @Auth()
  @HttpCode(200)
  @LogOperation('confirm_booking')
  @ApiOperation({ summary: 'Confirm a booking' })
  confirm(@Param('id') id: string) {
    return this.bookingsService.confirm(id);
  }

  @Post(':id/cancel')
  @Auth()
  @HttpCode(200)
  @LogOperation('cancel_booking')
  @ApiOperation({ summary: 'Cancel a booking' })
  cancel(@Param('id') id: string) {
    return this.bookingsService.cancel(id);
  }
}
