import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RequestContextGuard } from '../cls/request-context.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RequestContextGuard, RolesGuard),
    ...(roles.length > 0 ? [Roles(...roles)] : []),
  );
}
