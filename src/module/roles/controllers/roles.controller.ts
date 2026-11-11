import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Request,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/guard/roles.enum';
import {
  DocCreateRole,
  DocGetAllRoles,
  DocGetRoleById,
  DocUpdateRole,
  DocDeleteRole,
  DocActivateRole,
} from '../decorators/roles-swagger.decorator';

@ApiTags('roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RoleService) {}

  // ===========================================================================
  // ENDPOINTS DE CATÁLOGO DE PERMISOS EN BASE DE DATOS (COLECCIÓN 'permissions')
  // ===========================================================================

  @Get('my-permissions')
  @Auth()
  @ApiOperation({
    summary: 'Obtener los permisos activos del usuario autenticado desde la BD',
  })
  async getMyPermissions(@Request() req: any) {
    const roleName = req.user?.role || 'user';
    const permissions =
      await this.rolesService.getPermissionsByRoleName(roleName);
    return {
      role: roleName,
      permissions,
    };
  }

  @Get('permissions/catalog')
  @Auth({
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    permissions: ['roles:read'],
  })
  @ApiOperation({
    summary: 'Obtener todos los permisos registrados en la base de datos',
  })
  async findAllPermissions(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive !== 'false';
    return this.rolesService.findAllPermissions(include);
  }

  @Post('permissions')
  @Auth({
    roles: [UserRole.SUPER_ADMIN],
    permissions: ['roles:create'],
  })
  @ApiOperation({
    summary: 'Crear un nuevo permiso en la base de datos',
  })
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.rolesService.createPermission(dto);
  }

  @Patch('permissions/:id')
  @Auth({
    roles: [UserRole.SUPER_ADMIN],
    permissions: ['roles:update'],
  })
  @ApiOperation({
    summary: 'Actualizar o activar/desactivar un permiso en la base de datos',
  })
  async updatePermission(
    @Param('id') id: string,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.rolesService.updatePermission(id, dto);
  }

  @Delete('permissions/:id')
  @Auth({
    roles: [UserRole.SUPER_ADMIN],
    permissions: ['roles:delete'],
  })
  @ApiOperation({
    summary: 'Eliminar un permiso de la base de datos y desasignarlo de los roles',
  })
  async deletePermission(@Param('id') id: string) {
    return this.rolesService.deletePermission(id);
  }

  // ===========================================================================
  // ENDPOINTS DE ROLES EN BASE DE DATOS (COLECCIÓN 'roles')
  // ===========================================================================

  @Post()
  @Auth({ roles: [UserRole.SUPER_ADMIN], permissions: ['roles:create'] })
  @DocCreateRole()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @Auth({
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    permissions: ['roles:read'],
  })
  @DocGetAllRoles()
  async findAll(@Query('includeInactive') includeInactive?: string) {
    const include = includeInactive === 'true';
    return this.rolesService.findAll(include);
  }

  @Get(':id')
  @Auth({
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
    permissions: ['roles:read'],
  })
  @DocGetRoleById()
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOneById(id);
  }

  @Patch(':id')
  @Auth({ roles: [UserRole.SUPER_ADMIN], permissions: ['roles:update'] })
  @DocUpdateRole()
  async update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @Auth({ roles: [UserRole.SUPER_ADMIN], permissions: ['roles:delete'] })
  @DocDeleteRole()
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }

  @Post(':id/activate')
  @Auth({ roles: [UserRole.SUPER_ADMIN], permissions: ['roles:update'] })
  @DocActivateRole()
  async activate(@Param('id') id: string) {
    return this.rolesService.activate(id);
  }
}
