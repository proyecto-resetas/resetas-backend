import { Controller, Get, Post, Body, Patch, Param, Delete, Query, BadRequestException } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-receta.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/guard/roles.enum';
import { Recipe } from './entities/recipes.entity';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';



@ApiTags('recetas')
@Controller('Recipes')
export class RecetasController {
  constructor(private readonly recipesService: RecipesService) {}

  @Auth(UserRole.ADMIN)
  @Post('CreateRecipes')
  @ApiResponse({ status: 201, description: 'Created Recipe' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  async create(@Body() createRecetaDto: CreateRecipeDto): Promise<Recipe> {
  const newRecipe = await this.recipesService.create(createRecetaDto);
  console.log(newRecipe);
  return newRecipe
  }

  @ApiResponse({ status: 200, description: 'Finded Recipe' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  @Get('getRecipeFilter')
  async getRecipes(
    @Query() filterDto: GetRecipesQueryDto
  ): Promise<{ recipes: Recipe[], total: number }> {
    return this.recipesService.findRecipesCategory(filterDto);
  }

  // @Get('favorites/:userId')
  // async getFavorites(
  //   @Param('userId') userId: string,
  //   @Query('page') page = '1',
  //   @Query('limit') limit = '10',
  // ) {
  //   return this.recipesService.findRecipesProperty(
  //     userId,

  //     parseInt(page, 10),
  //     parseInt(limit, 10),
  //   );
  // }
  @Get(':type/:userId')
  async findRecipes(
    @Param('type') type: 'favorite' | 'myRecipes',
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    // Validar que el tipo sea válido
    if (!['favorite', 'myrecipe'].includes(type)) {
      throw new BadRequestException(
        'Invalid "type". It must be either "favorite" or "myrecipe".',
      );
    }

    // Llama al servicio con los parámetros necesarios
    return this.recipesService.findRecipesProperty(userId, { type }, page, limit);
  }
  @Auth(UserRole.ADMIN)
  @Get('all')
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Finded Recipe' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  findOne(@Param('id') id: string) {
    return this.recipesService.findOneById(id);
  }

  @Patch('update/:id')
  update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecetaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipesService.remove(+id);
  }
}
