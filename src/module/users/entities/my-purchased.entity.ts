import { IsOptional, IsString } from '@nestjs/class-validator';
import { Prop, Schema } from '@nestjs/mongoose';

@Schema()
export class MyPurchased {
  @IsString()
  @Prop()
  idRecipe: string;

  @IsString()
  @Prop()
  nameRecipe: string;

  @IsOptional()
  @Prop({ default: Date.now })
  purchasedAt?: Date;

  @IsOptional()
  @IsString()
  @Prop()
  paymentReference?: string;
}
