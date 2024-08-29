import { Module } from '@nestjs/common';
import { RecetasService } from './recetas.service';
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
  providers: [RecetasService],
  exports: [RecetasService]
})
export class RecetasModule {}
