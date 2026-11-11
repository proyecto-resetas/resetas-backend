import {
  ForbiddenException,
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
import { UserService } from '../users/users.service';
import { Recipe } from '../recipes/entities/recipes.entity';

@Injectable()
export class StepsService {
  constructor(
    @InjectModel(Step.name) private stepModel: Model<Step>,
    @InjectModel(Recipe.name) private recipeModel: Model<Recipe>,
    private readonly userService: UserService,
  ) {}

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

  private async verifyStepOwnership(
    stepId: string,
    userId?: string,
    userRole?: string,
  ): Promise<void> {
    if (userRole === 'super_admin') return;
    const parentRecipe = await this.recipeModel
      .findOne({ steps: stepId })
      .select('createdBy')
      .exec();
    if (!parentRecipe) return;
    const creatorId = String(
      (parentRecipe.createdBy as any)?._id || parentRecipe.createdBy || '',
    );
    if (!userId || creatorId !== String(userId)) {
      throw new ForbiddenException(
        'No tienes permiso para modificar o eliminar pasos de una receta que no creaste.',
      );
    }
  }

  async update(
    id: string,
    updateStepDto: UpdateStepDto,
    userId?: string,
    userRole?: string,
  ) {
    await this.verifyStepOwnership(id, userId, userRole);
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

  async findStepsByRecipeForUser(
    recipeId: string,
    userId: string,
  ): Promise<Step[]> {
    // 1. Buscar al usuario y la receta
    const [user, recipe] = await Promise.all([
      this.userService.findOneById(userId),
      this.recipeModel.findById(recipeId).populate('steps').exec(),
    ]);

    if (!recipe) {
      throw new NotFoundException(`La receta con id ${recipeId} no existe`);
    }

    // 2. Verificar si la receta es gratuita (price <= 0), si el usuario la compró ('myPurchased'), es el creador o es super_admin
    const isFreeRecipe = Number(recipe.price ?? 0) <= 0;
    const isInMyPurchased = user.myPurchased?.some(
      (r) => String(r.idRecipe) === String(recipeId),
    );
    const creatorId = String(
      (recipe.createdBy as any)?._id || recipe.createdBy || '',
    );
    const isCreator = Boolean(userId) && creatorId === String(userId);
    const isSuperAdmin = user.role === 'super_admin';

    if (!isFreeRecipe && !isInMyPurchased && !isCreator && !isSuperAdmin) {
      throw new HttpException(
        'No tienes permiso para ver los pasos de esta receta. Debes comprarla primero.',
        HttpStatus.FORBIDDEN,
      );
    }

    return recipe.steps as unknown as Step[];
  }

  async removeManyByIds(ids: any[]) {
    if (!ids || ids.length === 0) return;
    await this.stepModel.deleteMany({ _id: { $in: ids } }).exec();
  }

  async remove(id: string, userId?: string, userRole?: string) {
    try {
      await this.verifyStepOwnership(id, userId, userRole);
      const deleteStep = await this.stepModel.findByIdAndDelete(id).exec();

      if (!deleteStep) {
        throw new NotFoundException(`Step with id ${id} not found`);
      }

      return deleteStep;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        `Error fetching steps`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
