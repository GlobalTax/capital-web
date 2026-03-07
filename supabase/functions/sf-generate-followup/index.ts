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
    const { outreach_id, previous_email_body, buyer_profile_json, teaser_json } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the prompt template
    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts')
      .select('*')
      .eq('key', 'generate_followup')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData) {
      throw new Error('Prompt template not found');
    }

    let previousEmail = previous_email_body;
    let buyerProfile = buyer_profile_json;
    let teaser = teaser_json;

    if (outreach_id) {
      const { data: outreach } = await supabase
        .from('sf_outreach')
        .select('*, sf_funds(*)')
        .eq('id', outreach_id)
        .single();

      if (outreach) {
        previousEmail = previousEmail || outreach.email_body;
        if (outreach.sf_funds && !buyerProfile) {
          buyerProfile = {
            name: outreach.sf_funds.name,
            entity_type: outreach.sf_funds.entity_type,
            stage: outreach.sf_funds.status,
            geo_focus: outreach.sf_funds.target_geography,
            industry_focus: outreach.sf_funds.target_sectors
          };
        }
      }
    }

    if (!previousEmail) {
      throw new Error('No previous email body provided');
    }

    const userPrompt = promptData.user_prompt_template
      .replace('{{previous_email_body}}', previousEmail)
      .replace('{{buyer_profile_json}}', JSON.stringify(buyerProfile || {}, null, 2))
      .replace('{{teaser_json}}', JSON.stringify(teaser || {}, null, 2));

    console.log('Generating follow-up email...');

    let aiResponse;
    try {
      aiResponse = await callAI(
        [
          { role: 'system', content: promptData.system_prompt },
          { role: 'user', content: userPrompt }
        ],
        {
          model: promptData.model || 'google/gemini-2.5-flash',
          temperature: promptData.temperature || 0.4,
          maxTokens: promptData.max_tokens || 1000,
          functionName: 'sf-generate-followup',
        }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    if (!aiResponse.content) throw new Error('No content in AI response');

    let followup;
    try {
      const jsonMatch = aiResponse.content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        followup = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch {
      console.error('Failed to parse AI response:', aiResponse.content);
      throw new Error('Failed to parse follow-up JSON');
    }

    if (outreach_id) {
      await supabase.from('sf_outreach').update({
        followup_subject: followup.followup_subject,
        followup_body: followup.followup_body,
        updated_at: new Date().toISOString()
      }).eq('id', outreach_id);
    }

    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'generate_followup',
      input_data: { outreach_id, previous_email_snippet: previousEmail?.substring(0, 200) },
      output_data: followup,
      tokens_used: aiResponse.tokensUsed,
      model_used: aiResponse.model,
      execution_time_ms: aiResponse.durationMs,
      success: true
    });

    console.log('Follow-up email generated successfully');

    return new Response(
      JSON.stringify({ success: true, followup, outreach_id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sf-generate-followup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
