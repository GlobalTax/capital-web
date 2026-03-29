/**
 * AI Helper - Hybrid AI System v3
 * Supports Anthropic Claude + Lovable AI + OpenAI with:
 * - Tool calling (tools/tool_choice)
 * - Vision (image_url content)
 * - Auto-logging to ai_usage_logs
 * - Automatic fallback: Claude → Lovable AI → OpenAI
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
  preferAnthropic?: boolean;
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
  provider: 'openai' | 'lovable' | 'anthropic';
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

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const LOVABLE_AI_URL = 'https://ai.gateway.lovable.dev/v1/chat/completions';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const DEFAULT_ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
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

// ─── Anthropic (Claude) ─────────────────────────────────────────────

async function callAnthropic(messages: AIMessage[], config?: AIConfig): Promise<AIResponse> {
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!anthropicKey) throw new Error('ANTHROPIC_API_KEY not configured');

  const startTime = Date.now();
  const model = config?.model && !config.model.startsWith('google/') && !config.model.startsWith('gpt')
    ? config.model
    : DEFAULT_ANTHROPIC_MODEL;

  // Separate system prompt from user/assistant messages (Anthropic API format)
  let systemPrompt: string | undefined;
  const anthropicMessages: Array<{ role: string; content: string | any[] }> = [];

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt = typeof msg.content === 'string' ? msg.content : msg.content.map(p => p.text || '').join('\n');
    } else {
      let content: string | any[];
      if (typeof msg.content === 'string') {
        content = msg.content;
      } else {
        // Convert content parts to Anthropic format
        content = msg.content.map(part => {
          if (part.type === 'text') {
            return { type: 'text', text: part.text || '' };
          }
          if (part.type === 'image_url' && part.image_url?.url) {
            // Anthropic uses base64 images differently
            const url = part.image_url.url;
            if (url.startsWith('data:')) {
              const match = url.match(/^data:(.*?);base64,(.*)$/);
              if (match) {
                return {
                  type: 'image',
                  source: { type: 'base64', media_type: match[1], data: match[2] }
                };
              }
            }
            return { type: 'image', source: { type: 'url', url } };
          }
          return { type: 'text', text: '' };
        });
      }
      anthropicMessages.push({ role: msg.role, content });
    }
  }

  const body: Record<string, unknown> = {
    model,
    messages: anthropicMessages,
    max_tokens: config?.maxTokens || 4096,
    temperature: config?.temperature ?? 0.3,
  };

  if (systemPrompt) body.system = systemPrompt;

  // Map tools to Anthropic format
  if (config?.tools) {
    body.tools = config.tools.map(t => ({
      name: t.function.name,
      description: t.function.description,
      input_schema: t.function.parameters,
    }));
  }
  if (config?.tool_choice && typeof config.tool_choice === 'object' && 'function' in config.tool_choice) {
    body.tool_choice = { type: 'tool', name: config.tool_choice.function.name };
  }

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': anthropicKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AI Helper] Anthropic error:', response.status, errorText);
    if (response.status === 429) throw new Error('RATE_LIMITED');
    throw new Error(`Anthropic error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const durationMs = Date.now() - startTime;

  // Extract content from Anthropic response format
  let textContent = '';
  const toolCalls: AIToolCall[] = [];

  if (data.content) {
    for (const block of data.content) {
      if (block.type === 'text') {
        textContent += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          type: 'function',
          function: {
            name: block.name,
            arguments: JSON.stringify(block.input),
          },
        });
      }
    }
  }

  const result: AIResponse = {
    content: textContent,
    tokensUsed: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0),
    tokensInput: data.usage?.input_tokens || 0,
    tokensOutput: data.usage?.output_tokens || 0,
    provider: 'anthropic',
    model,
    durationMs,
  };

  if (toolCalls.length > 0) {
    result.toolCalls = toolCalls;
  }

  return result;
}

// ─── Lovable AI ─────────────────────────────────────────────────────

async function callLovableAI(messages: AIMessage[], config?: AIConfig): Promise<AIResponse> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableKey) throw new Error('LOVABLE_API_KEY not configured');

  const startTime = Date.now();
  const model = config?.model || DEFAULT_LOVABLE_MODEL;
  const body = buildRequestBody(messages, config, 'lovable');
  // Override model for lovable
  body.model = model.startsWith('gpt') || model.startsWith('claude') ? DEFAULT_LOVABLE_MODEL : model;

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

// ─── OpenAI ─────────────────────────────────────────────────────────

async function callOpenAI(messages: AIMessage[], config?: AIConfig): Promise<AIResponse> {
  const openaiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiKey) throw new Error('OPENAI_API_KEY not configured');

  const startTime = Date.now();
  const model = config?.model || DEFAULT_OPENAI_MODEL;
  const body = buildRequestBody(messages, config, 'openai');
  // Override model for openai
  body.model = model.startsWith('google/') || model.startsWith('claude') ? DEFAULT_OPENAI_MODEL : model;

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
    if (response.provider === 'anthropic') {
      // Claude Sonnet 4: ~$3/1M input, ~$15/1M output
      estimatedCost = ((response.tokensInput || 0) * 0.000003) + ((response.tokensOutput || 0) * 0.000015);
    } else if (response.provider === 'openai') {
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
  const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY');
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  const openaiKey = Deno.env.get('OPENAI_API_KEY');

  let response: AIResponse;

  // Strategy 1: preferOpenAI for precision JSON tasks (legacy support)
  if (config?.preferOpenAI && openaiKey) {
    try {
      console.log('[AI Helper] Using OpenAI (precision mode)');
      response = await callOpenAI(messages, config);
      logUsage(response, config);
      return response;
    } catch (error) {
      console.warn('[AI Helper] OpenAI failed, falling back:', error);
      await logUsage({ content: '', tokensUsed: 0, provider: 'openai', model: config?.model || DEFAULT_OPENAI_MODEL, durationMs: 0 }, config, 'error', String(error));
    }
  }

  // Default strategy: Claude → Lovable AI → OpenAI
  // Step 1: Try Anthropic Claude (primary)
  if (anthropicKey) {
    try {
      console.log('[AI Helper] Using Anthropic Claude (primary)');
      response = await callAnthropic(messages, config);
      logUsage(response, config);
      return response;
    } catch (error) {
      const errorMsg = String(error);
      await logUsage({ content: '', tokensUsed: 0, provider: 'anthropic', model: DEFAULT_ANTHROPIC_MODEL, durationMs: 0 }, config, errorMsg.includes('RATE_LIMITED') ? 'rate_limited' : 'error', errorMsg);
      
      if (errorMsg.includes('RATE_LIMITED')) {
        // For rate limits, try fallback instead of throwing
        console.warn('[AI Helper] Anthropic rate limited, trying fallback...');
      } else {
        console.warn('[AI Helper] Anthropic failed, trying fallback:', error);
      }
    }
  }

  // Step 2: Try Lovable AI (fallback)
  if (lovableKey) {
    try {
      console.log('[AI Helper] Using Lovable AI (fallback)');
      response = await callLovableAI(messages, config);
      logUsage(response, config);
      return response;
    } catch (error) {
      const errorMsg = String(error);
      await logUsage({ content: '', tokensUsed: 0, provider: 'lovable', model: DEFAULT_LOVABLE_MODEL, durationMs: 0 }, config, errorMsg.includes('RATE_LIMITED') ? 'rate_limited' : 'error', errorMsg);

      if (errorMsg.includes('RATE_LIMITED') || errorMsg.includes('PAYMENT_REQUIRED')) {
        throw error;
      }
      console.warn('[AI Helper] Lovable AI failed, trying OpenAI:', error);
    }
  }

  // Step 3: Try OpenAI (last resort)
  if (openaiKey) {
    console.log('[AI Helper] Using OpenAI (last resort)');
    response = await callOpenAI(messages, config);
    logUsage(response, config);
    return response;
  }

  throw new Error('No AI API keys configured (neither ANTHROPIC_API_KEY, LOVABLE_API_KEY, nor OPENAI_API_KEY)');
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
  return !!(Deno.env.get('ANTHROPIC_API_KEY') || Deno.env.get('LOVABLE_API_KEY') || Deno.env.get('OPENAI_API_KEY'));
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
