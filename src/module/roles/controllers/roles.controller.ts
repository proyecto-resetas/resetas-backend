import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RoleService } from '../services/role.service';
import { CreateRoleDto, UpdateRoleDto } from '../dto';
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

  @Post()
  @Auth({ roles: [UserRole.ADMIN] })
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
