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
    const { fund_id, new_url, new_markdown } = await req.json();

    if (!fund_id) {
      throw new Error('fund_id is required');
    }
    if (!new_url && !new_markdown) {
      throw new Error('new_url or new_markdown is required');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the prompt template
    const { data: promptData, error: promptError } = await supabase
      .from('sf_ai_prompts')
      .select('*')
      .eq('key', 'enrich_profile')
      .eq('is_active', true)
      .single();

    if (promptError || !promptData) {
      throw new Error('Prompt template not found');
    }

    // Get current fund profile
    const { data: fund, error: fundError } = await supabase
      .from('sf_funds')
      .select('*')
      .eq('id', fund_id)
      .single();

    if (fundError || !fund) {
      throw new Error(`Fund not found: ${fund_id}`);
    }

    // Convert fund to buyer profile format
    const currentProfile = {
      name: fund.name,
      entity_type: fund.entity_type || 'unknown',
      website: fund.website,
      based_in: { country: fund.country, city: null },
      geo_focus: fund.target_geography || [],
      industry_focus: fund.target_sectors || [],
      stage: fund.status || 'unknown',
      transaction_preferences: fund.transaction_preferences || {},
      size_criteria: fund.size_criteria || {
        metric: 'EBITDA',
        min: fund.ebitda_min,
        max: fund.ebitda_max,
        currency: 'EUR'
      },
      data_quality: fund.data_quality || {},
      evidence: []
    };

    // Build the prompt
    const userPrompt = promptData.user_prompt_template
      .replace('{{buyer_profile_json}}', JSON.stringify(currentProfile, null, 2))
      .replace('{{url}}', new_url || 'N/A')
      .replace('{{page_markdown}}', new_markdown || '');

    console.log('Enriching profile for fund:', fund.name);

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
        temperature: promptData.temperature || 0.2,
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
    let enrichedProfile;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        enrichedProfile = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse enriched profile JSON');
    }

    // Update fund with enriched data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    // Only update fields that have new data
    if (enrichedProfile.entity_type && enrichedProfile.entity_type !== 'unknown') {
      updateData.entity_type = enrichedProfile.entity_type;
    }
    if (enrichedProfile.stage && enrichedProfile.stage !== 'unknown') {
      updateData.status = enrichedProfile.stage;
    }
    if (enrichedProfile.geo_focus?.length > 0) {
      updateData.target_geography = enrichedProfile.geo_focus;
    }
    if (enrichedProfile.industry_focus?.length > 0) {
      updateData.target_sectors = enrichedProfile.industry_focus;
    }
    if (enrichedProfile.transaction_preferences) {
      updateData.transaction_preferences = enrichedProfile.transaction_preferences;
    }
    if (enrichedProfile.size_criteria) {
      updateData.size_criteria = enrichedProfile.size_criteria;
      if (enrichedProfile.size_criteria.min) {
        updateData.ebitda_min = enrichedProfile.size_criteria.min;
      }
      if (enrichedProfile.size_criteria.max) {
        updateData.ebitda_max = enrichedProfile.size_criteria.max;
      }
    }
    if (enrichedProfile.data_quality) {
      updateData.data_quality = enrichedProfile.data_quality;
    }

    // Add new URL to source URLs
    if (new_url) {
      const existingUrls = fund.scrape_source_urls || [];
      if (!existingUrls.includes(new_url)) {
        updateData.scrape_source_urls = [...existingUrls, new_url];
      }
    }

    await supabase
      .from('sf_funds')
      .update(updateData)
      .eq('id', fund_id);

    // Add new team members if any
    if (enrichedProfile.team?.length > 0) {
      for (const member of enrichedProfile.team) {
        // Check if person already exists
        const { data: existingPerson } = await supabase
          .from('sf_people')
          .select('id')
          .eq('fund_id', fund_id)
          .eq('name', member.name)
          .single();

        if (!existingPerson) {
          await supabase.from('sf_people').insert({
            fund_id,
            name: member.name,
            role: member.role || 'Searcher',
            linkedin_url: member.linkedin
          });
        }
      }
    }

    // Log the AI execution
    await supabase.from('sf_ai_logs').insert({
      prompt_key: 'enrich_profile',
      input_data: { fund_id, new_url },
      output_data: enrichedProfile,
      tokens_used: aiData.usage?.total_tokens || 0,
      model_used: promptData.model || 'google/gemini-2.5-flash',
      execution_time_ms: 0,
      success: true
    });

    console.log('Profile enriched successfully for fund:', fund.name);

    return new Response(
      JSON.stringify({ 
        success: true, 
        fund_id,
        fund_name: fund.name,
        enriched_profile: enrichedProfile,
        fields_updated: Object.keys(updateData).filter(k => k !== 'updated_at')
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sf-enrich-profile:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
