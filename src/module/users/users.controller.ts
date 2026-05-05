import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
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

  @Secure([UserRole.ADMIN, UserRole.USER], ['users:read'])
  @Post(':email')
  @DocGetUserByEmail()
  findOne(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Secure([UserRole.ADMIN, UserRole.USER], ['users:read'])
  @Get(':id')
  @DocGetUserById()
  findById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:update'])
  @DocUpdateUser()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:delete'])
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

  // Agregar una receta a myPurchased
  @Post('purchased-recipe/:recipeId')
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:create'])
  async addPurchasedRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.userService.addPurchasedRecipe(userId, recipeId);
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
  @Secure([UserRole.ADMIN, UserRole.USER], ['users:delete'])
  async removePurchasedRecipe(
    @Param('recipeId') recipeId: string,
    @Request() req: any,
  ) {
    const userId = req.user.sub;
    return this.userService.removePurchasedRecipe(userId, recipeId);
  }
}
