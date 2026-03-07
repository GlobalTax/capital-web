import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fund_id } = await req.json();
    if (!fund_id) throw new Error('fund_id is required');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts').select('*')
      .eq('key', 'monitor_changes').eq('is_active', true).single();
    if (promptError || !promptData) throw new Error('Prompt template not found');

    const { data: fund, error: fundError } = await supabase
      .from('sf_funds').select('*').eq('id', fund_id).single();
    if (fundError || !fund) throw new Error(`Fund not found: ${fund_id}`);

    const oldProfile = {
      name: fund.name, entity_type: fund.entity_type, status: fund.status,
      country: fund.country, target_geography: fund.target_geography,
      target_sectors: fund.target_sectors, ebitda_min: fund.ebitda_min,
      ebitda_max: fund.ebitda_max, data_quality: fund.data_quality, website: fund.website
    };
    const newProfile = { ...oldProfile };

    const userPrompt = promptData.user_prompt_template
      .replace('{{old_buyer_profile_json}}', JSON.stringify(oldProfile, null, 2))
      .replace('{{new_buyer_profile_json}}', JSON.stringify(newProfile, null, 2));

    console.log('Monitoring changes for fund:', fund.name);

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: 'system', content: promptData.system_prompt }, { role: 'user', content: userPrompt }],
        {
          model: promptData.model || 'google/gemini-2.5-flash',
          temperature: promptData.temperature || 0.2,
          maxTokens: promptData.max_tokens || 1500,
          functionName: 'sf-monitor-changes',
        }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    if (!aiResponse.content) throw new Error('No content in AI response');

    let changes;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) changes = JSON.parse(jsonMatch[0]);
      else throw new Error('No JSON found');
    } catch {
      throw new Error('Failed to parse changes JSON');
    }

    await supabase.from('sf_funds').update({
      last_scraped_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', fund_id);

    if (changes.material_changes?.length > 0 || changes.stage_change?.is_material) {
      await supabase.from('admin_notifications').insert({
        type: 'sf_fund_change',
        title: `Cambios detectados: ${fund.name}`,
        message: changes.material_changes?.join(', ') || 'Cambio de etapa detectado',
        metadata: { fund_id, fund_name: fund.name, changes: changes.material_changes, stage_change: changes.stage_change, recommended_actions: changes.recommended_actions }
      });
    }

    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'monitor_changes',
      input_data: { fund_id, fund_name: fund.name },
      output_data: changes,
      tokens_used: aiResponse.tokensUsed,
      model_used: aiResponse.model,
      execution_time_ms: aiResponse.durationMs,
      success: true
    });

    return new Response(
      JSON.stringify({ success: true, fund_id, fund_name: fund.name, changes, has_material_changes: (changes.material_changes?.length > 0) || changes.stage_change?.is_material }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sf-monitor-changes:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
