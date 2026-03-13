# Módulo de Roles y Permisos

Este módulo centraliza todo el manejo de roles y permisos del sistema.

## Estructura

```
roles/
├── entities/
│   └── role.entity.ts          # Entidad Role de MongoDB
├── services/
│   └── role.service.ts         # Servicio para gestionar roles y permisos
├── roles.module.ts             # Módulo de NestJS
└── index.ts                    # Exportaciones públicas
```

**Nota**: Los guards y decoradores están en las carpetas comunes:
- `src/common/guard/permissions.guard.ts` - Guard de permisos
- `src/common/decorators/permissions.decorator.ts` - Decorador @RequirePermissions
- `src/common/decorators/secure.decorator.ts` - Decorador @Secure

## Decoradores Disponibles

### `@Secure(roles?, permissions?)`
Decorador combinado que incluye autenticación JWT, verificación de roles y permisos.

```typescript
import { Secure } from 'src/common/decorators/secure.decorator';
import { UserRole } from 'src/common/guard/roles.enum';

// Solo autenticación
@Secure()
@Get('profile')
getProfile() { }

// Autenticación + Roles
@Secure([UserRole.ADMIN])
@Post('create')
create() { }

// Autenticación + Permisos
@Secure(undefined, ['recipes:create'])
@Post('recipes')
createRecipe() { }

// Autenticación + Roles + Permisos
@Secure([UserRole.ADMIN], ['users:delete'])
@Delete('users/:id')
deleteUser() { }
```

### `@RequirePermissions(...permissions)`
Decorador para especificar permisos requeridos (debe usarse con `PermissionsGuard`).

```typescript
import { RequirePermissions } from 'src/common/decorators/permissions.decorator';
import { PermissionsGuard } from 'src/common/guard/permissions.guard';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';

@UseGuards(JwtAuthGuard, PermissionsGuard)
@RequirePermissions('recipes:create', 'recipes:update')
@Post('recipes')
createRecipe() { }
```