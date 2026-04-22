import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from '../dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
  ) {}

  /**
   * Obtiene los permisos de un rol por su nombre
   */
  async getPermissionsByRoleName(roleName: string): Promise<string[]> {
    const role = await this.roleModel
      .findOne({
        name: roleName,
        isActive: true,
      })
      .exec();

    if (!role) {
      // Si no existe el rol en la BD, retornar permisos por defecto según el rol
      return this.getDefaultPermissions(roleName);
    }

    return role.permissions || [];
  }

  /**
   * Obtiene el rol completo por su nombre
   */
  async getRoleByName(roleName: string): Promise<Role | null> {
    return await this.roleModel
      .findOne({
        name: roleName,
        isActive: true,
      })
      .exec();
  }

  /**
   * Obtiene todos los roles activos
   */
  async getAllRoles(): Promise<Role[]> {
    return await this.roleModel.find({ isActive: true }).exec();
  }

  /**
   * Crea un nuevo rol
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Verificar si el rol ya existe
    const existingRole = await this.roleModel
      .findOne({ name: createRoleDto.name })
      .exec();
    if (existingRole) {
      throw new ConflictException(
        `El rol con nombre "${createRoleDto.name}" ya existe`,
      );
    }

    const role = new this.roleModel({
      ...createRoleDto,
      isActive: createRoleDto.isActive ?? true,
    });

    return await role.save();
  }

  /**
   * Obtiene todos los roles (activos e inactivos)
   */
  async findAll(includeInactive = false): Promise<Role[]> {
    const filter = includeInactive ? {} : { isActive: true };
    return await this.roleModel.find(filter).sort({ name: 1 }).exec();
  }

  /**
   * Obtiene un rol por su ID
   */
  async findOneById(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }
    return role;
  }

  /**
   * Actualiza un rol por su ID
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    // Si se intenta cambiar el nombre, verificar que no exista otro rol con ese nombre
    if (updateRoleDto.name) {
      const existingRole = await this.roleModel
        .findOne({
          name: updateRoleDto.name,
          _id: { $ne: id },
        })
        .exec();

      if (existingRole) {
        throw new ConflictException(
          `Ya existe otro rol con el nombre "${updateRoleDto.name}"`,
        );
      }
    }

    const role = await this.roleModel
      .findByIdAndUpdate(id, updateRoleDto, { new: true, runValidators: true })
      .exec();

    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    return role;
  }

  /**
   * Elimina un rol (soft delete - marca como inactivo)
   */
  async remove(id: string): Promise<{ message: string }> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    // Soft delete - marcar como inactivo en lugar de eliminar
    role.isActive = false;
    await role.save();

    return { message: `Rol "${role.displayName}" desactivado exitosamente` };
  }

  /**
   * Elimina un rol permanentemente de la base de datos
   */
  async deletePermanently(id: string): Promise<{ message: string }> {
    const role = await this.roleModel.findByIdAndDelete(id).exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    return { message: `Rol "${role.displayName}" eliminado permanentemente` };
  }

  /**
   * Reactiva un rol previamente desactivado
   */
  async activate(id: string): Promise<Role> {
    const role = await this.roleModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    return role;
  }

  /**
   * Crea o actualiza un rol (método legacy - mantener por compatibilidad)
   */
  async createOrUpdateRole(roleData: Partial<Role>): Promise<Role> {
    return await this.roleModel
      .findOneAndUpdate({ name: roleData.name }, roleData, {
        upsert: true,
        new: true,
      })
      .exec();
  }

  /**
   * Permisos por defecto si el rol no existe en la BD
   */
  private getDefaultPermissions(roleName: string): string[] {
    const defaultPermissions: Record<string, string[]> = {
      user: [
        'recipes:read',
        'recipes:read:own',
        'recipes:create:own',
        'recipes:update:own',
        'recipes:delete:own',
        'profile:read',
        'profile:update',
      ],
      admin: [
        'recipes:read',
        'recipes:create',
        'recipes:update',
        'recipes:delete',
        'users:read',
        'users:update',
        'profile:read',
        'profile:update',
      ],
      super_admin: [
        'recipes:*',
        'users:*',
        'roles:*',
        'profile:*',
        '*', // Todos los permisos
      ],
    };

    return defaultPermissions[roleName] || [];
  }
}
