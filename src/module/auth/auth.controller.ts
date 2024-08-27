import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

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

}
