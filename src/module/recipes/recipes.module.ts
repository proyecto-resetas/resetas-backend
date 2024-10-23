import { Module } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { RecetasController } from './recipes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Recipe, RecipeSchema } from './entities/recipes.entity';
import { StepsModule } from '../steps/steps.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    StepsModule,
  ],
  controllers: [RecetasController],
  providers: [RecipesService],
  exports: [RecipesService]
})
export class RecipesModule {}
