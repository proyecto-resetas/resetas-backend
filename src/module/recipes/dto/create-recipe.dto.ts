import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StepDto } from '../../steps/dto/create-step.dto';
import { Step } from '../entities/recipes.entity';
import { IngredientsRecipeDto } from './ingredients-recipes.dto';
import { Level } from '../enums/level.enum';
import { UtensilRecipeDto } from './utensil-recipe.dto';

export class CreateRecipeDto {
  @IsString()
  @ApiProperty({ example: 'Pasta Carbonara' })
  nameRecipe: string;

  @IsString()
  @ApiProperty({
    example: 'Deliciosa pasta italiana con tocino, huevo y queso parmesano',
  })
  descriptionRecipe: string;

  @IsOptional()
  @IsUrl()
  imageUrl?: string;

  @IsNumber()
  @ApiProperty({ example: 15.99 })
  price: number;

  @IsEnum(Level)
  @ApiProperty({ example: 'Intermedio' })
  level: Level;

  @IsString()
  @ApiProperty({ example: 'Italiana' })
  category: string;

  @ApiProperty({
    example: [{ description: 'Pasta espagueti', amount: '400g' }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngredientsRecipeDto)
  ingredientsRecipe: IngredientsRecipeDto[];

  @ApiProperty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UtensilRecipeDto)
  utensilRecipe: UtensilRecipeDto[];

  @IsArray()
  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => StepDto)
  steps: Step[];
}
