import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from '@nestjs/class-validator';

export class RegisterPushTokenDto {
  @ApiProperty({
    description: 'Token FCM o Web Push del dispositivo',
    example: 'fcm_token_xyz_123',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiPropertyOptional({
    description: 'Plataforma del dispositivo (android, ios, web)',
    example: 'web',
  })
  @IsString()
  @IsOptional()
  platform?: string;
}
