import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { IAIProvider } from '../interfaces/ai-provider.interface';
import { AIRequestOptions, AIResponse } from '../enums/ai-provider.enum';
import { AxiosError } from 'axios';
import { Logger } from '@nestjs/common';

export class OpenAIProvider implements IAIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  private get apiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY');
  }

  private get defaultModel(): string {
    return this.configService.get<string>('OPENAI_MODEL') || 'gpt-4o-mini';
  }

  async generateResponse(prompt: string, options?: AIRequestOptions): Promise<AIResponse> {
    const model = options?.model || this.defaultModel;
    const url = 'https://api.openai.com/v1/chat/completions';

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          ...(options?.images || []).map((img) => ({
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${img}`,
            },
          })),
        ],
      },
    ];

    try {
      const response = await firstValueFrom(
        this.httpService.post(
          url,
          {
            model,
            messages,
            temperature: options?.temperature ?? 0.7,
            max_tokens: options?.maxTokens,
          },
          {
            headers: {
              Authorization: `Bearer ${this.apiKey}`,
              'Content-Type': 'application/json',
            },
          },
        ),
      );

      const text = response.data?.choices?.[0]?.message?.content || '';
      return { text, raw: response.data };
    } catch (error) {
      this.handleError(error);
    }
  }

  private handleError(error: any) {
    if (error instanceof AxiosError) {
      this.logger.error(`OpenAI request failed: ${JSON.stringify(error.response?.data)}`);
      throw new Error(`OpenAI Error: ${error.message}`);
    }
    throw error;
  }
}
