import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ArrayNotEmpty,
} from '@nestjs/class-validator';

export class SearchByIngredientsDto {
  @ApiProperty({
    example: ['huevo', 'tomate', 'cebolla', 'arroz'],
    description: 'Lista de ingredientes disponibles que tiene el usuario en su despensa o nevera',
  })
  @IsArray()
  @ArrayNotEmpty({ message: 'Debes proporcionar al menos un ingrediente' })
  @IsString({ each: true, message: 'Cada ingrediente debe ser una cadena de texto' })
  ingredients: string[];

  @ApiPropertyOptional({
    example: 0,
    description: 'Porcentaje mínimo de coincidencia (0 a 100)',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  minMatchPercentage?: number = 0;

  @ApiPropertyOptional({
    example: 5,
    description: 'Número máximo de ingredientes faltantes permitidos',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxMissingIngredients?: number;

  @ApiPropertyOptional({
    example: 'Plato principal',
    description: 'Filtrar por categoría de receta opcional',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: 'Basico',
    description: 'Filtrar por nivel de dificultad opcional',
  })
  @IsOptional()
  @IsString()
  level?: string;

  @ApiPropertyOptional({
    example: true,
    description: 'Si es true, no penaliza ingredientes básicos de despensa como sal, agua, aceite o pimienta',
    default: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  excludeStaplesFromMissing?: boolean = true;

  @ApiPropertyOptional({
    example: 1,
    description: 'Número de página',
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
    description: 'Cantidad de recetas por página',
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 10;
}
