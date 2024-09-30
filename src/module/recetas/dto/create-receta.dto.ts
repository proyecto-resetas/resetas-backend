import { Type } from "@nestjs/class-transformer";
import { IsArray, IsString, ValidateNested } from "@nestjs/class-validator";
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

    @ApiProperty()
    ingredientsRecipe: string;

    @ApiProperty()
    imageUrl: string;

    @ApiProperty()
    price: string;

    @IsArray()
    @ApiProperty()
    @ValidateNested({ each: true })
    @Type(() => StepDto)
    steps: Step[];

}
