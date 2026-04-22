import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { StepDto } from '../dto/create-step.dto';
import { UpdateStepDto } from '../dto/update-step.dto';

/**
 * Decorador para documentar la creación de un paso
 */
export function DocCreateStep() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear un nuevo paso',
      description: 'Crea un paso individual para una receta.',
    }),
    ApiBody({ type: StepDto }),
    ApiResponse({
      status: 201,
      description: 'Paso creado exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          description: { type: 'string', example: 'Cocer la pasta' },
          time: { type: 'string', example: '10m' },
          timeScreen: { type: 'number', example: 600 },
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Datos de entrada inválidos' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 500, description: 'Error interno del servidor' }),
  );
}

/**
 * Decorador para documentar la obtención de todos los pasos
 */
export function DocGetAllSteps() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todos los pasos',
      description:
        'Retorna una lista de todos los pasos registrados en el sistema.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de pasos obtenida exitosamente',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            description: { type: 'string' },
            time: { type: 'string' },
            timeScreen: { type: 'number' },
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 500, description: 'Error interno del servidor' }),
  );
}

/**
 * Decorador para documentar la obtención de un paso por ID
 */
export function DocGetStepById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener un paso por ID',
      description: 'Retorna la información detallada de un paso específico.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID del paso',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Paso encontrado',
    }),
    ApiResponse({ status: 404, description: 'Paso no encontrado' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 500, description: 'Error interno del servidor' }),
  );
}

/**
 * Decorador para documentar la obtención de pasos por receta
 */
export function DocGetStepsByRecipe() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener pasos de una receta específica',
      description:
        'Retorna los pasos de una receta solo si el usuario tiene la receta en su lista de "Mis Recetas".',
    }),
    ApiParam({
      name: 'recipeId',
      description: 'ID de la receta',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Pasos de la receta obtenidos exitosamente',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            description: { type: 'string' },
            time: { type: 'string' },
            timeScreen: { type: 'number' },
          },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'No tienes permiso para ver los pasos de esta receta',
    }),
    ApiResponse({ status: 404, description: 'Receta no encontrada' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 500, description: 'Error interno del servidor' }),
  );
}

/**
 * Decorador para documentar la actualización de un paso
 */
export function DocUpdateStep() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar un paso',
      description: 'Actualiza la información de un paso existente.',
    }),
    ApiParam({ name: 'id', description: 'ID del paso to update' }),
    ApiBody({ type: UpdateStepDto }),
    ApiResponse({
      status: 200,
      description: 'Paso actualizado exitosamente',
    }),
    ApiResponse({ status: 404, description: 'Paso no encontrado' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 500, description: 'Error interno del servidor' }),
  );
}

/**
 * Decorador para documentar la eliminación de un paso
 */
export function DocDeleteStep() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar un paso',
      description: 'Elimina permanentemente un paso del sistema.',
    }),
    ApiParam({ name: 'id', description: 'ID del paso a eliminar' }),
    ApiResponse({
      status: 200,
      description: 'Paso eliminado exitosamente',
    }),
    ApiResponse({ status: 404, description: 'Paso no encontrado' }),
    ApiResponse({ status: 401, description: 'No autorizado' }),
    ApiResponse({ status: 500, description: 'Error interno del servidor' }),
  );
}
