import { Module } from '@nestjs/common';
import { RecipesService } from './recetas.service';
import { RecetasController } from './recetas.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Recipe, RecipeSchema } from './entities/receta.entity';
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
