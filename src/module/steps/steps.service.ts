import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Step } from './entities/step.entity';

@Injectable()
export class StepsService {
  constructor(@InjectModel(Step.name) private stepModel: Model<Step>) {}

  async create(createStepDto: StepDto) {
    const newStep = new this.stepModel(createStepDto);
    return newStep.save();
  }

  async findAll() {
    return this.stepModel.find().exec();
  }

  async findOne(id: string) {
    const step = await this.stepModel.findById(id).exec();
    if (!step) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }
    return step;
  }

  async update(id: string, updateStepDto: UpdateStepDto) {
    const step = await this.stepModel
      .findByIdAndUpdate(id, updateStepDto, { new: true })
      .exec();
    if (!step) {
      throw new NotFoundException(`Step with id ${id} not found`);
    }
    return step;
  }

  async createMultipleSteps(steps: StepDto[]): Promise<Step[]> {
    // Si no hay pasos, devolver un array vacío inmediatamente
    if (steps.length === 0) {
      return [];
    }
    // Si hay pasos, proceder con la creación
    return Promise.all(steps.map((step) => this.create(step)));
  }

  async remove(id: string) {
    try {
      const deleteUser = await this.stepModel.findByIdAndDelete(id).exec();

      if (!deleteUser) {
        throw new NotFoundException(`Step with id ${id} not found`);
      }

      return deleteUser;
    } catch (error) {
      throw new HttpException(
        `Error fetching steps`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
