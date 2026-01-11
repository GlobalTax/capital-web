import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

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

    // Build the prompt
    const userPrompt = promptData.user_prompt_template
      .replace(/\{\{country\}\}/g, country)
      .replace(/\{\{country_code\}\}/g, country_code);

    console.log('Generating search queries for:', country, '(', country_code, ')');

    // Call AI
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: promptData.model || 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: promptData.system_prompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: promptData.temperature || 0.5,
        max_tokens: promptData.max_tokens || 3000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI gateway error:', aiResponse.status, errorText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const content = aiData.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let queriesResult;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        queriesResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse queries JSON');
    }

    // Insert generated queries into database
    const queries = queriesResult.queries || [];
    let insertedCount = 0;

    for (const q of queries) {
      // Check if query already exists
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
      tokens_used: aiData.usage?.total_tokens || 0,
      model_used: promptData.model || 'google/gemini-2.5-flash',
      execution_time_ms: 0,
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

  } catch (error) {
    console.error('Error in sf-generate-queries:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
