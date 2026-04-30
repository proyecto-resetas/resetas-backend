import { IsEmail, IsNotEmpty } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'usuario@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
