import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecetasController } from './recipes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Recipe, RecipeSchema } from './entities/recipes.entity';
import { StepsModule } from '../steps/steps.module';
import { UsersModule } from '../users/users.module';
import { OllamaModule } from '../ollama/ollama.module';
import { AIModule } from '../ai/ai.module';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    StepsModule,
    UsersModule,
    OllamaModule,
    AIModule,
    RolesModule,
  ],
  controllers: [RecetasController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
