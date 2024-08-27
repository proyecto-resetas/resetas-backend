import { Injectable } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { JwtPayload } from '../interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:  process.env.JWT_SECRET || 'secretKey',
    });
  }

async validate(payload: JwtPayload): Promise<JwtPayload> {
  console.log('Payload extracted from JWT 1:', payload);
    return { sub: payload.sub, username: payload.username, role: payload.role };
  }
}