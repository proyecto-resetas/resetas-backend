import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches } from "@nestjs/class-validator";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
///import { HydratedDocument } from "mongoose";
import { Document, Types } from 'mongoose';
import { UserRole } from "src/common/guard/roles.enum";


//export type UserDocument = HydratedDocument<User>;
@Schema({ timestamps: true })
export class User extends Document {

  @IsString()
  @Prop({ required: true })
  username: string;

  @IsString()
  @Prop({ required: true })
  lastname: string;

  @IsEmail()
  @Prop({ required: true, unique: true })
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 30)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'password too weak',
  })
  @Prop({ required: true })
  password: string;

  @IsString()
  @Prop()
  phone: string;

  @IsString()
  @Prop()
  country: string;

  @IsString()
  @Prop()
  city: string;

  @IsString()
  @IsOptional() // Photo no es obligatorio
  @Prop()
  photoUrl?: string;


  @IsEnum(UserRole)
  @Prop({ required: true, enum: UserRole, default: UserRole.USER })
  role?: UserRole;

   // Relación con recetas creadas por el usuario
   @Prop({ type: [{ type: Types.ObjectId, ref: 'Recipe' }] })
   recipesCreated: Types.ObjectId[]; // Lista de recetas creadas por el usuario
}

export const UserSchema = SchemaFactory.createForClass(User);
