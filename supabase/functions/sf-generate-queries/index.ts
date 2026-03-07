import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { country, country_code } = await req.json();

    if (!country || !country_code) {
      throw new Error('country and country_code are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the prompt template
    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts')
      .select('*')
      .eq('key', 'generate_queries')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData) {
      throw new Error('Prompt template not found');
    }

    const userPrompt = promptData.user_prompt_template
      .replace(/\{\{country\}\}/g, country)
      .replace(/\{\{country_code\}\}/g, country_code);

    console.log('Generating search queries for:', country, '(', country_code, ')');

    const response = await callAI(
      [
        { role: 'system', content: promptData.system_prompt },
        { role: 'user', content: userPrompt }
      ],
      {
        functionName: 'sf-generate-queries',
        temperature: promptData.temperature || 0.5,
        maxTokens: promptData.max_tokens || 3000,
        model: promptData.model || undefined,
      }
    );

    const queriesResult = parseAIJson<{ queries: Array<{ query: string; intent?: string; priority?: number }> }>(response.content);

    // Insert generated queries into database
    const queries = queriesResult.queries || [];
    let insertedCount = 0;

    for (const q of queries) {
      const { data: existing } = await supabase
        .from('sf_search_queries')
        .select('id')
        .eq('country_code', country_code)
        .eq('query', q.query)
        .single();

      if (!existing) {
        const { error: insertError } = await supabase
          .from('sf_search_queries')
          .insert({
            country,
            country_code,
            query: q.query,
            intent: q.intent || 'discover',
            priority: q.priority || 3,
            is_active: true
          });

        if (!insertError) {
          insertedCount++;
        }
      }
    }

    // Log the AI execution
    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'generate_queries',
      input_data: { country, country_code },
      output_data: { total_generated: queries.length, inserted: insertedCount },
      tokens_used: response.tokensUsed,
      model_used: response.model,
      execution_time_ms: response.durationMs,
      success: true
    });

    console.log(`Generated ${queries.length} queries, inserted ${insertedCount} new queries`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        country,
        country_code,
        total_generated: queries.length,
        inserted: insertedCount,
        queries: queries
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sf-generate-queries:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
