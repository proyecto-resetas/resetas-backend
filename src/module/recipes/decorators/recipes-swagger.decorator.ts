import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateRecipeDto, UpdateRecipeDto } from '../dto';

/**
 * Decorador para documentar el endpoint de creación de receta
 */
export function DocCreateRecipe() {
  return applyDecorators(
    ApiOperation({
      summary: 'Crear receta',
      description:
        'Crea una nueva receta en el sistema. Requiere rol de administrador. Incluye nombre, descripción, ingredientes, utensilios, pasos y nivel de dificultad.',
    }),
    ApiBody({ type: CreateRecipeDto }),
    ApiResponse({
      status: 201,
      description: 'Receta creada exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          nameRecipe: { type: 'string', example: 'Pasta Carbonara' },
          descriptionRecipe: {
            type: 'string',
            example:
              'Deliciosa pasta italiana con tocino, huevo y queso parmesano',
          },
          imageUrl: {
            type: 'string',
            example: 'https://example.com/images/carbonara.jpg',
          },
          price: { type: 'number', example: 15.99 },
          level: {
            type: 'string',
            enum: ['Basico', 'Intermedio', 'Avanzado'],
            example: 'Intermedio',
          },
          category: { type: 'string', example: 'Italiana' },
          ingredientsRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string', example: 'Pasta espagueti' },
                amount: { type: 'string', example: '400g' },
              },
            },
          },
          utensilRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                utensil: { type: 'string', example: 'Olla grande' },
              },
            },
          },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  example: 'Cocer la pasta en agua hirviendo',
                },
                time: { type: 'string', example: '10m' },
                timeScreen: { type: 'number', example: 600 },
              },
            },
          },
          createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Datos inválidos o faltantes',
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado. Se requiere rol de administrador',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener recetas con filtros
 */
export function DocGetRecipesFilter() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener recetas con filtros',
      description:
        'Obtiene una lista paginada de recetas aplicando filtros opcionales por nombre, categoría, creador o nivel de dificultad.',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      description: 'Buscar por nombre de la receta (búsqueda parcial)',
      example: 'Pasta',
    }),
    ApiQuery({
      name: 'category',
      required: false,
      description: 'Filtrar por categoría',
      example: 'Italiana',
    }),
    ApiQuery({
      name: 'createdBy',
      required: false,
      description: 'Filtrar por ID del creador',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiQuery({
      name: 'level',
      required: false,
      description: 'Filtrar por nivel de dificultad',
      enum: ['Basico', 'Intermedio', 'Avanzado'],
      example: 'Intermedio',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Número de página',
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Cantidad de resultados por página',
      type: Number,
      example: 10,
    }),
    ApiResponse({
      status: 200,
      description: 'Recetas encontradas exitosamente',
      schema: {
        type: 'object',
        properties: {
          recipes: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                nameRecipe: { type: 'string', example: 'Pasta Carbonara' },
                descriptionRecipe: {
                  type: 'string',
                  example: 'Deliciosa pasta italiana',
                },
                imageUrl: {
                  type: 'string',
                  example: 'https://example.com/images/carbonara.jpg',
                },
                price: { type: 'number', example: 15.99 },
                level: { type: 'string', example: 'Intermedio' },
                category: { type: 'string', example: 'Italiana' },
                createdBy: {
                  type: 'object',
                  properties: {
                    username: { type: 'string', example: 'Juan' },
                    lastname: { type: 'string', example: 'Pérez' },
                  },
                },
              },
            },
          },
          total: {
            type: 'number',
            example: 25,
            description: 'Total de recetas que coinciden con los filtros',
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Parámetros de consulta inválidos',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener recetas por tipo (favoritas, creadas o compradas)
 */
export function DocGetRecipesByType() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener recetas por tipo para el usuario autenticado',
      description:
        'Obtiene las recetas favoritas, las creadas o las compradas por el usuario que realiza la petición (extraído del token). El tipo puede ser "favorite", "myRecipes", "purchased" o "created".',
    }),
    ApiParam({
      name: 'type',
      description: 'Tipo de recetas a obtener',
      enum: ['favorite', 'myRecipes', 'purchased', 'created'],
      example: 'favorite',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Número de página',
      type: Number,
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Cantidad de resultados por página',
      type: Number,
      example: 10,
    }),
    ApiResponse({
      status: 200,
      description: 'Recetas encontradas exitosamente',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            nameRecipe: { type: 'string', example: 'Pasta Carbonara' },
            descriptionRecipe: {
              type: 'string',
              example: 'Deliciosa pasta italiana',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/images/carbonara.jpg',
            },
            price: { type: 'number', example: 15.99 },
            level: { type: 'string', example: 'Intermedio' },
            category: { type: 'string', example: 'Italiana' },
            createdBy: {
              type: 'object',
              properties: {
                username: { type: 'string', example: 'Juan' },
                lastname: { type: 'string', example: 'Pérez' },
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Tipo inválido. Debe ser "favorite", "myRecipes", "purchased" o "created"',
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
 * Decorador para documentar el endpoint de obtener todas las recetas
 */
export function DocGetAllRecipes() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener todas las recetas',
      description:
        'Obtiene todas las recetas del sistema. Requiere rol de administrador.',
    }),
    ApiResponse({
      status: 200,
      description: 'Lista de todas las recetas',
      schema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            nameRecipe: { type: 'string', example: 'Pasta Carbonara' },
            descriptionRecipe: {
              type: 'string',
              example: 'Deliciosa pasta italiana',
            },
            imageUrl: {
              type: 'string',
              example: 'https://example.com/images/carbonara.jpg',
            },
            price: { type: 'number', example: 15.99 },
            level: { type: 'string', example: 'Intermedio' },
            category: { type: 'string', example: 'Italiana' },
            createdBy: {
              type: 'object',
              properties: {
                username: { type: 'string' },
                lastname: { type: 'string' },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'No autorizado. Se requiere rol de administrador',
    }),
    ApiResponse({
      status: 404,
      description: 'No se encontraron recetas',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener receta por ID
 */
export function DocGetRecipeById() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener receta por ID',
      description:
        'Obtiene la información completa de una receta específica utilizando su ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la receta',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Receta encontrada exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          nameRecipe: { type: 'string', example: 'Pasta Carbonara' },
          descriptionRecipe: {
            type: 'string',
            example:
              'Deliciosa pasta italiana con tocino, huevo y queso parmesano',
          },
          imageUrl: {
            type: 'string',
            example: 'https://example.com/images/carbonara.jpg',
          },
          price: { type: 'number', example: 15.99 },
          level: {
            type: 'string',
            enum: ['Basico', 'Intermedio', 'Avanzado'],
            example: 'Intermedio',
          },
          category: { type: 'string', example: 'Italiana' },
          ingredientsRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string', example: 'Pasta espagueti' },
                amount: { type: 'string', example: '400g' },
              },
            },
          },
          utensilRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                utensil: { type: 'string', example: 'Olla grande' },
              },
            },
          },
          steps: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: {
                  type: 'string',
                  example: 'Cocer la pasta en agua hirviendo',
                },
                time: { type: 'string', example: '10m' },
                timeScreen: { type: 'number', example: 600 },
              },
            },
          },
          createdBy: { type: 'string', example: '507f1f77bcf86cd799439011' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'ID inválido',
    }),
    ApiResponse({
      status: 404,
      description: 'Receta no encontrada',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de actualizar receta
 */
export function DocUpdateRecipe() {
  return applyDecorators(
    ApiOperation({
      summary: 'Actualizar receta',
      description:
        'Actualiza la información de una receta existente. Solo se actualizarán los campos proporcionados en el body.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la receta a actualizar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiBody({ type: UpdateRecipeDto }),
    ApiResponse({
      status: 200,
      description: 'Receta actualizada exitosamente',
      schema: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
          nameRecipe: {
            type: 'string',
            example: 'Pasta Carbonara Actualizada',
          },
          descriptionRecipe: {
            type: 'string',
            example: 'Descripción actualizada',
          },
          imageUrl: {
            type: 'string',
            example: 'https://example.com/images/carbonara-new.jpg',
          },
          price: { type: 'number', example: 18.99 },
          level: { type: 'string', example: 'Avanzado' },
          category: { type: 'string', example: 'Italiana' },
          ingredientsRecipe: { type: 'array' },
          utensilRecipe: { type: 'array' },
          steps: { type: 'array' },
          createdBy: { type: 'string' },
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
      description: 'Receta no encontrada',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de eliminar receta
 */
export function DocDeleteRecipe() {
  return applyDecorators(
    ApiOperation({
      summary: 'Eliminar receta',
      description:
        'Elimina una receta del sistema utilizando su ID. Esta acción es permanente.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la receta a eliminar',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Receta eliminada exitosamente',
      schema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            example: 'This action removes a #507f1f77bcf86cd799439011 receta',
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
      description: 'Receta no encontrada',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}

/**
 * Decorador para documentar el endpoint de obtener ingredientes y utensilios por ID
 */
export function DocGetIngredientsAndUtensils() {
  return applyDecorators(
    ApiOperation({
      summary: 'Obtener ingredientes y utensilios por ID de receta',
      description:
        'Obtiene únicamente la lista de ingredientes y utensilios de una receta específica utilizando su ID.',
    }),
    ApiParam({
      name: 'id',
      description: 'ID de la receta',
      example: '507f1f77bcf86cd799439011',
    }),
    ApiResponse({
      status: 200,
      description: 'Ingredientes y utensilios encontrados exitosamente',
      schema: {
        type: 'object',
        properties: {
          ingredientsRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                description: { type: 'string', example: 'Pasta espagueti' },
                amount: { type: 'string', example: '400g' },
              },
            },
          },
          utensilRecipe: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                utensil: { type: 'string', example: 'Olla grande' },
              },
            },
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
      description: 'Receta no encontrada',
    }),
    ApiResponse({
      status: 500,
      description: 'Error interno del servidor',
    }),
  );
}
