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
    const { operation_id, deal_profile_json } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the prompt template
    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts')
      .select('*')
      .eq('key', 'generate_teaser')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData) {
      throw new Error('Prompt template not found');
    }

    // Get deal profile if operation_id provided
    let dealProfile = deal_profile_json;
    if (operation_id && !dealProfile) {
      const { data: operation, error: opError } = await supabase
        .from('company_operations')
        .select('*')
        .eq('id', operation_id)
        .single();

      if (opError) {
        throw new Error(`Operation not found: ${opError.message}`);
      }

      dealProfile = {
        sector: operation.sector,
        subsector: operation.subsector,
        location: operation.location,
        revenue: operation.revenue,
        ebitda: operation.ebitda,
        employees: operation.employees,
        description: operation.description,
        reason_for_sale: operation.deal_type,
        highlights: operation.highlights || []
      };
    }

    if (!dealProfile) {
      throw new Error('No deal profile provided');
    }

    // Build the prompt
    const userPrompt = promptData.user_prompt_template
      .replace('{{deal_profile_json}}', JSON.stringify(dealProfile, null, 2));

    console.log('Generating teaser for deal profile...');

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
        temperature: promptData.temperature || 0.3,
        max_tokens: promptData.max_tokens || 2000,
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
    let teaser;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        teaser = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse teaser JSON');
    }

    // Log the AI execution
    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'generate_teaser',
      input_data: { operation_id, deal_profile: dealProfile },
      output_data: teaser,
      tokens_used: aiData.usage?.total_tokens || 0,
      model_used: promptData.model || 'google/gemini-2.5-flash',
      execution_time_ms: 0,
      success: true
    });

    console.log('Teaser generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        teaser,
        operation_id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sf-generate-teaser:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
