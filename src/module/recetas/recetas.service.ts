import { Injectable } from '@nestjs/common';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe } from './entities/receta.entity';
import { Model } from 'mongoose';
import { StepsService } from '../steps/steps.service';

@Injectable()
export class RecetasService {

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
  
  return recipeCreate.save();

}

  findAll() {
    return `This action returns all recetas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} receta`;
  }

  update(id: number, updateRecetaDto: UpdateRecetaDto) {
    return `This action updates a #${id} receta`;
  }

  remove(id: number) {
    return `This action removes a #${id} receta`;
  }
}
