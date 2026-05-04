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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../common/decorators/auth.decorator';
import { UserRole } from './enums/user-role.enum';
import { RequestContextService } from '../common/cls/request-context.service';
import { LogOperation } from '../common/decorators/log-operation.decorator';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly requestContext: RequestContextService,
  ) {}

  @Get('me')
  @Auth()
  @ApiOperation({ summary: 'Get current user profile' })
  getMe() {
    const userId = this.requestContext.getUserId();
    return this.usersService.findById(userId!);
  }

  @Get()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'List all users in the agency' })
  findAll() {
    const agencyId = this.requestContext.getAgencyId();
    return this.usersService.findAll(agencyId!);
  }

  @Get(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @LogOperation('create_user')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  create(@Body() dto: CreateUserDto) {
    const agencyId = this.requestContext.getAgencyId();
    return this.usersService.create(dto, agencyId!);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @LogOperation('update_user')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(204)
  @LogOperation('delete_user')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
