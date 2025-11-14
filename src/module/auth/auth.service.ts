import { BadRequestException, HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto/index';
import { UserService } from 'src/module/users/users.service';
import { HashService } from 'src/common/utils/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Token } from './interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './entities/otp.entity';
import { BrevoService } from 'src/common/utils/services/brevo.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly userService: UserService,
    private readonly brevoService: BrevoService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
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

  /**
   * Genera un código OTP de 6 dígitos y lo envía por email usando Brevo
   */
  async generateOtp(email: string): Promise<{ message: string }> {
    try {
      // Verificar si el usuario existe
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        throw new BadRequestException('El usuario no existe');
      }

      // Generar código OTP de 6 dígitos
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Calcular fecha de expiración (10 minutos)
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      // Eliminar OTPs anteriores no verificados del mismo email
      await this.otpModel.deleteMany({ email, verified: false });

      // Guardar el OTP en la base de datos
      await this.otpModel.create({
        email,
        code,
        expiresAt,
        verified: false,
        attempts: 0,
      });

      // Enviar el OTP por email usando Brevo
      await this.brevoService.sendOtpEmail(email, code);

      return {
        message: 'Código OTP enviado exitosamente al email',
      };
    } catch (error) {
      console.error('Error al generar OTP:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al generar el código OTP');
    }
  }

  /**
   * Verifica el código OTP ingresado por el usuario
   */
  async verifyOtp(email: string, code: string): Promise<{ message: string; verified: boolean }> {
    try {
      // Buscar el OTP más reciente para este email
      const otp = await this.otpModel.findOne({ 
        email, 
        verified: false 
      }).sort({ createdAt: -1 });

      if (!otp) {
        throw new BadRequestException('No se encontró un código OTP válido para este email');
      }

      // Verificar si el OTP ha expirado
      if (new Date() > otp.expiresAt) {
        await this.otpModel.deleteOne({ _id: otp._id });
        throw new BadRequestException('El código OTP ha expirado');
      }

      // Verificar el número de intentos (máximo 3)
      if (otp.attempts >= 3) {
        await this.otpModel.deleteOne({ _id: otp._id });
        throw new BadRequestException('Has excedido el número máximo de intentos');
      }

      // Verificar si el código es correcto
      if (otp.code !== code) {
        // Incrementar el contador de intentos
        otp.attempts += 1;
        await otp.save();
        
        const attemptsLeft = 3 - otp.attempts;
        throw new BadRequestException(
          `Código incorrecto. Te quedan ${attemptsLeft} intento(s)`
        );
      }

      // Marcar el OTP como verificado
      otp.verified = true;
      await otp.save();

      return {
        message: 'Código OTP verificado exitosamente',
        verified: true,
      };
    } catch (error) {
      console.error('Error al verificar OTP:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al verificar el código OTP');
    }
  }

}
