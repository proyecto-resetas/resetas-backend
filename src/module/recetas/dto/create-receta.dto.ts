import { Type } from "@nestjs/class-transformer";
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { StepDto } from "../../steps/dto/create-step.dto";
import { Step } from "../entities/receta.entity";

export class CreateRecetaDto {
    
    @IsString()
    @ApiProperty()
    nameRecipe: string;

    @IsString()
    @ApiProperty()
    descriptionRecipe: string;

    @IsString()
    @ApiProperty()
    ingredientsRecipe: string;

    @IsString()
    @ApiProperty()
    imageUrl: string;

    @IsNumber()
    @ApiProperty()
    price: number;

    @IsString()
    @ApiProperty()
    level: string;

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
