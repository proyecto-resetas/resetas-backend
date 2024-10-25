import { Type } from "@nestjs/class-transformer";
import { IsArray, IsNumber, IsString, IsEnum, IsUrl, ValidateNested } from "@nestjs/class-validator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Step, StepSchema } from "src/module/steps/entities/step.entity";
import { IngredientsRecipe } from "./ingredients.entity";
import { Level } from "../enums/level.enum";
import { UtensilRecipe } from "./utensil.entity";

@Schema({ timestamps: true })
export class Recipe {

    @IsString()
    @Prop({ required: true })
    nameRecipe: string;

    @IsString()
    @Prop({ required: true })
    descriptionRecipe: string;

    @IsUrl()
    @Prop()
    imageUrl: string;

    @Prop({ required: true })
    category: string;

    @IsNumber()
    @Prop({ required: true })
    price: number;

    @IsEnum(Level)
    @Prop({ required: true })
    level: Level;

    @IsArray()
    @Prop({ type: [{ description: String, amount: String }], required: true })
    @Type(() => IngredientsRecipe)
    ingredientsRecipe: IngredientsRecipe[];

    @IsArray()
    @Prop({ type: [{ utensil: String }], required: true })
    @Type(() => UtensilRecipe)
    utensilRecipe: UtensilRecipe[];

    @Prop({ type: [StepSchema], required: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Step)
    steps: Step[];

    // Relación con el usuario que creó la receta
    @Prop({ type: Types.ObjectId, ref: 'User', required: true }) 
    createdBy: Types.ObjectId; // Referencia al creador (usuario)
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
export { Step };

