import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IAIProvider } from '../interfaces/ai-provider.interface';
import { AIRequestOptions, AIResponse } from '../enums/ai-provider.enum';
import { AxiosError } from 'axios';
import { Logger } from '@nestjs/common';

export class GeminiProvider implements IAIProvider {
  private readonly logger = new Logger(GeminiProvider.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private get apiKey(): string {
    return this.configService.get<string>('GEMINI_API_KEY');
  }

  private get defaultModel(): string {
    return this.configService.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';
  }

  async generateResponse(
    prompt: string,
    options?: AIRequestOptions,
  ): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: prompt },
          ...(options?.images || []).map((img) => ({
            inline_data: {
              mime_type: 'image/jpeg',
              data: img,
            },
          })),
        ],
      },
    ];

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, { contents }),
      );

      const text =
        response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return { text, raw: response.data };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof AxiosError) {
      this.logger.error(
        `Gemini request failed: ${JSON.stringify(error.response?.data)}`,
      );
      throw new Error(`Gemini Error: ${error.message}`);
    }
    throw error;
  }
}
