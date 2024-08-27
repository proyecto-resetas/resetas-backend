import { applyDecorators, UseGuards } from '@nestjs/common';
import { UserRole } from '../guard/roles.enum';
import { UserRoleGuard } from '../guard/role.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from './roleGuard.decorator';
import { JwtAuthGuard } from '../guard/jwt.guard';

export function Auth(...roles: UserRole[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(JwtAuthGuard, UserRoleGuard),
    ApiBearerAuth(),
  );
}