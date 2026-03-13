// Exportar entidades
export * from './entities/role.entity';

// Exportar servicios
export * from './services/role.service';

// Exportar módulo
export * from './roles.module';

// Nota: Los guards y decoradores están en src/common/
// - PermissionsGuard: src/common/guard/permissions.guard
// - RequirePermissions: src/common/decorators/permissions.decorator
// - Secure: src/common/decorators/secure.decorator
