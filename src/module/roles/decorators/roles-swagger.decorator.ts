import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateRoleDto, UpdateRoleDto } from '../dto';

/**
 * Decorador para documentar el endpoint de creación de rol
 */
export function DocCreateRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear rol',
      description:
        'Crea un nuevo rol en el sistema. Requiere permisos de super_admin y roles:create.',
    }),
    ApiBody({ type: CreateRoleDto }),
    ApiResponse({
      status: 201,
      description: 'Rol creado exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'editor' },
          displayName: { type: 'string', example: 'Editor de Contenido' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['recipes:read', 'recipes:create', 'recipes:update'],
          },
          description: {
            type: 'string',
            example: 'Rol para editores de contenido',
          },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado',
    }),
    ApiResponse({
      status: 403,
      description: 'No tienes permisos para crear roles',
    }),
    ApiResponse({
      status: 409,
      description: 'El rol con ese nombre ya existe',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener todos los roles
 */
export function DocGetAllRoles() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los roles',
      description:
        'Obtiene una lista de todos los roles del sistema. Requiere permisos de admin o super_admin y roles:read.',
    }),
    ApiQuery({
      name: 'includeInactive',
      required: false,
      description: 'Incluir roles inactivos en los resultados',
      type: Boolean,
      example: false,
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de roles obtenida exitosamente',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            name: { type: 'string', example: 'admin' },
            displayName: { type: 'string', example: 'Administrador' },
            permissions: { type: 'array', items: { type: 'string' } },
            description: { type: 'string' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado',
    }),
    ApiResponse({
      status: 403,
      description: 'No tienes permisos para leer roles',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener rol por ID
 */
export function DocGetRoleById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener rol por ID',
      description:
        'Obtiene la información completa de un rol específico. Requiere permisos de admin o super_admin y roles:read.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del rol',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Rol encontrado exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'admin' },
          displayName: { type: 'string', example: 'Administrador' },
          permissions: {
            type: 'array',
            items: { type: 'string' },
            example: ['recipes:*', 'users:read', 'users:update'],
          },
          description: {
            type: 'string',
            example: 'Rol de administrador del sistema',
          },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado',
    }),
    ApiResponse({
      status: 403,
      description: 'No tienes permisos para leer roles',
    }),
    ApiResponse({
      status: 404,
      description: 'Rol no encontrado',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de actualizar rol
 */
export function DocUpdateRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar rol',
      description:
        'Actualiza la información de un rol existente. Solo se actualizarán los campos proporcionados. Requiere permisos de super_admin y roles:update.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del rol a actualizar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({ type: UpdateRoleDto }),
    ApiResponse({
      status: 200,
      description: 'Rol actualizado exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'admin' },
          displayName: { type: 'string', example: 'Administrador Actualizado' },
          permissions: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          isActive: { type: 'boolean' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado',
    }),
    ApiResponse({
      status: 403,
      description: 'No tienes permisos para actualizar roles',
    }),
    ApiResponse({
      status: 404,
      description: 'Rol no encontrado',
    }),
    ApiResponse({
      status: 409,
      description: 'Ya existe otro rol con ese nombre',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de eliminar rol
 */
export function DocDeleteRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Desactivar rol',
      description:
        'Desactiva un rol del sistema (soft delete). El rol se marca como inactivo pero no se elimina permanentemente. Requiere permisos de super_admin y roles:delete.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del rol a desactivar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Rol desactivado exitosamente',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Rol "Administrador" desactivado exitosamente',
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado',
    }),
    ApiResponse({
      status: 403,
      description: 'No tienes permisos para eliminar roles',
    }),
    ApiResponse({
      status: 404,
      description: 'Rol no encontrado',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de activar rol
 */
export function DocActivateRole() {
  return applyDecorators(
    ApiOperation({
      summary: 'Activar rol',
      description:
        'Reactiva un rol previamente desactivado. Requiere permisos de super_admin y roles:update.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del rol a activar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Rol activado exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          name: { type: 'string', example: 'admin' },
          displayName: { type: 'string', example: 'Administrador' },
          isActive: { type: 'boolean', example: true },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado',
    }),
    ApiResponse({
      status: 403,
      description: 'No tienes permisos para actualizar roles',
    }),
    ApiResponse({
      status: 404,
      description: 'Rol no encontrado',
    }),
  );
}
