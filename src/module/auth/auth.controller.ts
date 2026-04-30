import {
  Controller,
  Post,
  Body,
  Request,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  RegisterDto,
  GenerateOtpDto,
  VerifyOtpDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
import { Request as ExpressRequest } from 'express';
import {
  DocRegister,
  DocGenerateOtp,
  DocVerifyOtp,
  DocRefreshToken,
  DocLogout,
} from './decorators/auth-swagger.decorator';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @DocRegister()
  async registerUser(@Body() createAuthDto: RegisterDto) {
    console.log(createAuthDto);
    const token = await this.authService.register(createAuthDto);
    return token;
  }

  @Post('otp/login')
  @DocGenerateOtp()
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
    console.log(generateOtpDto);
    return this.authService.generateOtp(
      generateOtpDto.email,
      generateOtpDto.password,
    );
  }

  @Post('otp/verify')
  @DocVerifyOtp()
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtp(verifyOtpDto.email, verifyOtpDto.code);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard)
  @DocRefreshToken()
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }


  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @DocLogout()
  async logout(@Request() req: ExpressRequest) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const userId = (req as any).user?.sub;

    if (!accessToken || !userId) {
      throw new BadRequestException('Token o usuario no encontrado');
    }

    return this.authService.logout(accessToken, userId);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.initiatePasswordRecovery(forgotPasswordDto);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
