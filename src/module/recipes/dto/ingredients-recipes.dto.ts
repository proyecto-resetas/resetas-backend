import { IsString } from "@nestjs/class-validator";

export class IngredientsRecipeDto {
    @IsString()
    description: string;

    @IsString()
    amount: string;
}