import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-receta.dto';
import { ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/guard/roles.enum';
import { Recipe } from './entities/recipes.entity';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';
import {
  DocCreateRecipe,
  DocGetRecipesFilter,
  DocGetRecipesByType,
  DocGetAllRecipes,
  DocGetRecipeById,
  DocUpdateRecipe,
  DocDeleteRecipe,
} from './decorators/recipes-swagger.decorator';

@ApiTags('recetas')
@Controller('Recipes')
export class RecetasController {
  constructor(private readonly recipesService: RecipesService) {}

  @Auth(UserRole.ADMIN)
  @Post('CreateRecipes')
  @DocCreateRecipe()
  async create(
    @Body() createRecetaDto: CreateRecipeDto,
    @Request() req: any,
  ): Promise<Recipe> {
    const userId = req.user?.sub;
    const newRecipe = await this.recipesService.create(createRecetaDto, userId);
    console.log(newRecipe);
    return newRecipe;
  }

  @Get('getRecipeFilter')
  @DocGetRecipesFilter()
  async getRecipes(
    @Query() filterDto: GetRecipesQueryDto,
  ): Promise<{ recipes: Recipe[]; total: number }> {
    return this.recipesService.findRecipesCategory(filterDto);
  }

  @Get(':type/:userId')
  @DocGetRecipesByType()
  async findRecipes(
    @Param('type') type: 'favorite' | 'myRecipes',
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    if (!['favorite', 'myrecipe'].includes(type)) {
      throw new BadRequestException(
        'Invalid "type". It must be either "favorite" or "myrecipe".',
      );
    }

    return this.recipesService.findRecipesProperty(
      userId,
      { type },
      page,
      limit,
    );
  }

  @Auth(UserRole.ADMIN)
  @Get('all')
  @DocGetAllRecipes()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get(':id')
  @DocGetRecipeById()
  findOne(@Param('id') id: string) {
    return this.recipesService.findOneById(id);
  }

  @Patch('update/:id')
  @DocUpdateRecipe()
  update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecetaDto);
  }

  @Delete(':id')
  @DocDeleteRecipe()
  remove(@Param('id') id: string) {
    return this.recipesService.remove(+id);
  }
}
