import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiUnauthorizedResponse, ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { CreateUserDto, UpdateUserDto } from '../dto';

/**
 * Decorador para documentar el endpoint de creación de usuario
 */
export function DocCreateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear usuario',
      description:
        'Crea un nuevo usuario en el sistema. Requiere todos los datos del usuario incluyendo email, contraseña, nombre, apellido, teléfono, país y ciudad.',
    }),
    ApiBody({ type: CreateUserDto }),
    ApiResponse({
      status: 201,
      description: 'Usuario creado exitosamente',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'juan' },
          lastname: { type: 'string', example: 'Pérez' },
          email: { type: 'string', example: 'juan@ejemplo.com' },
          role: { type: 'string', example: 'user' },
          country: { type: 'string', example: 'Colombia' },
          city: { type: 'string', example: 'Bogotá' },
          phone: {
            type: 'object',
            properties: {
              countryCode: { type: 'string', example: '+57' },
              phoneNumber: { type: 'string', example: '3001234567' },
            },
          },
          photoUrl: { type: 'string', example: 'https://example.com/photo.jpg' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o el email ya está registrado',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener usuario por email
 */
export function DocGetUserByEmail() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener usuario por email',
      description:
        'Obtiene la información completa de un usuario utilizando su email. Requiere rol de administrador.',
    }),
    ApiParam({
      name: 'email',
      description: 'Email del usuario a buscar',
      example: 'juan@ejemplo.com',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuario encontrado exitosamente',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'juan' },
          lastname: { type: 'string', example: 'Pérez' },
          email: { type: 'string', example: 'juan@ejemplo.com' },
          role: { type: 'string', example: 'user' },
          country: { type: 'string', example: 'Colombia' },
          city: { type: 'string', example: 'Bogotá' },
          phone: {
            type: 'object',
            properties: {
              countryCode: { type: 'string', example: '+57' },
              phoneNumber: { type: 'string', example: '3001234567' },
            },
          },
          photoUrl: { type: 'string', example: 'https://example.com/photo.jpg' },
          myFavorite: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                idRecipe: { type: 'string' },
                nameRecipe: { type: 'string' },
              },
            },
          },
          myRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                idRecipe: { type: 'string' },
                nameRecipe: { type: 'string' },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Email inválido o datos incorrectos',
    }),
    ApiUnauthorizedResponse({
      description: 'No autorizado. Se requiere rol de administrador',
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener usuario por ID
 */
export function DocGetUserById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener usuario por ID',
      description:
        'Obtiene la información completa de un usuario utilizando su ID. Requiere rol de administrador.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario a buscar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuario encontrado exitosamente',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'juan' },
          lastname: { type: 'string', example: 'Pérez' },
          email: { type: 'string', example: 'juan@ejemplo.com' },
          role: { type: 'string', example: 'user' },
          country: { type: 'string', example: 'Colombia' },
          city: { type: 'string', example: 'Bogotá' },
          phone: {
            type: 'object',
            properties: {
              countryCode: { type: 'string', example: '+57' },
              phoneNumber: { type: 'string', example: '3001234567' },
            },
          },
          photoUrl: { type: 'string', example: 'https://example.com/photo.jpg' },
          myFavorite: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                idRecipe: { type: 'string' },
                nameRecipe: { type: 'string' },
              },
            },
          },
          myRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                idRecipe: { type: 'string' },
                nameRecipe: { type: 'string' },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID inválido o datos incorrectos',
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
    }),
    ApiUnauthorizedResponse({
      description: 'No autorizado. Se requiere rol de administrador',
    }),
    ApiInternalServerErrorResponse({
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de actualizar usuario
 */
export function DocUpdateUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar usuario',
      description:
        'Actualiza la información de un usuario existente. Solo se actualizarán los campos proporcionados en el body.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario a actualizar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({ type: UpdateUserDto }),
    ApiResponse({
      status: 200,
      description: 'Usuario actualizado exitosamente',
      schema: {
        type: 'object',
        properties: {
          id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          username: { type: 'string', example: 'juan' },
          lastname: { type: 'string', example: 'Pérez' },
          email: { type: 'string', example: 'juan@ejemplo.com' },
          role: { type: 'string', example: 'user' },
          country: { type: 'string', example: 'Colombia' },
          city: { type: 'string', example: 'Bogotá' },
          phone: {
            type: 'object',
            properties: {
              countryCode: { type: 'string', example: '+57' },
              phoneNumber: { type: 'string', example: '3001234567' },
            },
          },
          photoUrl: { type: 'string', example: 'https://example.com/photo.jpg' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos',
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de eliminar usuario
 */
export function DocDeleteUser() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar usuario',
      description:
        'Elimina un usuario del sistema utilizando su ID. Esta acción es permanente.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del usuario a eliminar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Usuario eliminado exitosamente',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'Usuario eliminado exitosamente',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID inválido',
    }),
    ApiResponse({
      status: 404,
      description: 'Usuario no encontrado',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}
