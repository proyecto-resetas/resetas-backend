import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { RecipesService } from './recetas.service';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/auth.decorator';
import { UserRole } from 'src/common/guard/roles.enum';
import { Recipe } from './entities/receta.entity';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';

@ApiTags('recetas')
@Controller('Recipes')
export class RecetasController {
  constructor(private readonly recipesService: RecipesService) {}

  @Auth(UserRole.ADMIN)
  @Post('CreateRecetas')
  @ApiResponse({ status: 201, description: 'Created Recipe' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  async create(@Body() createRecetaDto: CreateRecetaDto): Promise<Recipe> {
  const newRecipe = await this.recipesService.create(createRecetaDto);
  
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

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecetaDto) {
    return this.recipesService.update(+id, updateRecetaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipesService.remove(+id);
  }
}
