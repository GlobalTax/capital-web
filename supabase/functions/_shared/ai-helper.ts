/**
 * AI Helper - Hybrid AI System v2
 * Supports OpenAI + Lovable AI with:
 * - Tool calling (tools/tool_choice)
 * - Vision (image_url content)
 * - Auto-logging to ai_usage_logs
 * - Automatic fallback between services
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ─── Types ───────────────────────────────────────────────────────────

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string | AIContentPart[];
}

export interface AIContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: { url: string; detail?: 'auto' | 'low' | 'high' };
}

export interface AITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface AIConfig {
  preferOpenAI?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  tools?: AITool[];
  tool_choice?: { type: 'function'; function: { name: string } } | 'auto' | 'none';
  functionName?: string;  // For logging: name of the calling edge function
}

export interface AIResponse {
  content: string;
  toolCalls?: AIToolCall[];
  tokensUsed: number;
  tokensInput?: number;
  tokensOutput?: number;
  provider: 'openai' | 'lovable';
  model: string;
  durationMs: number;
}

export interface AIToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

// ─── Constants ───────────────────────────────────────────────────────

const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const DEFAULT_LOVABLE_MODEL = 'google/gemini-2.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

// ─── Provider calls ──────────────────────────────────────────────────

function buildRequestBody(messages: AIMessage[], config?: AIConfig, provider?: 'lovable' | 'openai'): Record<string, unknown> {
  const defaultModel = provider === 'openai' ? DEFAULT_OPENAI_MODEL : DEFAULT_LOVABLE_MODEL;
  const body: Record<string, unknown> = {
    model: config?.model || defaultModel,
    messages,
    temperature: config?.temperature ?? 0.3,
  };

  if (config?.maxTokens) body.max_tokens = config.maxTokens;
  if (config?.jsonMode) body.response_format = { type: 'json_object' };
  if (config?.tools) body.tools = config.tools;
  if (config?.tool_choice) body.tool_choice = config.tool_choice;

  return body;
}

function extractResponse(data: Record<string, unknown>, provider: 'lovable' | 'openai', model: string, durationMs: number): AIResponse {
  const choice = (data.choices as any[])?.[0];
  const message = choice?.message;
  const usage = data.usage as any;

  const response: AIResponse = {
    content: message?.content || '',
    tokensUsed: usage?.total_tokens || 0,
    tokensInput: usage?.prompt_tokens || 0,
    tokensOutput: usage?.completion_tokens || 0,
    provider,
    model,
    durationMs,
  };

  if (message?.tool_calls?.length > 0) {
    response.toolCalls = message.tool_calls;
  }

  return response;
}

async function callLovableAI(messages: AIMessage[], config?: AIConfig): Promise<AIResponse> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableKey) throw new Error('LOVABLE_API_KEY not configured');

  const startTime = Date.now();
  const model = config?.model || DEFAULT_LOVABLE_MODEL;
  const body = buildRequestBody(messages, config, 'lovable');
  // Override model for lovable
  body.model = model.startsWith('gpt') ? DEFAULT_LOVABLE_MODEL : model;

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
    if (response.status === 429) throw new Error('RATE_LIMITED');
    if (response.status === 402) throw new Error('PAYMENT_REQUIRED');
    throw new Error(`Lovable AI error: ${response.status}`);
  }

  const data = await response.json();
  return extractResponse(data, 'lovable', body.model as string, Date.now() - startTime);
}

async function callOpenAI(messages: AIMessage[], config?: AIConfig): Promise<AIResponse> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

  const startTime = Date.now();
  const model = config?.model || DEFAULT_OPENAI_MODEL;
  const body = buildRequestBody(messages, config, 'openai');
  // Override model for openai
  body.model = model.startsWith('google/') ? DEFAULT_OPENAI_MODEL : model;

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
  return extractResponse(data, 'openai', body.model as string, Date.now() - startTime);
}

// ─── Logging ─────────────────────────────────────────────────────────

async function logUsage(response: AIResponse, config?: AIConfig, status: string = 'success', errorMessage?: string): Promise<void> {
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) return;

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Estimate cost (rough approximation)
    let estimatedCost = 0;
    if (response.provider === 'openai') {
      // GPT-4o-mini: ~$0.15/1M input, ~$0.60/1M output
      estimatedCost = ((response.tokensInput || 0) * 0.00000015) + ((response.tokensOutput || 0) * 0.0000006);
    } else {
      // Gemini Flash: ~$0.075/1M input, ~$0.30/1M output
      estimatedCost = ((response.tokensInput || 0) * 0.000000075) + ((response.tokensOutput || 0) * 0.0000003);
    }

    await supabase.from('ai_usage_logs').insert({
      function_name: config?.functionName || 'unknown',
      provider: response.provider,
      model: response.model,
      tokens_input: response.tokensInput || 0,
      tokens_output: response.tokensOutput || 0,
      tokens_total: response.tokensUsed,
      duration_ms: response.durationMs,
      estimated_cost_usd: Math.round(estimatedCost * 1000000) / 1000000,
      status,
      error_message: errorMessage || null,
    });
  } catch (e) {
    // Logging should never break the main flow
    console.warn('[AI Helper] Failed to log usage:', e);
  }
}

// ─── Main entry point ────────────────────────────────────────────────

export async function callAI(messages: AIMessage[], config?: AIConfig): Promise<AIResponse> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');

  let response: AIResponse;

  // Strategy: preferOpenAI for precision JSON tasks
  if (config?.preferOpenAI && openaiKey) {
    try {
      console.log('[AI Helper] Using OpenAI (precision mode)');
      response = await callOpenAI(messages, config);
      logUsage(response, config); // fire-and-forget
      return response;
    } catch (error) {
      console.warn('[AI Helper] OpenAI failed, falling back to Lovable AI:', error);
      await logUsage({ content: '', tokensUsed: 0, provider: 'openai', model: config?.model || DEFAULT_OPENAI_MODEL, durationMs: 0 }, config, 'error', String(error));
      if (lovableKey) {
        response = await callLovableAI(messages, config);
        logUsage(response, config);
        return response;
      }
      throw error;
    }
  }

  // Default: Use Lovable AI (free/cost-saving)
  if (lovableKey) {
    try {
      console.log('[AI Helper] Using Lovable AI (default mode)');
      response = await callLovableAI(messages, config);
      logUsage(response, config);
      return response;
    } catch (error) {
      const errorMsg = String(error);
      await logUsage({ content: '', tokensUsed: 0, provider: 'lovable', model: config?.model || DEFAULT_LOVABLE_MODEL, durationMs: 0 }, config, errorMsg.includes('RATE_LIMITED') ? 'rate_limited' : 'error', errorMsg);

      // Re-throw rate limit / payment errors without fallback
      if (errorMsg.includes('RATE_LIMITED') || errorMsg.includes('PAYMENT_REQUIRED')) {
        throw error;
      }

      console.warn('[AI Helper] Lovable AI failed, falling back to OpenAI:', error);
      if (openaiKey) {
        response = await callOpenAI(messages, config);
        logUsage(response, config);
        return response;
      }
      throw error;
    }
  }

  // Fallback to OpenAI if no Lovable key
  if (openaiKey) {
    console.log('[AI Helper] Using OpenAI (no Lovable key)');
    response = await callOpenAI(messages, config);
    logUsage(response, config);
    return response;
  }

  throw new Error('No AI API keys configured (neither LOVABLE_API_KEY nor OPENAI_API_KEY)');
}

// ─── Utilities ───────────────────────────────────────────────────────

/**
 * Parse JSON from AI response with cleanup
 */
export function parseAIJson<T>(content: string): T {
  const cleaned = content
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  return JSON.parse(cleaned);
}

/**
 * Extract tool call arguments as parsed JSON
 */
export function extractToolCallArgs<T>(response: AIResponse): T | null {
  const toolCall = response.toolCalls?.[0];
  if (!toolCall?.function?.arguments) return null;
  return JSON.parse(toolCall.function.arguments);
}

/**
 * Check if we have any AI service available
 */
export function hasAIService(): boolean {
  return !!(Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('OPENAI_API_KEY'));
}

/**
 * Create an HTTP error response for common AI errors
 */
export function aiErrorResponse(error: unknown, corsHeaders: Record<string, string>): Response {
  const msg = String(error);
  if (msg.includes('RATE_LIMITED')) {
    return new Response(
      JSON.stringify({ error: 'Límite de peticiones excedido. Inténtalo de nuevo en unos segundos.' }),
      { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  if (msg.includes('PAYMENT_REQUIRED')) {
    return new Response(
      JSON.stringify({ error: 'Créditos de IA agotados. Contacta con el administrador.' }),
      { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  return new Response(
    JSON.stringify({ error: 'Error en el servicio de IA' }),
    { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
