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
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
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

  @Post('me/password')
  @Auth()
  @HttpCode(204)
  @LogOperation('change_password')
  @ApiOperation({ summary: 'Change own password' })
  changePassword(@Body() dto: ChangePasswordDto) {
    const userId = this.requestContext.getUserId();
    return this.usersService.changePassword(userId!, dto);
  }

  @Post('me/avatar')
  @Auth()
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } }))
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @ApiOperation({ summary: 'Upload profile photo' })
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    const userId = this.requestContext.getUserId();
    return this.usersService.uploadAvatar(userId!, file);
  }

  @Get()
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'List users in the agency (paginated)' })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    const agencyId = this.requestContext.getAgencyId();
    return this.usersService.findAll(agencyId!, {
      page: Math.max(1, parseInt(page, 10) || 1),
      limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 10)),
      role,
      status,
    });
  }

  @Get(':id')
  @Auth(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get user by id' })
  findOne(@Param('id') id: string) {
    const role = this.requestContext.getUserRole();
    const agencyId = this.requestContext.getAgencyId();
    return this.usersService.findById(id, role, agencyId);
  }

  @Post()
  @Auth(UserRole.ADMIN)
  @LogOperation('create_user')
  @ApiOperation({ summary: 'Create a new user (admin only)' })
  create(@Body() dto: CreateUserDto) {
    const agencyId = this.requestContext.getAgencyId();
    const role = this.requestContext.getUserRole();
    return this.usersService.create(dto, agencyId, role);
  }

  @Patch(':id')
  @Auth(UserRole.ADMIN)
  @LogOperation('update_user')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const role = this.requestContext.getUserRole();
    const agencyId = this.requestContext.getAgencyId();
    return this.usersService.update(id, dto, role, agencyId);
  }

  @Delete(':id')
  @Auth(UserRole.ADMIN)
  @HttpCode(204)
  @LogOperation('delete_user')
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    const role = this.requestContext.getUserRole();
    const agencyId = this.requestContext.getAgencyId();
    return this.usersService.remove(id, role, agencyId);
  }
}
