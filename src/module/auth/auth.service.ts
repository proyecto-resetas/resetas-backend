import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/index';
import { UserService } from 'src/module/users/users.service';
import { HashService } from 'src/common/utils/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Token } from './interface';
@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly userService: UserService,
  ){}
  
  async register(userRegister: RegisterDto) {
   
    try {
      await this.validateEmailForSignUp(userRegister.email);
      
      const hashedPassword = await this.hashService.hash(userRegister.password);
  
      if (userRegister.role === 'admin' || 'user') {

        const user = await this.userService.create({
          ...userRegister,
          password: hashedPassword,
        });

        const tokens = await this.getTokens({
          sub: user.id,
          username: user.username,
          role: user.role,
        });
    
        // Devolver el usuario completo con los tokens
        return {
          user,
          ...tokens,
        };
      }
  
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException('Something went wrong during registration');
    }
  }

  async logIn(logInDto: LoginDto) {
    const user = await this.userService.findOneByEmail(logInDto.email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const isPasswordValid = await this.hashService.compare(
      logInDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }

    const tokens = await this.getTokens({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    // Devolver el usuario completo con los tokens
    return {
      user,
      ...tokens,
    };
  }

async getTokens(jwtPayload: JwtPayload): Promise<Token> {
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) {
      throw new Error('JWT_SECRET is not set');
    }
    const accessTokenOptions = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '30m',
    };

    const accessToken = await this.signToken(
      jwtPayload,
      secretKey,
      accessTokenOptions,
    );

    return { access_token: accessToken };
  }

async signToken(payload: JwtPayload, secretKey: string, options: any) {
    return await this.jwtService.signAsync(payload, {
      secret: secretKey,
      ...options,
    });
  }

  async validateEmailForSignUp(email: string): Promise<boolean | undefined> {
    const user = await this.userService.findOneByEmailRegister(email);

    if (user) {
      throw new HttpException('Email already exists!', 400);
    }
    return true;
  }

}
