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
    const { buyer_a_id, buyer_b_id } = await req.json();

    if (!buyer_a_id || !buyer_b_id) {
      throw new Error('buyer_a_id and buyer_b_id are required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the prompt template
    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts')
      .select('*')
      .eq('key', 'dedupe_check')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData) {
      throw new Error('Prompt template not found');
    }

    // Get both fund profiles
    const [{ data: fundA, error: errorA }, { data: fundB, error: errorB }] = await Promise.all([
      supabase.from('sf_funds').select('*, sf_people(*)').eq('id', buyer_a_id).single(),
      supabase.from('sf_funds').select('*, sf_people(*)').eq('id', buyer_b_id).single(),
    ]);

    if (errorA || !fundA) throw new Error(`Fund A not found: ${buyer_a_id}`);
    if (errorB || !fundB) throw new Error(`Fund B not found: ${buyer_b_id}`);

    const profileA = {
      name: fundA.name, entity_type: fundA.entity_type, website: fundA.website,
      based_in: { country: fundA.country, city: null },
      geo_focus: fundA.target_geography || [], industry_focus: fundA.target_sectors || [],
      stage: fundA.status,
      team: fundA.sf_people?.map((p: any) => ({ name: p.name, role: p.role, linkedin: p.linkedin_url })) || [],
      contact: { emails: fundA.contact_email ? [fundA.contact_email] : [], linkedin: fundA.linkedin_url }
    };

    const profileB = {
      name: fundB.name, entity_type: fundB.entity_type, website: fundB.website,
      based_in: { country: fundB.country, city: null },
      geo_focus: fundB.target_geography || [], industry_focus: fundB.target_sectors || [],
      stage: fundB.status,
      team: fundB.sf_people?.map((p: any) => ({ name: p.name, role: p.role, linkedin: p.linkedin_url })) || [],
      contact: { emails: fundB.contact_email ? [fundB.contact_email] : [], linkedin: fundB.linkedin_url }
    };

    const userPrompt = promptData.user_prompt_template
      .replace('{{buyer_a_json}}', JSON.stringify(profileA, null, 2))
      .replace('{{buyer_b_json}}', JSON.stringify(profileB, null, 2));

    console.log('Checking duplicates between:', fundA.name, 'and', fundB.name);

    const response = await callAI(
      [
        { role: 'system', content: promptData.system_prompt },
        { role: 'user', content: userPrompt }
      ],
      {
        functionName: 'sf-dedupe-check',
        temperature: promptData.temperature || 0.1,
        maxTokens: promptData.max_tokens || 1000,
        model: promptData.model || undefined,
      }
    );

    const dedupeResult = parseAIJson(response.content);

    // Log the AI execution
    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'dedupe_check',
      input_data: { buyer_a_id, buyer_b_id, buyer_a_name: fundA.name, buyer_b_name: fundB.name },
      output_data: dedupeResult,
      tokens_used: response.tokensUsed,
      model_used: response.model,
      execution_time_ms: response.durationMs,
      success: true
    });

    console.log('Dedupe check completed:', (dedupeResult as any).same_entity ? 'DUPLICATE' : 'DIFFERENT');

    return new Response(
      JSON.stringify({ 
        success: true, 
        buyer_a: { id: buyer_a_id, name: fundA.name },
        buyer_b: { id: buyer_b_id, name: fundB.name },
        result: dedupeResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sf-dedupe-check:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
