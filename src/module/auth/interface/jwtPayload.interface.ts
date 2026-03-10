export interface JwtPayload {
    sub: string;
    username: string;
    role: string;
    jti?: string; // JWT ID para identificar tokens únicos
  }