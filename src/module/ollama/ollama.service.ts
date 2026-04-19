import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { OllamaGenerateResponse } from './interfaces/ollama-generate-response.interface';

@Injectable()
export class OllamaService {
  private readonly logger = new Logger(OllamaService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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

  /**
   * Genera texto con el endpoint `/api/generate` de Ollama (sin streaming).
   * Soporta imágenes en base64 para modelos de visión (llava, moondream, gemma, etc.)
   */
  async generateResponse(
    prompt: string,
    options?: { model?: string; stream?: boolean; images?: string[] },
  ): Promise<OllamaGenerateResponse> {
    const url = `${this.baseUrl}/api/generate`;
    const body = {
      model: options?.model ?? this.defaultModel,
      prompt,
      stream: options?.stream ?? false,
      images: options?.images, // Array de strings en base64
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post<OllamaGenerateResponse>(url, body, {
          timeout:
            this.configService.get<number>('OLLAMA_TIMEOUT_MS') || 300_000, // Vision suele tardar más
        }),
      );
      return response.data;
    } catch (err) {
      const message = this.formatError(err);
      this.logger.error(`Ollama generate failed: ${message}`);
      throw new Error(`Error conectando con Ollama: ${message}`);
    }
  }

  /**
   * Devuelve solo el texto de la respuesta del modelo.
   */
  async generateText(
    prompt: string,
    options?: { model?: string },
  ): Promise<string> {
    const data = await this.generateResponse(prompt, options);
    return data.response ?? '';
  }

  private formatError(err: unknown): string {
    if (err instanceof AxiosError) {
      const detail =
        typeof err.response?.data === 'object'
          ? JSON.stringify(err.response?.data)
          : String(err.response?.data ?? '');
      return `${err.message}${detail ? ` — ${detail}` : ''}`;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return String(err);
  }
}
