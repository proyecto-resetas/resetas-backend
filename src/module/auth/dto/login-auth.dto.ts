import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from '@nestjs/class-validator';
import { Transform } from '@nestjs/class-transformer';

export class LoginDto {
    
  @ApiProperty()
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ description: 'password should be', minimum: 6, maximum: 30 })
  @IsNotEmpty()
  @MinLength(8, { message: 'password should be minimmum 8 ' })
  @MaxLength(50, { message: 'password should be maximium 50 ' })
  password: string;
}