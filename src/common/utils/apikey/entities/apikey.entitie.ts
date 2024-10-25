import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class ApiKey extends Document {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  systemName: string;  // Nombre del sistema autorizado

  @Prop({ default: true })
  isActive: boolean;  // Indica si la clave está activa
}

export const ApiKeySchema = SchemaFactory.createForClass(ApiKey);
