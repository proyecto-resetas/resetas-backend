import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { StepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Step } from './entities/step.entity';

@Injectable()
export class StepsService {

  constructor(
    @InjectModel(Step.name) private stepModel: Model<Step>
  ){}
async create(createStepDto: StepDto) {

    const newStep = new this.stepModel(createStepDto);
    return newStep.save();

  }

async createMultipleSteps(steps: StepDto[]): Promise<Step[]> {

    return Promise.all(steps.map(step => this.create(step)));

}


  findAll() {
    return `This action returns all steps`;
  }

  findOne(id: number) {
    return `This action returns a #${id} step`;
  }

  update(id: number, updateStepDto: UpdateStepDto) {
    return `This action updates a #${id} step`;
  }

 async remove(id: string) {
    try {
      const deleteUser = await this.stepModel.findByIdAndDelete(id).exec();
  
      if (!deleteUser) {
        throw new NotFoundException(`Step with id ${id} not found`);
      }
  
      return deleteUser;
  
      } catch (error) {
        throw new HttpException(`Error fetching steps`, HttpStatus.INTERNAL_SERVER_ERROR);
      }
  }

}
