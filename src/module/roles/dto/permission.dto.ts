import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'recipes:export',
    description: 'Clave única del permiso (formato modulo:accion)',
  })
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty({
    example: 'Exportar recetas',
    description: 'Nombre legible del permiso',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'recipes',
    description: 'Módulo al que pertenece (recipes, steps, users, roles, profile, s3)',
  })
  @IsString()
  @IsNotEmpty()
  module: string;

  @ApiProperty({
    example: 'Permite exportar recetas en formato PDF o JSON',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdatePermissionDto extends PartialType(CreatePermissionDto) {}
