export enum AIProvider {
  GEMINI = 'gemini',
  OPENAI = 'openai',
  OLLAMA = 'ollama',
}

export interface AIResponse {
  text: string;
  raw?: any;
}

export interface AIRequestOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  images?: string[]; // Array de base64 strings
}
