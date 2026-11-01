import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from './roles.enum';
import { ROLES_KEY } from '../decorators/roleGuard.decorator';

@Injectable()
export class UserRoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const validRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!validRoles || validRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user)
      throw new BadRequestException('User not found or not authenticated');

    // El rol super_admin tiene jerarquía superior sobre todos los endpoints
    if (user.role === UserRole.SUPER_ADMIN || validRoles.includes(user.role)) {
      return true;
    }

    throw new ForbiddenException(
      `User requires one of the following roles: ${validRoles.join(', ')}`,
    );
  }
}
