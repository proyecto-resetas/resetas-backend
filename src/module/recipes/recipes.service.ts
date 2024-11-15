import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-receta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe } from './entities/recipes.entity';
import { Model } from 'mongoose';
//import { StepsService } from '../steps/steps.service';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';

@Injectable()
export class RecipesService {

  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
   // private readonly stepService: StepsService,
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
