import { IsNotEmpty, IsString } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ApiKeyDto {

  @ApiProperty() 
  @IsString()
  @IsNotEmpty()
  systemName: string;
}