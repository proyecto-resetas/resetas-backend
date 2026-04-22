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
} from './dto';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/common/guard/jwt.guard';
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
    const token = await this.authService.register(createAuthDto);

    console.log(token);
    return token;
  }

  @Post('otp/login')
  @DocGenerateOtp()
  async generateOtp(@Body() generateOtpDto: GenerateOtpDto) {
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
  async logout(@Request() req: any) {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const userId = req.user?.sub;

    if (!accessToken || !userId) {
      throw new BadRequestException('Token o usuario no encontrado');
    }

    return this.authService.logout(accessToken, userId);
  }
}
