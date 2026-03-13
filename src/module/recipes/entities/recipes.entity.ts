import { Type } from '@nestjs/class-transformer';
import {
  IsArray,
  IsNumber,
  IsString,
  IsEnum,
  IsUrl,
  ValidateNested,
} from '@nestjs/class-validator';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Step } from 'src/module/steps/entities/step.entity';
import { IngredientsRecipe } from './ingredients.entity';
import { Level } from '../enums/level.enum';
import { UtensilRecipe } from './utensil.entity';

@Schema({ timestamps: true })
export class Recipe {
  @IsString()
  @Prop({ required: true, example: 'Pasta Carbonara' })
  nameRecipe: string;

  @IsString()
  @Prop({
    required: true,
    example: 'Deliciosa pasta italiana con tocino, huevo y queso parmesano',
  })
  descriptionRecipe: string;

  @IsUrl()
  @Prop({ example: '' })
  imageUrl?: string;

  @Prop({ required: true, example: 'Italiana' })
  category: string;

  @IsNumber()
  @Prop({ required: true, example: 15.99 })
  price: number;

  @IsEnum(Level)
  @Prop({ required: true, example: 'Intermedio' })
  level: Level;

  @IsArray()
  @Prop({
    type: [{ description: String, amount: String }],
    required: true,
    example: [{ description: 'Pasta espagueti', amount: '400g' }],
  })
  @Type(() => IngredientsRecipe)
  ingredientsRecipe: IngredientsRecipe[];

  @IsArray()
  @Prop({
    type: [{ utensil: String }],
    required: true,
    example: [{ utensil: 'Olla grande' }],
  })
  @Type(() => UtensilRecipe)
  utensilRecipe: UtensilRecipe[];

  /** Solo se guardan los ObjectId de los pasos; en consultas se hace populate('steps') para devolver los pasos completos. */
  @Prop({ type: [Types.ObjectId], ref: Step.name, required: true, default: [] })
  @IsArray()
  steps: Types.ObjectId[];

  // Relación con el usuario que creó la receta
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    example: '507f1f77bcf86cd799439011',
  })
  createdBy: Types.ObjectId; // Referencia al creador (usuario)
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
export { Step };
