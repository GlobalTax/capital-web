import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI, parseAIJson } from "../_shared/ai-helper.ts";

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
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    // Get the prompt template
    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts').select('*').eq('key', 'generate_teaser').eq('is_active', true).single();
    if (promptError || !promptData) throw new Error('Prompt template not found');

    // Get deal profile if operation_id provided
    let dealProfile = deal_profile_json;
    if (operation_id && !dealProfile) {
      const { data: operation, error: opError } = await supabase
        .from('company_operations').select('*').eq('id', operation_id).single();
      if (opError) throw new Error(`Operation not found: ${opError.message}`);

      dealProfile = {
        sector: operation.sector, subsector: operation.subsector, location: operation.location,
        revenue: operation.revenue, ebitda: operation.ebitda, employees: operation.employees,
        description: operation.description, reason_for_sale: operation.deal_type, highlights: operation.highlights || []
      };
    }
    if (!dealProfile) throw new Error('No deal profile provided');

    const userPrompt = promptData.user_prompt_template
      .replace('{{deal_profile_json}}', JSON.stringify(dealProfile, null, 2));

    console.log('Generating teaser for deal profile...');

    const aiResponse = await callAI(
      [{ role: 'system', content: promptData.system_prompt }, { role: 'user', content: userPrompt }],
      { model: promptData.model || 'google/gemini-2.5-flash', temperature: promptData.temperature || 0.3, maxTokens: promptData.max_tokens || 2000, functionName: 'sf-generate-teaser' }
    );

    let teaser;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) { teaser = JSON.parse(jsonMatch[0]); }
      else { throw new Error('No JSON found in response'); }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse.content);
      throw new Error('Failed to parse teaser JSON');
    }

    // Log the AI execution
    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'generate_teaser', input_data: { operation_id, deal_profile: dealProfile },
      output_data: teaser, tokens_used: aiResponse.tokensUsed, model_used: aiResponse.model,
      execution_time_ms: aiResponse.durationMs, success: true
    });

    console.log('Teaser generated successfully');

    return new Response(
      JSON.stringify({ success: true, teaser, operation_id }),
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
