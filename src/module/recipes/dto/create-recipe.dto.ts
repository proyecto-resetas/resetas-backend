import { Type } from "@nestjs/class-transformer";
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUrl, ValidateNested } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StepDto } from "../../steps/dto/create-step.dto";
import { Step } from "../entities/recipes.entity";
import { IngredientsRecipeDto } from "./ingredients-recipes.dto";
import { Level } from "../enums/level.enum";

export class CreateRecetaDto {
    
    @IsString()
    @ApiProperty()
    nameRecipe: string;

    @IsString()
    @ApiProperty()
    descriptionRecipe: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => IngredientsRecipeDto)
    ingredientsRecipe: IngredientsRecipeDto[];

    @IsOptional()
    @IsUrl()
    imageUrl?: string;

    @IsNumber()
    @ApiProperty()
    price: number;

    @IsEnum(Level)
    level: Level;

    @IsString()
    @ApiProperty()
    category: string;

    @IsArray()
    @ApiProperty()
    @ValidateNested({ each: true })
    @Type(() => StepDto)
    steps: Step[];
    
    @IsString()
    @ApiProperty()
    createdBy: string;
}
