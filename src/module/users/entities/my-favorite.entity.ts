import { IsString } from "@nestjs/class-validator";
import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class MyFavorite {

    @IsString()
    @Prop()
    idRecipe: string;

    @IsString()
    @Prop()
    nameRecipe: string;
}