import { IsNumber, IsString } from "@nestjs/class-validator";
import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";

@Schema()
export class Step {
  @Prop({ required: true })
  @IsString()
  description: string;

  @Prop({ required: true })
  @IsString()
  time: string;  // Ejemplo: '10m', '1h', etc.

  @Prop({ required: true })
  @IsNumber()
  timeScreen: number;  
}

export const StepSchema = SchemaFactory.createForClass(Step);
