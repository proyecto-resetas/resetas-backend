import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-receta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe } from './entities/recipes.entity';
import { Model } from 'mongoose';
//import { StepsService } from '../steps/steps.service';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';
import { UserService } from '../users/users.service';

@Injectable()
export class RecipesService {

  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
   // private readonly stepService: StepsService,
   private readonly userService: UserService,

  ){}

async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {

  //  const savedSteps = await this.stepService.createMultipleSteps(createRecipeDto.steps);

   const recipeCreate = new this.recipeModel({
     ...createRecipeDto,
    //  steps: savedSteps,
   });
  
  return await recipeCreate.save();

}

async findAll() {
   
    try{
      const recipes = await this.recipeModel.find();
      if (!recipes) {
        throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
      }
      return recipes;

     } catch(error){
       throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
     }
  }

async  findRecipesCategory(
  filterDto: GetRecipesQueryDto
  ): Promise<{ recipes: Recipe[], total: number }> {

    const { category, createdBy, level, page, limit } = filterDto;

  const filters: any = {}; 
   
    if (category) filters.category = category;
    if (createdBy) filters.createdBy = createdBy;
    if (level) filters.level = level;

    const skip = (page - 1) * limit;

    const [recipes, total] = await Promise.all([
      this.recipeModel.find(filters).skip(skip).limit(limit).exec(),
      this.recipeModel.countDocuments(filters).exec(),
    ]);

    return { recipes, total };
}

// async findRecipesFavorite(userId: string, page = 1, limit = 10) {
//   // Verificar si el usuario existe
//   const user = await this.userService.findOneById(userId);
//   if (!user) {
//     throw new NotFoundException('User not found');
//   }

//   // Extraer los IDs de las recetas favoritas del usuario
//   const favoriteRecipeIds = user.myFavorite.map(fav => fav.idRecipe);

//   if (favoriteRecipeIds.length === 0) {
//     return { recipes: [], total: 0 };
//   }

//   // Aplicar paginación
//   const skip = (page - 1) * limit;

//   // Consultar las recetas favoritas
//   const [recipes, total] = await Promise.all([
//     this.recipeModel
//       .find({ _id: { $in: favoriteRecipeIds } })
//       .skip(skip)
//       .limit(limit)
//       .exec(),
//     this.recipeModel.countDocuments({ _id: { $in: favoriteRecipeIds } }).exec(),
//   ]);

//   return { recipes, total };
// }

async findRecipesProperty(userId: string, query: { type: 'favorite' | 'myRecipes' }, page: number, limit: number) {
  const { type } = query;

  // Verificar si el usuario existe
  const user = await this.userService.findOneById(userId);
  if (!user) {
    throw new NotFoundException('User not found');
  }

  // Determinar la propiedad a consultar
  let recipeIds: string[] = [];
  if (type === 'favorite') {
    recipeIds = user.myFavorite.map((fav) => fav.idRecipe);
  } else if (type === 'myRecipes') {
    recipeIds = user.myRecipe.map((recipe) => recipe.idRecipe);
  } else {
    throw new NotFoundException('Invalid query parameter. Allowed values are "favorite" or "myrecipe".');
  }

  if (recipeIds.length === 0) {
    return { recipes: [], total: 0 };
  }

  // Aplicar paginación
  const skip = (page - 1) * limit;

  // Consultar las recetas según la propiedad seleccionada
  const [recipes, total] = await Promise.all([
    this.recipeModel
      .find({ _id: { $in: recipeIds } })
      .skip(skip)
      .limit(limit)
      .exec(),
    this.recipeModel.countDocuments({ _id: { $in: recipeIds } }).exec(),
  ]);

  return { recipes, total };
}

async findOneById(id: string) {
  try{
    const user = await this.recipeModel.findById(id).exec();
    if (!user) {
      throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
    }
    return user;
  } catch(error){
    throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}



async update(id: string, updateRecipeDto){
  try {
        const recipe = await this.recipeModel.findById(id).exec();
      if (!recipe) {
          throw new HttpException(`Recipe not found`, HttpStatus.NOT_FOUND);
        }
        const updatedRecipe = await this.recipeModel
        .findByIdAndUpdate(id, updateRecipeDto, { new: true }).exec();
  
      if (!updatedRecipe) {
        throw new NotFoundException(`recipe with id ${id} not found`);
      }
        return updatedRecipe;
  
      } catch (error) {
        throw new HttpException(`Error fetching recipe`, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

  // async update(nameRecipe: string, updateRecetaDto: UpdateRecetaDto) {
  //   try {
  //     const user = await this.userModel.findOne(nameRecipe).exec();
  //   if (!user) {
  //       throw new HttpException(`User not found`, HttpStatus.NOT_FOUND);
  //     }
  //     const updatedUser = await this.userModel
  //     .findByIdAndUpdate(id, updateUserDto, { new: true })
  //     .exec();

  //   if (!updatedUser) {
  //     throw new NotFoundException(`User with id ${id} not found`);
  //   }

  //     return updatedUser;

  //   } catch (error) {
  //     throw new HttpException(`Error fetching user`, HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }

  remove(id: number) {
    return `This action removes a #${id} receta`;
  }
}
