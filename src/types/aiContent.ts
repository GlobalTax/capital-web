
export interface AIModel {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  maxTokens: number;
  costPerToken: number;
  provider: 'openai' | 'anthropic' | 'perplexity';
}

export interface AIPromptTemplate {
  id: string;
  name: string;
  category: string;
  systemPrompt: string;
  userPromptTemplate: string;
  requiredContext: string[];
  outputFormat: string;
  tags: string[];
}

export interface GenerationContext {
  title?: string;
  category?: string;
  existingContent?: string;
  targetAudience?: string;
  tone?: 'professional' | 'conversational' | 'technical' | 'persuasive';
  length?: 'short' | 'medium' | 'long';
  keywords?: string[];
  competitorAnalysis?: string;
  marketData?: string;
}

export interface GenerationRequest {
  type: 'title' | 'content' | 'excerpt' | 'seo' | 'tags' | 'research' | 'outline';
  prompt: string;
  context: GenerationContext;
  model?: string;
  template?: string;
  options?: {
    temperature?: number;
    maxTokens?: number;
    useResearch?: boolean;
    includeMetrics?: boolean;
  };
}

export interface GenerationResult {
  content: string;
  type: string;
  model: string;
  usage: {
    tokens: number;
    cost: number;
    duration: number;
  };
  confidence: number;
  suggestions?: string[];
  metrics?: {
    readability: number;
    seoScore: number;
    engagement: number;
  };
}

export interface ContentStudioConfig {
  preferredModel: string;
  autoOptimization: boolean;
  enableResearch: boolean;
  enableMetrics: boolean;
  customPrompts: AIPromptTemplate[];
}
