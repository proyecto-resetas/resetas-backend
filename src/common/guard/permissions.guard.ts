import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { RoleService } from 'src/module/roles/services/role.service';
import { UserRole } from './roles.enum';

/**
 * Guard que valida permisos resolviendo los del rol del usuario desde MongoDB (con caché en memoria).
 * Soporta comodines globales ('*'), por módulo ('recipes:*') y jerarquía de alcance ('recipes:update' cubre 'recipes:update:own').
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleService: RoleService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const req = context.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    // Super Admin siempre tiene acceso total
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }

    // Resolver permisos activos del rol desde RoleService (Caché en memoria + MongoDB)
    const userPermissions: string[] =
      await this.roleService.getPermissionsByRoleName(user.role ?? '');

    const hasAllPermissions = requiredPermissions.every((permission) =>
      this.checkPermission(userPermissions, permission),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `No tienes los permisos necesarios en tu rol (${user.role}). Requeridos: ${requiredPermissions.join(', ')}`,
      );
    }

    return true;
  }

  /**
   * Verifica si el usuario tiene un permiso específico
   * Soporta:
   * - '*' (acceso total)
   * - 'modulo:*' (ej: 'recipes:*' cubre 'recipes:create', 'recipes:update:own')
   * - 'modulo:accion' cubre 'modulo:accion:own' (ej: 'recipes:update' cubre 'recipes:update:own')
   * - coincidencia exacta
   */
  private checkPermission(
    userPermissions: string[],
    requiredPermission: string,
  ): boolean {
    if (userPermissions.includes('*')) {
      return true;
    }

    if (userPermissions.includes(requiredPermission)) {
      return true;
    }

    const parts = requiredPermission.split(':');
    if (parts.length > 0) {
      const moduleWildcard = `${parts[0]}:*`;
      if (userPermissions.includes(moduleWildcard)) {
        return true;
      }
    }

    // Si se pide 'modulo:accion:own' y el rol tiene 'modulo:accion', también es válido
    if (parts.length === 3 && parts[2] === 'own') {
      const broaderPermission = `${parts[0]}:${parts[1]}`;
      if (userPermissions.includes(broaderPermission)) {
        return true;
      }
    }

    return false;
  }
}
