import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { validateAdminRequest } from "../_shared/auth-guard.ts";
import { callAI } from "../_shared/ai-helper.ts";
import { executeTool, getToolDefinitionsForAgent, toolRequiresConfirmation } from "../_shared/agent-tools.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const auth = await validateAdminRequest(req, corsHeaders);
    if (auth.error) return auth.error;
    const { userId, adminClient } = auth;

    const body = await req.json();
    const { agent_id, message, conversation_id, action } = body;

    // Handle action confirmations (confirm/reject pending tool calls)
    if (action === 'confirm_tool' || action === 'reject_tool') {
      return await handleToolConfirmation(body, adminClient, userId, corsHeaders);
    }

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
        .select('messages, summary')
        .eq('id', convId)
        .eq('user_id', userId)
        .single();
      
      if (conv?.messages) {
        conversationMessages = conv.messages as Array<{ role: string; content: string }>;
      }
    }

    // Build messages for AI (with summary support for long conversations)
    const aiMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: agent.system_prompt },
    ];

    // If conversation is long, use summary + recent messages
    if (conversationMessages.length > 20) {
      // Summarize old messages
      const oldMessages = conversationMessages.slice(0, -5);
      const recentMessages = conversationMessages.slice(-5);
      
      try {
        const summaryResponse = await callAI([
          { role: 'system', content: 'Eres un asistente que resume conversaciones. Resume la siguiente conversación en 3-4 oraciones, capturando el contexto clave, decisiones tomadas y datos importantes mencionados.' },
          { role: 'user', content: oldMessages.map(m => `${m.role}: ${m.content}`).join('\n') },
        ], { maxTokens: 500, functionName: `ai-agent:${agent.name}:summary` });

        aiMessages.push({ role: 'system', content: `Resumen de la conversación anterior: ${summaryResponse.content}` });

        // Save summary
        if (convId) {
          await adminClient
            .from('ai_agent_conversations')
            .update({ summary: summaryResponse.content })
            .eq('id', convId);
        }
      } catch {
        // If summary fails, just use recent messages
      }

      for (const m of recentMessages) {
        aiMessages.push({ role: m.role as 'user' | 'assistant', content: m.content });
      }
    } else {
      for (const m of conversationMessages) {
        aiMessages.push({ role: m.role as 'user' | 'assistant', content: m.content });
      }
    }

    aiMessages.push({ role: 'user', content: message });

    // Get tool definitions
    const tools = agent.tools?.length > 0
      ? getToolDefinitionsForAgent(agent.tools)
      : undefined;

    // Call AI
    let response = await callAI(aiMessages, {
      model: agent.model || undefined,
      temperature: agent.temperature ? Number(agent.temperature) : 0.3,
      maxTokens: agent.max_tokens || 4096,
      tools,
      tool_choice: tools ? 'auto' : undefined,
      functionName: `ai-agent:${agent.name}`,
    });

    // Handle tool calls (max 5 iterations)
    const toolResults: Array<{ tool: string; args: any; result: any }> = [];
    let iterations = 0;
    let pendingConfirmation: { tool: string; args: any; toolCallId: string } | null = null;

    while (response.toolCalls && response.toolCalls.length > 0 && iterations < 5) {
      iterations++;

      for (const toolCall of response.toolCalls) {
        const toolArgs = JSON.parse(toolCall.function.arguments);

        // Check if tool requires confirmation
        if (toolRequiresConfirmation(toolCall.function.name)) {
          pendingConfirmation = {
            tool: toolCall.function.name,
            args: toolArgs,
            toolCallId: toolCall.id,
          };
          // Break out — don't execute, return pending state
          break;
        }

        const toolResult = await executeTool(toolCall.function.name, toolArgs, adminClient);
        toolResults.push({
          tool: toolCall.function.name,
          args: toolArgs,
          result: JSON.parse(toolResult),
        });

        // Add tool result with native format context
        aiMessages.push({
          role: 'assistant',
          content: response.content || `Calling tool: ${toolCall.function.name}`,
        });
        aiMessages.push({
          role: 'user',
          content: `Tool result for ${toolCall.function.name}: ${toolResult}`,
        });
      }

      // If we have a pending confirmation, break the loop
      if (pendingConfirmation) break;

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

    const responseBody: Record<string, unknown> = {
      content: response.content,
      conversation_id: convId,
      model: response.model,
      provider: response.provider,
      tokens_used: response.tokensUsed,
      tool_calls: toolResults,
    };

    // If there's a pending confirmation, include it
    if (pendingConfirmation) {
      responseBody.pending_confirmation = pendingConfirmation;
    }

    return new Response(
      JSON.stringify(responseBody),
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

// ─── Handle tool confirmation/rejection ──────────────────────────

async function handleToolConfirmation(
  body: any,
  adminClient: ReturnType<typeof createClient>,
  userId: string,
  corsHeaders: Record<string, string>
) {
  const { conversation_id, action, tool_name, tool_args } = body;

  if (action === 'confirm_tool' && tool_name && tool_args) {
    // Execute the confirmed tool
    const result = await executeTool(tool_name, tool_args, adminClient);
    const parsedResult = JSON.parse(result);

    // Update conversation with tool result
    if (conversation_id) {
      const { data: conv } = await adminClient
        .from('ai_agent_conversations')
        .select('messages')
        .eq('id', conversation_id)
        .eq('user_id', userId)
        .single();

      if (conv?.messages) {
        const msgs = conv.messages as any[];
        msgs.push({
          role: 'assistant',
          content: `✅ Acción confirmada: ${tool_name} ejecutado correctamente.`,
          toolCalls: [{ tool: tool_name, args: tool_args, result: parsedResult }],
        });
        await adminClient
          .from('ai_agent_conversations')
          .update({ messages: msgs, updated_at: new Date().toISOString() })
          .eq('id', conversation_id);
      }
    }

    return new Response(
      JSON.stringify({ content: `✅ Acción ejecutada: ${tool_name}`, result: parsedResult, conversation_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Rejected
  return new Response(
    JSON.stringify({ content: '❌ Acción cancelada por el usuario.', conversation_id }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
