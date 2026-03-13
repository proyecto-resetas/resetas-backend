import {
  IsString,
  IsArray,
  IsOptional,
  IsBoolean,
  ArrayMinSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({
    description: 'Nombre único del rol (ej: user, admin, super_admin)',
    example: 'editor',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Nombre para mostrar del rol',
    example: 'Editor de Contenido',
  })
  @IsString()
  displayName: string;

  @ApiProperty({
    description: 'Lista de permisos del rol',
    example: ['recipes:read', 'recipes:create', 'recipes:update'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(0)
  @IsString({ each: true })
  permissions: string[];

  @ApiProperty({
    description: 'Descripción del rol',
    example: 'Rol para editores de contenido con permisos limitados',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Indica si el rol está activo',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
