import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiKeyService } from '../../../common/utils/apikey/apikey.service';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // Excluir rutas de Swagger y la raíz del chequeo de API Key
    const publicPaths = ['/api', '/api-json', '/api-yaml', '/favicon.ico', '/'];
    if (publicPaths.includes(request.path) || request.path.includes('/api')) {
      return true;
    }

    const apiKey = request.headers['x-api-key'];

    console.log('API Key Received:', apiKey);
    if (!apiKey) {
      throw new UnauthorizedException('API key is missing');
    }

    const isValid = await this.apiKeyService.validateApiKey(apiKey.toString());
    if (!isValid) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}
