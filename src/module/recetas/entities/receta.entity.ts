import { Type } from "@nestjs/class-transformer";
import { IsArray, IsString, ValidateNested } from "@nestjs/class-validator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Step, StepSchema } from "src/module/steps/entities/step.entity";


@Schema()
export class Recipe {

    @IsString()
    @Prop()
    nameRecipe: string;

    @IsString()
    @Prop()
    descriptionRecipe: string;

    @Prop()
    ingredientsRecipe: string;

    @Prop()
    imageUrl: string;

    @Prop()
    price: string;

    @Prop({ type: [StepSchema], required: true })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => Step)
    steps: Step[];

}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
export { Step };

