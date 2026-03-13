import { BadRequestException, HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto, VerifyOtpResponseDto } from './dto/index';
import { UserService } from 'src/module/users/users.service';
import { HashService } from 'src/common/utils/services/hash.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload, Token } from './interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Otp } from './entities/otp.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { TokenBlacklist } from './entities/token-blacklist.entity';
import { BrevoService } from 'src/common/utils/services/brevo.service';
import { RoleService } from '../roles/services/role.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly hashService: HashService,
    private readonly userService: UserService,
    private readonly brevoService: BrevoService,
    private readonly roleService: RoleService,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
    @InjectModel(TokenBlacklist.name) private readonly tokenBlacklistModel: Model<TokenBlacklist>,
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

        await this.generateOtp(user.email);
        return {
          message: 'User registered successfully',
          email: user.email,
          role: user.role,
        };
      }
  
    } catch (error) {
      console.error('Error during user registration:', error);
      throw new InternalServerErrorException('Something went wrong during registration');
    }
  }


async getTokens(jwtPayload: JwtPayload, userId?: string): Promise<Token> {
    const secretKey = process.env.JWT_SECRET;
    const refreshSecretKey = process.env.JWT_REFRESH_SECRET || secretKey;
    
    if (!secretKey) {
      throw new Error('JWT_SECRET is not set');
    }

    // Obtener permisos del rol si no están en el payload
    if (!jwtPayload.permissions) {
      const permissions = await this.roleService.getPermissionsByRoleName(jwtPayload.role);
      jwtPayload.permissions = permissions;
    }

    // Obtener permisos del rol si no están en el payload
    if (!jwtPayload.permissions) {
      const permissions = await this.roleService.getPermissionsByRoleName(jwtPayload.role);
      jwtPayload.permissions = permissions;
    }

    // Generar JTI único para el access token
    const jti = crypto.randomBytes(32).toString('hex');
    const payloadWithJti = { ...jwtPayload, jti };

    const accessTokenOptions = {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '30m',
    };

    const accessToken = await this.signToken(
      payloadWithJti,
      secretKey,
      accessTokenOptions,
    );

    // Generar refresh token
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '7d';
    
    // Calcular fecha de expiración del refresh token
    const expiresAt = new Date();
    const expiryDays = parseInt(refreshTokenExpiry.replace('d', '')) || 7;
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Guardar refresh token en la base de datos si se proporciona userId
    if (userId) {
      // Revocar refresh tokens anteriores del usuario
      await this.refreshTokenModel.updateMany(
        { userId, isRevoked: false },
        { isRevoked: true }
      );

      // Guardar el nuevo refresh token
      await this.refreshTokenModel.create({
        userId,
        token: refreshToken,
        expiresAt,
        isRevoked: false,
      });
    }

    return { 
      access_token: accessToken,
      refresh_token: refreshToken 
    };
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
   * Verifica el código OTP ingresado por el usuario y genera tokens JWT
   */
  async verifyOtp(email: string, code: string): Promise<VerifyOtpResponseDto> {
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

      // Obtener el usuario para generar los tokens
      const user = await this.userService.findOneByEmail(email);
      if (!user) {
        throw new BadRequestException('Usuario no encontrado');
      }

      // Obtener permisos del rol del usuario
      const permissions = await this.roleService.getPermissionsByRoleName(user.role);

      // Generar tokens JWT (incluyendo refresh token)
      const tokens = await this.getTokens({
        sub: user.id,
        username: user.username,
        role: user.role,
        permissions,
      }, user.id);

      // Marcar el OTP como verificado
      otp.verified = true;
      await otp.save();

      return {
        message: 'Código OTP verificado exitosamente. Login completado',
        userId: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        permissions,
        ...tokens,
      };
    } catch (error) {
      console.error('Error al verificar OTP:', error);
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al verificar el código OTP');
    }
  }

  /**
   * Refresca el access token usando un refresh token válido
   */
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    try {
      // Buscar el refresh token en la base de datos
      const storedToken = await this.refreshTokenModel.findOne({
        token: refreshToken,
        isRevoked: false,
      });

      if (!storedToken) {
        throw new UnauthorizedException('Refresh token inválido o revocado');
      }

      // Verificar si el refresh token ha expirado
      if (new Date() > storedToken.expiresAt) {
        await this.refreshTokenModel.updateOne(
          { _id: storedToken._id },
          { isRevoked: true }
        );
        throw new UnauthorizedException('Refresh token expirado');
      }

      // Obtener el usuario
      const user = await this.userService.findOneById(storedToken.userId);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Revocar el refresh token actual
      await this.refreshTokenModel.updateOne(
        { _id: storedToken._id },
        { isRevoked: true }
      );

      // Obtener permisos del rol del usuario
      const permissions = await this.roleService.getPermissionsByRoleName(user.role);

      // Generar nuevos tokens
      const tokens = await this.getTokens({
        sub: user.id,
        username: user.username,
        role: user.role,
        permissions,
      }, user.id);

      return tokens;
    } catch (error) {
      console.error('Error al refrescar token:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new InternalServerErrorException('Error al refrescar el token');
    }
  }

  /**
   * Realiza logout invalidando los tokens del usuario
   */
  async logout(accessToken: string, userId: string): Promise<{ message: string }> {
    try {
      // Decodificar el token para obtener su expiración
      let expiresAt: Date;
      try {
        const decoded = this.jwtService.decode(accessToken) as any;
        if (decoded && decoded.exp) {
          expiresAt = new Date(decoded.exp * 1000);
        } else {
          // Si no se puede decodificar, usar expiración por defecto
          expiresAt = new Date();
          expiresAt.setMinutes(expiresAt.getMinutes() + 30);
        }
      } catch {
        expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 30);
      }

      // Agregar el access token a la blacklist
      await this.tokenBlacklistModel.create({
        token: accessToken,
        userId,
        expiresAt,
        type: 'access',
      });

      // Revocar todos los refresh tokens activos del usuario
      await this.refreshTokenModel.updateMany(
        { userId, isRevoked: false },
        { isRevoked: true }
      );

      return {
        message: 'Logout exitoso. Tokens invalidados',
      };
    } catch (error) {
      console.error('Error al hacer logout:', error);
      throw new InternalServerErrorException('Error al realizar logout');
    }
  }

  /**
   * Verifica si un token está en la blacklist
   */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const blacklisted = await this.tokenBlacklistModel.findOne({ token });
    return !!blacklisted;
  }

}
