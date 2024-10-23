import { IsString } from "@nestjs/class-validator";
import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class IngredientsRecipe {

    @IsString()
    @Prop()
    description: string;

    @IsString()
    @Prop()
    amount: string;
}