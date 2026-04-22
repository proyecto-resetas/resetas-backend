import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true })
  name: string; // 'user', 'admin', 'super_admin'

  @Prop({ required: true })
  displayName: string; // 'Usuario', 'Administrador', 'Super Administrador'

  @Prop({ type: [String], default: [] })
  permissions: string[]; // ['recipes:read', 'recipes:create', 'users:delete', etc.]

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  description?: string;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
