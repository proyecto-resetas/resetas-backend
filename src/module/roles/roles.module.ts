import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Role, RoleSchema } from './entities/role.entity';
import { Permission, PermissionSchema } from './entities/permission.entity';
import { RoleService } from './services/role.service';
import { PermissionsGuard } from 'src/common/guard/permissions.guard';
import { RolesController } from './controllers/roles.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Role.name, schema: RoleSchema },
      { name: Permission.name, schema: PermissionSchema },
    ]),
  ],
  controllers: [RolesController],
  providers: [RoleService, PermissionsGuard],
  exports: [RoleService, PermissionsGuard],
})
export class RolesModule {}
