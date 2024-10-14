import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe } from './entities/receta.entity';
import { Model } from 'mongoose';
import { StepsService } from '../steps/steps.service';
import { GetRecipesQueryDto } from './dto/get-recipe-query.dto';

@Injectable()
export class RecipesService {

  constructor(
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    private readonly stepService: StepsService,
  ){}

async create(createRecipeDto: CreateRecetaDto): Promise<Recipe> {

   const savedSteps = await this.stepService.createMultipleSteps(createRecipeDto.steps);

   const recipeCreate = new this.recipeModel({
     ...createRecipeDto,
     steps: savedSteps,
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

  findOne(id: number) {
    return `This action returns a #${id} receta`;
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

  update(id: number, updateRecetaDto: UpdateRecetaDto) {
    return `This action updates a #${id} receta`;
  }

  remove(id: number) {
    return `This action removes a #${id} receta`;
  }
}
