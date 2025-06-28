
import { AIModel } from '@/types/aiContent';

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Rápido y económico, excelente para contenido general',
    strengths: ['Velocidad', 'Costo-efectivo', 'Versatilidad'],
    maxTokens: 128000,
    costPerToken: 0.00015,
    provider: 'openai'
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    description: 'Modelo premium para contenido complejo y técnico',
    strengths: ['Calidad superior', 'Razonamiento complejo', 'Análisis profundo'],
    maxTokens: 128000,
    costPerToken: 0.03,
    provider: 'openai'
  },
  {
    id: 'claude-3-5-sonnet-20241022',
    name: 'Claude 3.5 Sonnet',
    description: 'Excelente para análisis y contenido estructurado',
    strengths: ['Análisis profundo', 'Estructura clara', 'Precisión técnica'],
    maxTokens: 200000,
    costPerToken: 0.003,
    provider: 'anthropic'
  },
  {
    id: 'llama-3.1-sonar-large-128k-online',
    name: 'Perplexity Sonar Large',
    description: 'Acceso a información actualizada en tiempo real',
    strengths: ['Datos actuales', 'Research en vivo', 'Fuentes verificadas'],
    maxTokens: 127072,
    costPerToken: 0.002,
    provider: 'perplexity'
  }
];

export const getOptimalModel = (type: string, complexity: 'low' | 'medium' | 'high'): string => {
  switch (type) {
    case 'research':
      return 'llama-3.1-sonar-large-128k-online';
    case 'content':
      return complexity === 'high' ? 'gpt-4o' : 'gpt-4o-mini';
    case 'seo':
    case 'tags':
      return 'gpt-4o-mini';
    case 'title':
      return 'claude-3-5-sonnet-20241022';
    default:
      return 'gpt-4o-mini';
  }
};
