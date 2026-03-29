import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { validateAdminRequest } from "../_shared/auth-guard.ts";
import { callAI } from "../_shared/ai-helper.ts";
import { executeTool, getToolDefinitionsForAgent } from "../_shared/agent-tools.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const auth = await validateAdminRequest(req, corsHeaders);
    if (auth.error) return auth.error;
    const { userId, adminClient } = auth;

    const { agent_id, message, conversation_id } = await req.json();

    if (!agent_id || !message) {
      return new Response(
        JSON.stringify({ error: 'agent_id and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load agent config
    const { data: agent, error: agentError } = await adminClient
      .from('ai_agents')
      .select('*')
      .eq('id', agent_id)
      .eq('is_active', true)
      .single();

    if (agentError || !agent) {
      return new Response(
        JSON.stringify({ error: 'Agent not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Load or create conversation
    let conversationMessages: Array<{ role: string; content: string }> = [];
    let convId = conversation_id;

    if (convId) {
      const { data: conv } = await adminClient
        .from('ai_agent_conversations')
        .select('messages')
        .eq('id', convId)
        .eq('user_id', userId)
        .single();
      
      if (conv?.messages) {
        conversationMessages = conv.messages as Array<{ role: string; content: string }>;
      }
    }

    // Build messages for AI
    const aiMessages = [
      { role: 'system' as const, content: agent.system_prompt },
      ...conversationMessages.map((m: any) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      { role: 'user' as const, content: message },
    ];

    // Get tool definitions for enabled tools
    const tools = agent.tools?.length > 0
      ? getToolDefinitionsForAgent(agent.tools)
      : undefined;

    // Call AI with agent config
    let response = await callAI(aiMessages, {
      model: agent.model || undefined,
      temperature: agent.temperature ? Number(agent.temperature) : 0.3,
      maxTokens: agent.max_tokens || 4096,
      tools,
      tool_choice: tools ? 'auto' : undefined,
      functionName: `ai-agent:${agent.name}`,
    });

    // Handle tool calls (max 5 iterations to prevent infinite loops)
    const toolResults: Array<{ tool: string; args: any; result: any }> = [];
    let iterations = 0;

    while (response.toolCalls && response.toolCalls.length > 0 && iterations < 5) {
      iterations++;

      for (const toolCall of response.toolCalls) {
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const toolResult = await executeTool(toolCall.function.name, toolArgs, adminClient);
        toolResults.push({
          tool: toolCall.function.name,
          args: toolArgs,
          result: JSON.parse(toolResult),
        });

        // Add tool result to messages and call AI again
        aiMessages.push({
          role: 'assistant' as const,
          content: response.content || `Calling tool: ${toolCall.function.name}`,
        });
        aiMessages.push({
          role: 'user' as const,
          content: `Tool result for ${toolCall.function.name}: ${toolResult}`,
        });
      }

      // Call AI again with tool results
      response = await callAI(aiMessages, {
        model: agent.model || undefined,
        temperature: agent.temperature ? Number(agent.temperature) : 0.3,
        maxTokens: agent.max_tokens || 4096,
        tools,
        tool_choice: 'auto',
        functionName: `ai-agent:${agent.name}`,
      });
    }

    // Save conversation
    const newMessages = [
      ...conversationMessages,
      { role: 'user', content: message },
      { role: 'assistant', content: response.content, toolCalls: toolResults.length > 0 ? toolResults : undefined },
    ];

    if (convId) {
      await adminClient
        .from('ai_agent_conversations')
        .update({ messages: newMessages, updated_at: new Date().toISOString() })
        .eq('id', convId);
    } else {
      const { data: newConv } = await adminClient
        .from('ai_agent_conversations')
        .insert({
          agent_id,
          user_id: userId,
          messages: newMessages,
          status: 'active',
        })
        .select('id')
        .single();
      convId = newConv?.id;
    }

    return new Response(
      JSON.stringify({
        content: response.content,
        conversation_id: convId,
        model: response.model,
        provider: response.provider,
        tokens_used: response.tokensUsed,
        tool_calls: toolResults,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('ai-agent error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
