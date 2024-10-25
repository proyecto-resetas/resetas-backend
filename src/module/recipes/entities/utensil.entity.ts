import { IsString } from "@nestjs/class-validator";
import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class UtensilRecipe {

    @IsString()
    @Prop()
    utensil: string;

}