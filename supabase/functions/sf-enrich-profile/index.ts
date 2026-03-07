import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fund_id, new_url, new_markdown } = await req.json();
    if (!fund_id) throw new Error('fund_id is required');
    if (!new_url && !new_markdown) throw new Error('new_url or new_markdown is required');

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts').select('*').eq('key', 'enrich_profile').eq('is_active', true).single();
    if (promptError || !promptData) throw new Error('Prompt template not found');

    const { data: fund, error: fundError } = await supabase.from('sf_funds').select('*').eq('id', fund_id).single();
    if (fundError || !fund) throw new Error(`Fund not found: ${fund_id}`);

    const currentProfile = {
      name: fund.name, entity_type: fund.entity_type || 'unknown', website: fund.website,
      based_in: { country: fund.country, city: null }, geo_focus: fund.target_geography || [],
      industry_focus: fund.target_sectors || [], stage: fund.status || 'unknown',
      transaction_preferences: fund.transaction_preferences || {},
      size_criteria: fund.size_criteria || { metric: 'EBITDA', min: fund.ebitda_min, max: fund.ebitda_max, currency: 'EUR' },
      data_quality: fund.data_quality || {}, evidence: []
    };

    const userPrompt = promptData.user_prompt_template
      .replace('{{buyer_profile_json}}', JSON.stringify(currentProfile, null, 2))
      .replace('{{url}}', new_url || 'N/A')
      .replace('{{page_markdown}}', new_markdown || '');

    console.log('Enriching profile for fund:', fund.name);

    const aiResponse = await callAI(
      [{ role: 'system', content: promptData.system_prompt }, { role: 'user', content: userPrompt }],
      { model: promptData.model || 'google/gemini-2.5-flash', temperature: promptData.temperature || 0.2, maxTokens: promptData.max_tokens || 3000, functionName: 'sf-enrich-profile' }
    );

    let enrichedProfile;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) { enrichedProfile = JSON.parse(jsonMatch[0]); }
      else { throw new Error('No JSON found in response'); }
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse.content);
      throw new Error('Failed to parse enriched profile JSON');
    }

    // Update fund with enriched data
    const updateData: Record<string, any> = { updated_at: new Date().toISOString() };
    if (enrichedProfile.entity_type && enrichedProfile.entity_type !== 'unknown') updateData.entity_type = enrichedProfile.entity_type;
    if (enrichedProfile.stage && enrichedProfile.stage !== 'unknown') updateData.status = enrichedProfile.stage;
    if (enrichedProfile.geo_focus?.length > 0) updateData.target_geography = enrichedProfile.geo_focus;
    if (enrichedProfile.industry_focus?.length > 0) updateData.target_sectors = enrichedProfile.industry_focus;
    if (enrichedProfile.transaction_preferences) updateData.transaction_preferences = enrichedProfile.transaction_preferences;
    if (enrichedProfile.size_criteria) {
      updateData.size_criteria = enrichedProfile.size_criteria;
      if (enrichedProfile.size_criteria.min) updateData.ebitda_min = enrichedProfile.size_criteria.min;
      if (enrichedProfile.size_criteria.max) updateData.ebitda_max = enrichedProfile.size_criteria.max;
    }
    if (enrichedProfile.data_quality) updateData.data_quality = enrichedProfile.data_quality;
    if (new_url) {
      const existingUrls = fund.scrape_source_urls || [];
      if (!existingUrls.includes(new_url)) updateData.scrape_source_urls = [...existingUrls, new_url];
    }

    await supabase.from('sf_funds').update(updateData).eq('id', fund_id);

    // Add new team members
    if (enrichedProfile.team?.length > 0) {
      for (const member of enrichedProfile.team) {
        const { data: existingPerson } = await supabase.from('sf_people').select('id').eq('fund_id', fund_id).eq('name', member.name).single();
        if (!existingPerson) {
          await supabase.from('sf_people').insert({ fund_id, name: member.name, role: member.role || 'Searcher', linkedin_url: member.linkedin });
        }
      }
    }

    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'enrich_profile', input_data: { fund_id, new_url },
      output_data: enrichedProfile, tokens_used: aiResponse.tokensUsed,
      model_used: aiResponse.model, execution_time_ms: aiResponse.durationMs, success: true
    });

    console.log('Profile enriched successfully for fund:', fund.name);

    return new Response(
      JSON.stringify({ success: true, fund_id, fund_name: fund.name, enriched_profile: enrichedProfile, fields_updated: Object.keys(updateData).filter(k => k !== 'updated_at') }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sf-enrich-profile:', error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
