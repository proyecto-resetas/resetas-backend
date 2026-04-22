import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IAIProvider } from '../interfaces/ai-provider.interface';
import { AIRequestOptions, AIResponse } from '../enums/ai-provider.enum';
import { AxiosError } from 'axios';
import { Logger } from '@nestjs/common';

export class OllamaProvider implements IAIProvider {
  private readonly logger = new Logger(OllamaProvider.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private get baseUrl(): string {
    return (
      this.configService.get<string>('OLLAMA_BASE_URL')?.replace(/\/$/, '') ||
      'http://localhost:11434'
    );
  }

  private get defaultModel(): string {
    return this.configService.get<string>('OLLAMA_MODEL') || 'llama3';
  }

  async generateResponse(
    prompt: string,
    options?: AIRequestOptions,
  ): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;
    const url = `${this.baseUrl}/api/generate`;

    const body = {
      model,
      prompt,
      stream: false,
      images: options?.images, // Ollama ya espera array de base64 directamente
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, body, {
          timeout:
            this.configService.get<number>('OLLAMA_TIMEOUT_MS') || 300_000,
        }),
      );

      const text = response.data?.response || '';
      return { text, raw: response.data };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof AxiosError) {
      this.logger.error(
        `Ollama request failed: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(`Ollama Error: ${error.message}`);
    }
    throw error;
  }
}
