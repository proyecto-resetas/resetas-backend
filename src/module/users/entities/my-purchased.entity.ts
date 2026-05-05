import { IsString } from '@nestjs/class-validator';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class MyPurchased {
  @IsString()
  @Prop()
  idRecipe: string;

  @IsString()
  @Prop()
  nameRecipe: string;
}
