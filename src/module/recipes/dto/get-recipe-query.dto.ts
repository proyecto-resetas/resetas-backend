import { IsOptional, IsString, IsNumber } from '@nestjs/class-validator';

export class GetRecipesQueryDto {
  @IsOptional()
  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  level: string;

  @IsOptional()
  @IsNumber()
  page: number = 1;

  @IsOptional()
  @IsNumber()
  limit: number = 10;
}
