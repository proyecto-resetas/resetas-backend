import {
  Injectable,
  NotFoundException,
  ConflictException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreatePermissionDto,
  UpdatePermissionDto,
} from '../dto';

interface CachedRolePermissions {
  permissions: string[];
  expiresAt: number;
}

@Injectable()
export class RoleService implements OnModuleInit {
  private static readonly CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
  private readonly rolePermissionsCache = new Map<
    string,
    CachedRolePermissions
  >();
  private activePermissionKeysCache: {
    keys: Set<string>;
    disabledKeys: Set<string>;
    expiresAt: number;
  } | null = null;

  constructor(
    @InjectModel(Role.name) private readonly roleModel: Model<Role>,
    @InjectModel(Permission.name)
    private readonly permissionModel: Model<Permission>,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      await this.seedDefaultPermissions();
      await this.seedDefaultRoles();
      this.invalidateCache();
    } catch (error) {
      console.error('Error initializing default permissions/roles:', error);
    }
  }

  /**
   * Limpia la caché en memoria para reflejar cambios en roles o permisos de inmediato
   */
  invalidateCache(): void {
    this.rolePermissionsCache.clear();
    this.activePermissionKeysCache = null;
  }

  private async getPermissionStatusSets(): Promise<{
    keys: Set<string>;
    disabledKeys: Set<string>;
  }> {
    const now = Date.now();
    if (
      this.activePermissionKeysCache &&
      this.activePermissionKeysCache.expiresAt > now
    ) {
      return {
        keys: this.activePermissionKeysCache.keys,
        disabledKeys: this.activePermissionKeysCache.disabledKeys,
      };
    }

    const allPerms = await this.permissionModel
      .find()
      .select('key isActive')
      .lean()
      .exec();

    const keys = new Set<string>();
    const disabledKeys = new Set<string>();

    for (const p of allPerms) {
      if (p.isActive === false) {
        disabledKeys.add(p.key);
      } else {
        keys.add(p.key);
      }
    }

    this.activePermissionKeysCache = {
      keys,
      disabledKeys,
      expiresAt: now + RoleService.CACHE_TTL_MS,
    };

    return { keys, disabledKeys };
  }

  /**
   * Obtiene los permisos activos de un rol por su nombre (usando caché en memoria + MongoDB)
   */
  async getPermissionsByRoleName(roleName: string): Promise<string[]> {
    if (!roleName) return [];

    const now = Date.now();
    const cached = this.rolePermissionsCache.get(roleName);
    if (cached && cached.expiresAt > now) {
      return cached.permissions;
    }

    const [role, permStatus] = await Promise.all([
      this.roleModel
        .findOne({
          name: roleName,
          isActive: true,
        })
        .lean()
        .exec(),
      this.getPermissionStatusSets(),
    ]);

    const rawPermissions: string[] = role
      ? role.permissions || []
      : this.getDefaultPermissions(roleName);

    // Filtrar permisos que hayan sido desactivados globalmente en la colección 'permissions'
    const effectivePermissions = rawPermissions.filter(
      (permKey) => !permStatus.disabledKeys.has(permKey),
    );

    this.rolePermissionsCache.set(roleName, {
      permissions: effectivePermissions,
      expiresAt: now + RoleService.CACHE_TTL_MS,
    });

    return effectivePermissions;
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
   * Crea un nuevo rol en MongoDB
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
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

    const saved = await role.save();
    this.invalidateCache();
    return saved;
  }

  /**
   * Obtiene todos los roles (activos e inactivos). Si la colección está vacía, inicializa los 3 roles base.
   */
  async findAll(includeInactive = false): Promise<Role[]> {
    const count = await this.roleModel.countDocuments().exec();
    if (count === 0) {
      await this.seedDefaultRoles();
    }
    const filter = includeInactive ? {} : { isActive: true };
    return await this.roleModel.find(filter).sort({ name: 1 }).exec();
  }

  /**
   * Inicializa el catálogo de permisos en la colección 'permissions' de MongoDB
   */
  async seedDefaultPermissions(): Promise<void> {
    const baseCatalog: Array<{
      key: string;
      name: string;
      module: string;
      description: string;
    }> = [
      // Recetas
      {
        key: 'recipes:read',
        name: 'Ver catálogo de recetas',
        module: 'recipes',
        description: 'Permite listar, filtrar y consultar recetas e ingredientes.',
      },
      {
        key: 'recipes:read:own',
        name: 'Ver recetas propias',
        module: 'recipes',
        description: 'Permite consultar las recetas creadas o adquiridas por el usuario.',
      },
      {
        key: 'recipes:create',
        name: 'Crear y publicar recetas',
        module: 'recipes',
        description: 'Permite crear nuevas recetas y usar las herramientas de IA.',
      },
      {
        key: 'recipes:create:own',
        name: 'Guardar recetas en lista personal',
        module: 'recipes',
        description: 'Permite gestionar la colección personal de recetas.',
      },
      {
        key: 'recipes:update',
        name: 'Actualizar recetas',
        module: 'recipes',
        description: 'Permite editar recetas creadas por el chef.',
      },
      {
        key: 'recipes:update:own',
        name: 'Actualizar recetas propias',
        module: 'recipes',
        description: 'Permite editar únicamente las recetas propias.',
      },
      {
        key: 'recipes:delete',
        name: 'Eliminar recetas',
        module: 'recipes',
        description: 'Permite eliminar recetas del catálogo.',
      },
      {
        key: 'recipes:delete:own',
        name: 'Eliminar recetas propias',
        module: 'recipes',
        description: 'Permite eliminar recetas de la lista personal.',
      },
      {
        key: 'recipes:*',
        name: 'Control total de recetas',
        module: 'recipes',
        description: 'Acceso completo a todas las operaciones de recetas.',
      },

      // Pasos (Steps)
      {
        key: 'steps:read',
        name: 'Ver pasos de recetas desbloqueadas',
        module: 'steps',
        description: 'Permite consultar el paso a paso de recetas compradas o propias.',
      },
      {
        key: 'steps:create',
        name: 'Crear pasos de preparación',
        module: 'steps',
        description: 'Permite registrar pasos dentro de una receta.',
      },
      {
        key: 'steps:update',
        name: 'Editar pasos de preparación',
        module: 'steps',
        description: 'Permite actualizar los pasos de una receta propia.',
      },
      {
        key: 'steps:delete',
        name: 'Eliminar pasos de preparación',
        module: 'steps',
        description: 'Permite eliminar pasos de una receta propia.',
      },
      {
        key: 'steps:*',
        name: 'Control total de pasos',
        module: 'steps',
        description: 'Acceso completo a todas las operaciones de pasos.',
      },

      // Usuarios y Perfil
      {
        key: 'users:read',
        name: 'Consultar datos de usuario',
        module: 'users',
        description: 'Permite consultar información del perfil de usuario.',
      },
      {
        key: 'users:create',
        name: 'Gestionar listas del usuario',
        module: 'users',
        description: 'Permite agregar recetas a favoritos o listas del usuario.',
      },
      {
        key: 'users:update',
        name: 'Actualizar datos de usuario',
        module: 'users',
        description: 'Permite actualizar datos personales, bancarios y de facturación.',
      },
      {
        key: 'users:delete',
        name: 'Eliminar elementos o cuentas de usuario',
        module: 'users',
        description: 'Permite remover favoritos o eliminar usuarios.',
      },
      {
        key: 'users:*',
        name: 'Control total de usuarios',
        module: 'users',
        description: 'Acceso completo a la administración de usuarios.',
      },
      {
        key: 'profile:read',
        name: 'Ver mi perfil',
        module: 'profile',
        description: 'Permite visualizar la sección Mi Perfil.',
      },
      {
        key: 'profile:update',
        name: 'Editar mi perfil',
        module: 'profile',
        description: 'Permite editar datos personales, cuenta bancaria y facturación.',
      },
      {
        key: 'profile:*',
        name: 'Control total de perfil',
        module: 'profile',
        description: 'Acceso completo a todas las opciones de perfil.',
      },

      // Almacenamiento S3
      {
        key: 's3:upload',
        name: 'Subir imágenes a S3',
        module: 's3',
        description: 'Permite subir fotos de perfil, portadas de recetas e imágenes de pasos.',
      },

      // Roles y Permisos
      {
        key: 'roles:read',
        name: 'Ver roles y permisos',
        module: 'roles',
        description: 'Permite consultar los roles y el catálogo de permisos.',
      },
      {
        key: 'roles:create',
        name: 'Crear roles y permisos',
        module: 'roles',
        description: 'Permite registrar nuevos roles y permisos en la base de datos.',
      },
      {
        key: 'roles:update',
        name: 'Actualizar roles y permisos',
        module: 'roles',
        description: 'Permite modificar los permisos asignados a cada rol.',
      },
      {
        key: 'roles:delete',
        name: 'Eliminar o desactivar roles y permisos',
        module: 'roles',
        description: 'Permite desactivar o eliminar roles y permisos.',
      },
      {
        key: 'roles:*',
        name: 'Control total de roles y permisos',
        module: 'roles',
        description: 'Acceso completo a la configuración de seguridad y RBAC.',
      },

      // Super Admin Wildcard
      {
        key: '*',
        name: 'Super Administrador (Acceso Total)',
        module: 'system',
        description: 'Otorga todos los permisos del sistema sin restricción.',
      },
    ];

    for (const item of baseCatalog) {
      await this.permissionModel
        .updateOne(
          { key: item.key },
          {
            $setOnInsert: {
              key: item.key,
              name: item.name,
              module: item.module,
              description: item.description,
              isActive: true,
            },
          },
          { upsert: true },
        )
        .exec();
    }
  }

  private async seedDefaultRoles(): Promise<void> {
    const defaults = [
      {
        name: 'user',
        displayName: 'Usuario (Comprador)',
        description: 'Explora, guarda favoritos y compra recetas paso a paso.',
        permissions: this.getDefaultPermissions('user'),
        isActive: true,
      },
      {
        name: 'admin',
        displayName: 'Chef (Creador)',
        description:
          'Crea, publica y gestiona sus propias recetas en Recetarium.',
        permissions: this.getDefaultPermissions('admin'),
        isActive: true,
      },
      {
        name: 'super_admin',
        displayName: 'Super Administrador',
        description:
          'Control total de usuarios, recetas, roles, permisos y ventas.',
        permissions: this.getDefaultPermissions('super_admin'),
        isActive: true,
      },
    ];

    for (const r of defaults) {
      const existing = await this.roleModel.findOne({ name: r.name }).exec();
      if (!existing) {
        await this.roleModel.create(r);
      } else if (r.name === 'user' || r.name === 'admin') {
        const essential = [
          's3:upload',
          'users:delete',
          'profile:read',
          'profile:update',
        ];
        const missing = essential.filter(
          (perm) => !existing.permissions.includes(perm),
        );
        if (missing.length > 0) {
          await this.roleModel
            .updateOne(
              { _id: existing._id },
              { $addToSet: { permissions: { $each: missing } } },
            )
            .exec();
        }
      }
    }
  }

  // ===========================================================================
  // CRUD DE PERMISOS EN BASE DE DATOS (COLECCIÓN 'permissions')
  // ===========================================================================

  async findAllPermissions(includeInactive = true): Promise<Permission[]> {
    const count = await this.permissionModel.countDocuments().exec();
    if (count === 0) {
      await this.seedDefaultPermissions();
    }
    const filter = includeInactive ? {} : { isActive: true };
    return await this.permissionModel
      .find(filter)
      .sort({ module: 1, key: 1 })
      .exec();
  }

  async createPermission(dto: CreatePermissionDto): Promise<Permission> {
    const cleanKey = dto.key.trim();
    const existing = await this.permissionModel
      .findOne({ key: cleanKey })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Ya existe un permiso con la clave "${cleanKey}"`,
      );
    }

    const created = new this.permissionModel({
      key: cleanKey,
      name: dto.name.trim(),
      module: (dto.module || cleanKey.split(':')[0] || 'general').trim(),
      description: dto.description?.trim() ?? '',
      isActive: dto.isActive ?? true,
    });

    const saved = await created.save();
    this.invalidateCache();
    return saved;
  }

  async updatePermission(
    id: string,
    dto: UpdatePermissionDto,
  ): Promise<Permission> {
    const current = await this.permissionModel.findById(id).exec();
    if (!current) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado`);
    }

    const oldKey = current.key;
    const newKey = dto.key?.trim();

    if (newKey && newKey !== oldKey) {
      const duplicate = await this.permissionModel
        .findOne({ key: newKey, _id: { $ne: id } })
        .exec();
      if (duplicate) {
        throw new ConflictException(
          `Ya existe otro permiso con la clave "${newKey}"`,
        );
      }
    }

    const updated = await this.permissionModel
      .findByIdAndUpdate(id, dto, { new: true, runValidators: true })
      .exec();

    if (!updated) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado`);
    }

    if (newKey && newKey !== oldKey) {
      await this.roleModel
        .updateMany(
          { permissions: oldKey },
          { $set: { 'permissions.$': newKey } },
        )
        .exec();
    }

    this.invalidateCache();
    return updated;
  }

  async deletePermission(id: string): Promise<{ message: string; key: string }> {
    const perm = await this.permissionModel.findByIdAndDelete(id).exec();
    if (!perm) {
      throw new NotFoundException(`Permiso con ID "${id}" no encontrado`);
    }

    await this.roleModel
      .updateMany(
        { permissions: perm.key },
        { $pull: { permissions: perm.key } },
      )
      .exec();

    this.invalidateCache();
    return {
      message: `Permiso "${perm.key}" eliminado correctamente`,
      key: perm.key,
    };
  }

  // ===========================================================================
  // CRUD DE ROLES EN BASE DE DATOS (COLECCIÓN 'roles')
  // ===========================================================================

  async findOneById(id: string): Promise<Role> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }
    return role;
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
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

    this.invalidateCache();
    return role;
  }

  async remove(id: string): Promise<{ message: string }> {
    const role = await this.roleModel.findById(id).exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    role.isActive = false;
    await role.save();
    this.invalidateCache();

    return { message: `Rol "${role.displayName}" desactivado exitosamente` };
  }

  async deletePermanently(id: string): Promise<{ message: string }> {
    const role = await this.roleModel.findByIdAndDelete(id).exec();
    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    this.invalidateCache();
    return { message: `Rol "${role.displayName}" eliminado permanentemente` };
  }

  async activate(id: string): Promise<Role> {
    const role = await this.roleModel
      .findByIdAndUpdate(id, { isActive: true }, { new: true })
      .exec();

    if (!role) {
      throw new NotFoundException(`Rol con ID "${id}" no encontrado`);
    }

    this.invalidateCache();
    return role;
  }

  async createOrUpdateRole(roleData: Partial<Role>): Promise<Role> {
    const updated = await this.roleModel
      .findOneAndUpdate({ name: roleData.name }, roleData, {
        upsert: true,
        new: true,
      })
      .exec();
    this.invalidateCache();
    return updated;
  }

  private getDefaultPermissions(roleName: string): string[] {
    const defaultPermissions: Record<string, string[]> = {
      user: [
        'recipes:read',
        'recipes:read:own',
        'recipes:create:own',
        'recipes:update:own',
        'recipes:delete:own',
        'steps:read',
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'profile:read',
        'profile:update',
        's3:upload',
      ],
      admin: [
        'recipes:read',
        'recipes:create',
        'recipes:update',
        'recipes:delete',
        'steps:read',
        'steps:create',
        'steps:update',
        'steps:delete',
        'users:read',
        'users:create',
        'users:update',
        'users:delete',
        'profile:read',
        'profile:update',
        's3:upload',
      ],
      super_admin: [
        'recipes:*',
        'steps:*',
        'users:*',
        'roles:*',
        'profile:*',
        's3:upload',
        '*',
      ],
    };

    return defaultPermissions[roleName] || [];
  }
}
