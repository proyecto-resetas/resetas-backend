import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true, trim: true })
  key: string; // Ej: 'recipes:create', 'steps:read', 's3:upload'

  @Prop({ required: true, trim: true })
  name: string; // Ej: 'Crear recetas'

  @Prop({ required: true, trim: true, default: 'general' })
  module: string; // Ej: 'recipes', 'steps', 'users', 'roles', 'profile', 's3'

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
