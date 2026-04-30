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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { RecipesService } from './recipes.service';
import { AIProvider } from '../ai';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-receta.dto';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';
import { Secure } from 'src/common/decorators/secure.decorator';
import { UserRole } from 'src/common/guard/roles.enum';
import { Recipe } from './entities/recipes.entity';
import {
  DocCreateRecipe,
  DocGetRecipesFilter,
  DocGetRecipesByType,
  DocGetAllRecipes,
  DocGetRecipeById,
  DocUpdateRecipe,
  DocDeleteRecipe,
  DocGetIngredientsAndUtensils,
} from './decorators/recipes-swagger.decorator';

@ApiTags('recetas')
@Controller('Recipes')
export class RecetasController {
  constructor(private readonly recipesService: RecipesService) {}

  /**
   * Carga una imagen y usa un servicio de IA (Gemini, OpenAI, Ollama) para analizarla.
   */
  @Post('analyze-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @Secure([UserRole.ADMIN], ['recipes:create'])
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de la receta para analizar',
        },
        prompt: {
          type: 'string',
          example: 'Qué ves en esta imagen?',
          description: 'Prompt opcional',
        },
        provider: {
          type: 'string',
          enum: Object.values(AIProvider),
          description: 'Proveedor de IA a usar',
          default: AIProvider.OLLAMA,
        },
      },
    },
  })
  async analyzeImage(
    @UploadedFile() file: Express.Multer.File,
    @Body('prompt') prompt?: string,
    @Body('provider') provider?: AIProvider,
  ): Promise<{ response: string }> {
    if (!file) {
      throw new BadRequestException(
        'Se requiere una imagen en el campo "image"',
      );
    }
    const response = await this.recipesService.analyzeRecipeImage(
      file,
      prompt,
      provider,
    );
    return { response };
  }

  /**
   * Analiza una imagen de receta y la guarda automáticamente en la base de datos.
   */
  @Secure([UserRole.ADMIN], ['recipes:create'])
  @Post('analyze-and-save')
  @UseInterceptors(FileInterceptor('image'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Imagen de la receta para analizar y guardar',
        },
        prompt: {
          type: 'string',
          example: 'Analiza esta receta y guárdala',
          description: 'Prompt opcional',
        },
        provider: {
          type: 'string',
          enum: Object.values(AIProvider),
          description: 'Proveedor de IA a usar',
          default: AIProvider.OLLAMA,
        },
      },
    },
  })
  async analyzeAndSave(
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
    @Body('prompt') prompt?: string,
    @Body('provider') provider?: AIProvider,
  ): Promise<Recipe> {
    if (!file) {
      throw new BadRequestException('Se requiere una imagen');
    }

    const userId = req.user?.sub;
    return await this.recipesService.analyzeAndCreateRecipe(
      file,
      userId,
      prompt,
      provider,
    );
  }

  @Secure([UserRole.ADMIN], ['recipes:create'])
  @Post('CreateRecipes')
  @DocCreateRecipe()
  async create(
    @Body() createRecetaDto: CreateRecipeDto,
    @Request() req: any,
  ): Promise<{ message: string, recipe: Recipe }> {
    const userId = req.user?.sub;
    const newRecipe = await this.recipesService.create(createRecetaDto, userId);

    if (newRecipe ) {
      return  {
        message: 'Recipe created successfully',
        recipe: newRecipe,
      };
    }
    else {
      return {
        message: 'Failed to create recipe',
        recipe: null,
      };
    }
  }

  @Get('getRecipeFilter')
  @Secure([UserRole.ADMIN, UserRole.USER], ['recipes:read'])
  @DocGetRecipesFilter()
  async getRecipes(
    @Query() filterDto: GetRecipesQueryDto,
  ): Promise<{ recipes: Recipe[]; total: number }> {
    return this.recipesService.findRecipesCategory(filterDto);
  }

  @Secure([UserRole.ADMIN, UserRole.USER], ['recipes:read'])
  @Get('all')
  @DocGetAllRecipes()
  findAll() {
    return this.recipesService.findAll();
  }

  @Get('ingredients-utensils/:id')
  @Secure([UserRole.ADMIN, UserRole.USER], ['recipes:read'])
  @DocGetIngredientsAndUtensils()
  findIngredientsAndUtensils(@Param('id') id: string) {
    return this.recipesService.findIngredientsAndUtensils(id);
  }

  @Get(':type/:userId')
  @Secure([UserRole.ADMIN, UserRole.USER], ['recipes:read'])
  @DocGetRecipesByType()
  async findRecipes(
    @Param('type') type: 'favorite' | 'myRecipes',
    @Param('userId') userId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    if (!['favorite', 'myRecipes'].includes(type)) {
      throw new BadRequestException(
        'Invalid "type". It must be either "favorite" or "myRecipes".',
      );
    }

    return this.recipesService.findRecipesProperty(
      userId,
      { type },
      page,
      limit,
    );
  }

  @Get(':id')
  @Secure([UserRole.ADMIN, UserRole.USER], ['recipes:read'])
  @DocGetRecipeById()
  findOne(@Param('id') id: string) {
    return this.recipesService.findOneById(id);
  }

  @Patch('update/:id')
  @Secure([UserRole.ADMIN], ['recipes:update'])
  @DocUpdateRecipe()
  update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecipeDto) {
    return this.recipesService.update(id, updateRecetaDto);
  }

  @Delete(':id')
  @Secure([UserRole.ADMIN], ['recipes:delete'])
  @DocDeleteRecipe()
  remove(@Param('id') id: string) {
    return this.recipesService.remove(+id);
  }
}
