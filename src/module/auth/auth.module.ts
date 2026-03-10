import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { UtilsModule } from 'src/common/utils/utils.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { Otp, OtpSchema } from './entities/otp.entity';
import { RefreshToken, RefreshTokenSchema } from './entities/refresh-token.entity';
import { TokenBlacklist, TokenBlacklistSchema } from './entities/token-blacklist.entity';
import { BrevoService } from 'src/common/utils/services/brevo.service';

@Module({
  imports: [
    PassportModule, 
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m' },
    }),
    MongooseModule.forFeature([
      { name: Otp.name, schema: OtpSchema },
      { name: RefreshToken.name, schema: RefreshTokenSchema },
      { name: TokenBlacklist.name, schema: TokenBlacklistSchema }
    ]),
    UtilsModule,
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, BrevoService],
  exports: [AuthService],
})
export class AuthModule {}
