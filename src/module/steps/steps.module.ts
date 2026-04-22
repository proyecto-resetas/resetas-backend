import { Module } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { Step, StepSchema } from './entities/step.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';
import { Recipe, RecipeSchema } from '../recipes/entities/recipes.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Step.name, schema: StepSchema },
      { name: Recipe.name, schema: RecipeSchema },
    ]),
    RolesModule,
    UsersModule,
  ],
  controllers: [StepsController],
  providers: [StepsService],
  exports: [StepsService],
})
export class StepsModule {}
