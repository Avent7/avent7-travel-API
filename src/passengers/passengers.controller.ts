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
import { PassengersService } from './passengers.service';
import { CreatePassengerDto } from './dto/create-passenger.dto';
import { UpdatePassengerDto } from './dto/update-passenger.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('passengers')
@ApiBearerAuth()
@Controller('passengers')
export class PassengersController {
  constructor(
    private readonly passengersService: PassengersService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get()
  @Auth()
  @ApiOperation({ summary: 'List all passengers of the agency' })
  findAll() {
    const agencyId = this.requestContext.getAgencyId();
    return this.passengersService.findAll(agencyId!);
  }

  @Get(':id')
  @Auth()
  @ApiOperation({ summary: 'Get passenger by id' })
  findOne(@Param('id') id: string) {
    return this.passengersService.findById(id);
  }

  @Post()
  @Auth()
  @LogOperation('create_passenger')
  @ApiOperation({ summary: 'Create a new passenger' })
  create(@Body() dto: CreatePassengerDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.passengersService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth()
  @LogOperation('update_passenger')
  @ApiOperation({ summary: 'Update passenger' })
  update(@Param('id') id: string, @Body() dto: UpdatePassengerDto) {
    return this.passengersService.update(id, dto);
  }

  @Delete(':id')
  @Auth()
  @HttpCode(204)
  @LogOperation('delete_passenger')
  @ApiOperation({ summary: 'Delete passenger' })
  remove(@Param('id') id: string) {
    return this.passengersService.remove(id);
  }
}
