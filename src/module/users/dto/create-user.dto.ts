import { IsEmail, IsObject, IsOptional, IsString, Length } from "@nestjs/class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { Matches } from "class-validator";

export class CreateUserDto {
    
  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  lastname: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  @Length(8, 30)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/, {
    message: 'password too weak',
  })
  password: string;

  @ApiProperty({ example: { countryCode: '+57', phoneNumber: '3001234567' } })
  @IsObject()
  phone: {
    countryCode: string;
    phoneNumber: string;
  };

  @ApiProperty({ example: 'Colombia' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'Bogotá' })
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  @IsOptional() // Photo no es obligatorio
  photoUrl?: string;

  @ApiProperty()
  @IsString()
  role: string;
}
