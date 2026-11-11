import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/guard/roles.enum';
import {
  DocGetUserByEmail,
  DocGetUserById,
  DocUpdateUser,
  DocDeleteUser,
} from './decorators/users-swagger.decorator';
import { Secure } from 'src/common/decorators/secure.decorator';

@ApiTags('users')
@Controller('users')
export default class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('admin/dashboard-stats')
  @Secure([UserRole.SUPER_ADMIN])
  async getAdminDashboardStats() {
    return this.userService.getAdminDashboardStats();
  }

  @Get()
  @Secure([UserRole.SUPER_ADMIN], ['users:read'])
  async findAllUsers() {
    return this.userService.findAllUsers();
  }

  @Patch(':id/role')
  @Secure([UserRole.SUPER_ADMIN], ['users:update'])
  async updateUserRole(
    @Param('id') id: string,
    @Body('role') role: string,
  ) {
    return this.userService.updateUserRole(id, role);
  }

  @Secure([UserRole.ADMIN, UserRole.USER], ['users:read'])
  @Post(':email')
  @DocGetUserByEmail()
  async findOne(@Param('email') email: string, @Request() req: any) {
    const user = await this.userService.findOneByEmailPublic(email);
    if (
      req.user?.role !== 'super_admin' &&
      String((user as any)?._id || (user as any)?.id) !== String(req.user?.sub)
    ) {
      throw new ForbiddenException(
        'No tienes permiso para consultar el perfil de otro usuario.',
      );
    }
    return user;
  }

  @Secure([UserRole.ADMIN, UserRole.USER])
  @Get(':id')
  @DocGetUserById()
  findById(@Param('id') id: string, @Request() req: any) {
    if (
      req.user?.role !== 'super_admin' &&
      String(req.user?.sub) !== String(id)
    ) {
      throw new ForbiddenException(
        'No tienes permiso para consultar el perfil de otro usuario.',
      );
    }
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @Secure([UserRole.ADMIN, UserRole.USER])
  @DocUpdateUser()
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req: any,
  ) {
    if (
      req.user?.role !== 'super_admin' &&
      String(req.user?.sub) !== String(id)
    ) {
      throw new ForbiddenException(
        'No tienes permiso para modificar el perfil de otro usuario.',
      );
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Secure([UserRole.SUPER_ADMIN], ['users:delete'])
  @DocDeleteUser()
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Agregar una receta a myFavorite
  @Post('favorite-recipe/:recipeId')
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:create'])
  async addFavoriteRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.userService.addFavoriteRecipe(userId, recipeId);
  }

  // Agregar una receta a myRecipe
  @Post('my-recipe/:recipeId')
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:create'])
  async addMyRecipe(@Param('recipeId') recipeId: string, @Request() req: any) {
    const userId = req.user.sub;
    return this.userService.addMyRecipe(userId, recipeId);
  }

  // Agregar una receta a myPurchased (restringido a SUPER_ADMIN; las compras normales usan POST /Recipes/purchase/:id)
  @Post('purchased-recipe/:recipeId')
  @Secure([UserRole.SUPER_ADMIN])
  async addPurchasedRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
    @Body() body?: { paymentReference?: string },
  ) {
    const userId = req.user.sub;
    return this.userService.addPurchasedRecipe(userId, recipeId, {
      paymentReference: body?.paymentReference,
    });
  }

  // Eliminar una receta de myFavorite
  @Delete('favorite-recipe/:recipeId')
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:delete'])
  async removeFavoriteRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.userService.removeFavoriteRecipe(userId, recipeId);
  }

  // Eliminar una receta de myRecipe
  @Delete('my-recipe/:recipeId')
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:delete'])
  async removeMyRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.userService.removeMyRecipe(userId, recipeId);
  }

  // Eliminar una receta de myPurchased
  @Delete('purchased-recipe/:recipeId')
  @Secure([UserRole.SUPER_ADMIN])
  async removePurchasedRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.userService.removePurchasedRecipe(userId, recipeId);
  }
}
