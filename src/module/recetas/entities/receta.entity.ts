import { Type } from "@nestjs/class-transformer";
import { IsArray, IsNumber, IsString, ValidateNested } from "@nestjs/class-validator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { Step, StepSchema } from "src/module/steps/entities/step.entity";


@Schema({ timestamps: true })
export class Recipe {

    @IsString()
    @Prop()
    nameRecipe: string;

    @IsString()
    @Prop()
    descriptionRecipe: string;

    @IsString()
    @Prop()
    ingredientsRecipe: string;

    @IsString()
    @Prop()
    imageUrl: string;

    @IsString()
    @Prop()
    category: string;

    @IsNumber()
    @Prop()
    price: number;

    @IsString()
    @Prop()
    level: string;

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

