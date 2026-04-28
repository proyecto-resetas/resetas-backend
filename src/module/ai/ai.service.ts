import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AIProvider,
  AIRequestOptions,
  AIResponse,
} from '../../module/ai/enums/ai-provider.enum';
import { IAIProvider } from '../../module/ai/interfaces/ai-provider.interface';
import { GeminiProvider } from '../../module/ai/providers/gemini.provider';
import { OpenAIProvider } from '../../module/ai/providers/openai.provider';
import { OllamaProvider } from '../../module/ai/providers/ollama.provider';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private providers: Map<AIProvider, IAIProvider> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    // Aquí podrías inyectar directamente los proveedores si prefieres
  ) {
    this.initializeProviders();
  }

  private initializeProviders() {
    this.providers.set(
      AIProvider.GEMINI,
      new GeminiProvider(this.configService, this.httpService),
    );
    this.providers.set(
      AIProvider.OPENAI,
      new OpenAIProvider(this.configService, this.httpService),
    );
    this.providers.set(
      AIProvider.OLLAMA,
      new OllamaProvider(this.configService, this.httpService),
    );
  }

  async generateResponse(
    prompt: string,
    options?: AIRequestOptions & { provider?: AIProvider },
  ): Promise<AIResponse> {
    const aiConfig = this.configService.get('aiConfig');
    const providerType =
      options?.provider ?? aiConfig.defaultProvider ?? AIProvider.OLLAMA;
    const provider = this.providers.get(providerType as AIProvider);

    if (!provider) {
      throw new Error(`AI Provider ${providerType} not found`);
    }

    try {
      return await provider.generateResponse(prompt, options);
    } catch (error) {
      this.logger.error(
        `Error with AI provider ${providerType}: ${error.message}`,
      );
      throw error;
    }
  }

  /**
   * Método de conveniencia para analizar imágenes, similar al de recetas.
   */
  async analyzeImage(
    file: Express.Multer.File | string, // Puede ser el archivo de multer o un base64
    prompt: string,
    options?: AIRequestOptions & { provider?: AIProvider },
  ): Promise<string> {
    let base64Image: string;

    if (typeof file === 'string') {
      base64Image = file;
    } else {
      base64Image = file.buffer.toString('base64');
    }

    const response = await this.generateResponse(prompt, {
      ...options,
      images: [base64Image],
    });

    return response.text;
  }

  /**
   * Limpia y convierte una cadena de texto de la IA en un objeto JS.
   */
  parseJSONResponse<T>(text: string): T {
    // 1. Intentar limpiar bloques de código markdown (```json ... ``` o ``` ... ```)
    const jsonRegex = /```json\s?([\s\S]*?)\s?```|```\s?([\s\S]*?)\s?```/i;
    const match = text.match(jsonRegex);

    // Si hay match, usamos el contenido del bloque; si no, usamos el texto original
    const jsonString = match ? match[1] || match[2] : text;

    try {
      // Limpiar espacios y caracteres extraños al inicio/final
      return JSON.parse(jsonString.trim()) as T;
    } catch (error) {
      this.logger.error(`Error al parsear JSON: ${error.message}`);

      // 2. Intento desesperado: buscar el primer '{' y el último '}'
      const fallbackMatch = jsonString.match(/\{[\s\S]*\}/);
      if (fallbackMatch) {
        try {
          return JSON.parse(fallbackMatch[0]) as T;
        } catch (e) {
          throw new Error('La respuesta de la IA no contiene un JSON válido.');
        }
      }
      throw new Error('No se pudo extraer JSON de la respuesta de la IA.');
    }
  }
}
