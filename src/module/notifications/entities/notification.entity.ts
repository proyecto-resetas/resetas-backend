import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationType =
  | 'recipe_sold'
  | 'recipe_gift'
  | 'purchase_confirmed'
  | 'recipe_favorited'
  | 'new_recipe_published'
  | 'system';

@Schema({ timestamps: true })
export class Notification extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  recipientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  senderId?: Types.ObjectId;

  @Prop({ required: false })
  senderUsername?: string;

  @Prop({
    required: true,
    enum: [
      'recipe_sold',
      'recipe_gift',
      'purchase_confirmed',
      'recipe_favorited',
      'new_recipe_published',
      'system',
    ],
    default: 'system',
  })
  type: NotificationType;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ required: false })
  recipeId?: string;

  @Prop({ required: false })
  recipeName?: string;

  @Prop({ required: false })
  recipeImage?: string;

  @Prop({ required: false })
  amount?: number;

  @Prop({ default: false, index: true })
  read: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
