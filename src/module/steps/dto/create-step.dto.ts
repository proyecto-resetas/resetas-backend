import { IsNumber, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class StepDto {
    
    @ApiProperty()
    @IsString()
    description: string;
    
    @ApiProperty()
    @IsString()
    time: string;  // Ejemplo: '10m', '1h', etc.

    @ApiProperty()
    @IsNumber()
    timeScreen: number;  
}
