import { registerAs } from '@nestjs/config';

export default registerAs('aiConfig', () => ({
  defaultProvider: process.env.DEFAULT_AI_PROVIDER || 'ollama',
  recipePromptName: process.env.RECIPE_PROMPT_NAME || 'RECIPE_ANALYSIS_OLLAMA',
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'llama3',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT_MS, 10) || 300000,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-1.5-flash',
  },
}));
