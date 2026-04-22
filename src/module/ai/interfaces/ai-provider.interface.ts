import { AIRequestOptions, AIResponse } from '../enums/ai-provider.enum';

export interface IAIProvider {
  generateResponse(
    prompt: string,
    options?: AIRequestOptions,
  ): Promise<AIResponse>;
}
