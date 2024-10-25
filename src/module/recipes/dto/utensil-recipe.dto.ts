import { IsString } from "@nestjs/class-validator";

export class UtensilRecipeDto {
    @IsString()
    utensil: string;
}