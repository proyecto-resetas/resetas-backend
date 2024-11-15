import { IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateFavoriteDto {
    
    @IsString()
    @ApiProperty()
    idRecipe: string;

    @IsString()
    @ApiProperty()
    nameRecipe: string;
}