/**
 * AI Helper - Hybrid AI System
 * Supports both OpenAI (for precision JSON tasks) and Lovable AI (for general/cost-saving tasks)
 * With automatic fallback between services
 */

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIConfig {
  preferOpenAI?: boolean;  // For tasks requiring precise JSON extraction
  model?: string;          // Specific model to use
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;      // Request JSON response format
}

export interface AIResponse {
  content: string;
  tokensUsed: number;
  provider: 'openai' | 'lovable';
  model: string;
  durationMs: number;
}

const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Default models
const DEFAULT_LOVABLE_MODEL = 'google/gemini-2.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

/**
 * Call Lovable AI (Gemini) - Free tier
 */
async function callLovableAI(
  messages: AIMessage[],
  config?: AIConfig
): Promise<AIResponse> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableKey) {
    throw new Error('LOVABLE_API_KEY not configured');
  }

  const startTime = Date.now();
  const model = config?.model || DEFAULT_LOVABLE_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: config?.temperature ?? 0.3,
  };

  if (config?.maxTokens) {
    body.max_tokens = config.maxTokens;
  }

  // Lovable AI/Gemini supports response_format for JSON
  if (config?.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(LOVABLE_AI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${lovableKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AI Helper] Lovable AI error:', response.status, errorText);
    
    if (response.status === 429) {
      throw new Error('Rate limit exceeded on Lovable AI');
    }
    if (response.status === 402) {
      throw new Error('Payment required for Lovable AI');
    }
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - startTime;

  return {
    content: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0,
    provider: 'lovable',
    model,
    durationMs,
  };
}

/**
 * Call OpenAI - For precision tasks
 */
async function callOpenAI(
  messages: AIMessage[],
  config?: AIConfig
): Promise<AIResponse> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const startTime = Date.now();
  const model = config?.model || DEFAULT_OPENAI_MODEL;

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: config?.temperature ?? 0.3,
  };

  if (config?.maxTokens) {
    body.max_tokens = config.maxTokens;
  }

  if (config?.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AI Helper] OpenAI error:', response.status, errorText);
    throw new Error(`OpenAI error: ${response.status}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - startTime;

  return {
    content: data.choices?.[0]?.message?.content || '',
    tokensUsed: data.usage?.total_tokens || 0,
    provider: 'openai',
    model,
    durationMs,
  };
}

/**
 * Main AI call function with hybrid strategy:
 * - If preferOpenAI is true and OpenAI key exists, try OpenAI first
 * - Otherwise, use Lovable AI (free tier)
 * - If primary fails, fallback to the other
 */
export async function callAI(
  messages: AIMessage[],
  config?: AIConfig
): Promise<AIResponse> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');

  // Strategy: preferOpenAI for precision JSON tasks
  if (config?.preferOpenAI && openaiKey) {
    try {
      console.log('[AI Helper] Using OpenAI (precision mode)');
      return await callOpenAI(messages, config);
    } catch (error) {
      console.warn('[AI Helper] OpenAI failed, falling back to Lovable AI:', error);
      if (lovableKey) {
        return await callLovableAI(messages, {
          ...config,
          model: config?.model?.startsWith('gpt') ? DEFAULT_LOVABLE_MODEL : config?.model,
        });
      }
      throw error;
    }
  }

  // Default: Use Lovable AI (free/cost-saving)
  if (lovableKey) {
    try {
      console.log('[AI Helper] Using Lovable AI (default mode)');
      return await callLovableAI(messages, config);
    } catch (error) {
      console.warn('[AI Helper] Lovable AI failed, falling back to OpenAI:', error);
      if (openaiKey) {
        return await callOpenAI(messages, {
          ...config,
          model: config?.model?.startsWith('google/') ? DEFAULT_OPENAI_MODEL : config?.model,
        });
      }
      throw error;
    }
  }

  // Fallback to OpenAI if no Lovable key
  if (openaiKey) {
    console.log('[AI Helper] Using OpenAI (no Lovable key)');
    return await callOpenAI(messages, config);
  }

  throw new Error('No AI API keys configured (neither LOVABLE_API_KEY nor OPENAI_API_KEY)');
}

/**
 * Parse JSON from AI response with cleanup
 */
export function parseAIJson<T>(content: string): T {
  // Remove markdown code blocks if present
  const cleaned = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  return JSON.parse(cleaned);
}

/**
 * Check if we have any AI service available
 */
export function hasAIService(): boolean {
  return !!(Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('OPENAI_API_KEY'));
}
