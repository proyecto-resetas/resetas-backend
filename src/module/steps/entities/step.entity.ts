import { IsString } from "@nestjs/class-validator";
import { Prop, SchemaFactory, Schema } from "@nestjs/mongoose";

@Schema()
export class Step {
  @Prop({ required: true })
  @IsString()
  description: string;

  @Prop({ required: true })
  @IsString()
  time: string;  // Ejemplo: '10m', '1h', etc.
}

export const StepSchema = SchemaFactory.createForClass(Step);
