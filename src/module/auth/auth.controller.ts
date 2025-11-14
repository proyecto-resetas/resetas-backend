import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, GenerateOtpDto, VerifyOtpDto } from './dto';
import { ApiResponse, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
  @Post('register')
  @ApiResponse({ status: 201, description: 'User register' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  async registerUser(@Body() createAuthDto: RegisterDto) {
    const token = await this.authService.register(createAuthDto);
    return token;
  }

  @Post('login')  
  @ApiResponse({ status: 201, description: 'User found with email' })
  @ApiResponse({ status: 400, description: 'Dates invalid.' })
  login(@Body() logIn: LoginDto) {
    return this.authService.logIn(logIn);
  }

  @Post('otp/generate')
  @ApiOperation({ summary: 'Generar y enviar código OTP al email del usuario' })
  @ApiResponse({ status: 201, description: 'Código OTP enviado exitosamente' })
  @ApiResponse({ status: 400, description: 'El usuario no existe' })
  @ApiResponse({ status: 500, description: 'Error al generar el código OTP' })
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
    return this.authService.generateOtp(generateOtpDto.email);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verificar código OTP ingresado por el usuario' })
  @ApiResponse({ status: 201, description: 'Código OTP verificado exitosamente' })
  @ApiResponse({ status: 400, description: 'Código inválido o expirado' })
  @ApiResponse({ status: 500, description: 'Error al verificar el código OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.code);
  }

}
