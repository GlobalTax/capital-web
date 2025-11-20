
import { AIModel } from '@/types/aiContent';

export const AI_MODELS: AIModel[] = [
  {
    id: 'gpt-5-2025-08-07',
    name: 'GPT-5',
    description: 'Modelo flagship de OpenAI, máximo rendimiento',
    strengths: ['Máxima calidad', 'Razonamiento avanzado', 'Multimodal'],
    maxTokens: 128000,
    costPerToken: 0.04,
    provider: 'openai'
  },
  {
    id: 'gpt-5-mini-2025-08-07',
    name: 'GPT-5 Mini',
    description: 'Rápido y eficiente, excelente relación calidad-precio',
    strengths: ['Velocidad', 'Costo-efectivo', 'Alta calidad'],
    maxTokens: 128000,
    costPerToken: 0.0002,
    provider: 'openai'
  },
  {
    id: 'gpt-5-nano-2025-08-07',
    name: 'GPT-5 Nano',
    description: 'Ultra rápido para tareas simples',
    strengths: ['Máxima velocidad', 'Muy económico', 'Clasificación y resumen'],
    maxTokens: 128000,
    costPerToken: 0.0001,
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
      return complexity === 'high' ? 'gpt-5-2025-08-07' : 'gpt-5-mini-2025-08-07';
    case 'seo':
    case 'tags':
      return 'gpt-5-nano-2025-08-07';
    case 'title':
      return 'claude-3-5-sonnet-20241022';
    default:
      return 'gpt-5-mini-2025-08-07';
  }
};
