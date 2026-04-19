import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from 'src/common/guard/roles.enum';
import { Auth } from 'src/common/decorators/auth.decorator';
import { MyFavorite } from './entities/my-favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import {
  DocGetUserByEmail,
  DocGetUserById,
  DocUpdateUser,
  DocDeleteUser,
} from './decorators/users-swagger.decorator';

@ApiTags('users')
@Controller('users')
export default class UsersController {
  constructor(private readonly userService: UserService) {}

  @Auth(UserRole.ADMIN)
  @Post(':email')
  @DocGetUserByEmail()
  findOne(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Auth(UserRole.ADMIN)
  @Get(':id')
  @DocGetUserById()
  findById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @DocUpdateUser()
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @DocDeleteUser()
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }

  // Agregar una receta a createdRecipeForMe
  // @Post(':userId/created-recipe')
  // async addCreatedRecipeForMe(
  //   @Param('userId') userId: string,
  //   @Body() recipe: CreatedRecipeForMe,
  // ) {
  //   return this.userService.addCreatedRecipeForMe(userId, recipe);
  // }

  // Agregar una receta a myFavorite
  @Post('favorite-recipe/:userId')
  //@ApiResponse({ status: 201, description: 'true' })
  //@ApiResponse({ status: 400, description: 'false' })
  async addFavoriteRecipe(
    @Param('userId') userId: string,
    @Body() recipe: CreateFavoriteDto,
  ) {
    return this.userService.addFavoriteRecipe(userId, recipe);
  }

  @Post(':userId/my-recipe')
  async addMyRecipe(
    @Param('userId') userId: string,
    @Body() recipe: MyFavorite,
  ) {
    return this.userService.addMyRecipe(userId, recipe);
  }

  // Eliminar una receta de createdRecipeForMe
  // @Delete(':userId/created-recipe/:recipeId')
  // async removeCreatedRecipeForMe(
  //   @Param('userId') userId: string,
  //   @Param('recipeId') recipeId: string,
  // ) {
  //   return this.userService.removeCreatedRecipeForMe(userId, recipeId);
  // }

  // Eliminar una receta de myFavorite
  @Delete(':userId/favorite-recipe/:recipeId')
  async removeFavoriteRecipe(
    @Param('userId') userId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.userService.removeFavoriteRecipe(userId, recipeId);
  }

  @Delete(':userId/my-recipe/:recipeId')
  async removeMyRecipe(
    @Param('userId') userId: string,
    @Param('recipeId') recipeId: string,
  ) {
    return this.userService.removeMyRecipe(userId, recipeId);
  }
}
