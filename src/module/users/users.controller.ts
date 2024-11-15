import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto, UpdateUserDto} from './dto';
import { ApiInternalServerErrorResponse, ApiOperation, ApiParam, ApiResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserRole } from 'src/common/guard/roles.enum';
import { Auth } from 'src/common/decorators/auth.decorator';
import { MyFavorite } from './entities/my-favorite.entity';
import { CreateFavoriteDto } from './dto/create-favorite.dto';

@ApiTags('users')
@Controller('users')
export default class UsersController {
  constructor(private readonly userService: UserService) {}

 @Post('createUser')
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente.' })
  @ApiResponse({ status: 400, description: 'Datos inválidos.' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }
  
  @Auth(UserRole.ADMIN)
  @Post(':email')
  @ApiOperation({ summary: 'Get user for email' })
  @ApiParam({ name: 'email', description: 'email user' })
  @ApiResponse({ status: 201, description: 'User found with email' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Server Error' })
  findOne(@Param('email') email: string) {
    return this.userService.findOneByEmail(email);
  }

  @Auth(UserRole.ADMIN)
  @Get(':id')
  @ApiOperation({ summary: 'Get user for email' })
  @ApiParam({ name: 'id', description: 'id user' })
  @ApiResponse({ status: 201, description: 'User found with id' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiInternalServerErrorResponse({ description: 'Server Error' })
  findById(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Patch(':id')
  @ApiResponse({ status: 201, description: 'User found with id' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 201, description: 'User found with id' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
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
  @ApiResponse({ status: 201, description: 'true' })
  @ApiResponse({ status: 400, description: 'false' })
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
