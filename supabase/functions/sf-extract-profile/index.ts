import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, page_markdown, scraped_url_id } = await req.json();
    if (!url || !page_markdown) return new Response(JSON.stringify({ error: "url and page_markdown required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: promptData } = await supabase.from("sf_ai_prompts").select("system_prompt, model, temperature, max_tokens").eq("key", "extract-profile").single();

    const systemPrompt = promptData?.system_prompt || `Extractor de datos para CRM de Search Funds/ETA en España y Europa.`;

    const response = await callAI(
      [{ role: "system", content: systemPrompt }, { role: "user", content: `URL: ${url}\nContenido: ${page_markdown.substring(0, 15000)}\n\nDevuelve JSON con: name, entity_type, website, based_in, geo_focus, industry_focus, stage, transaction_preferences, size_criteria, keywords, team, backers_or_affiliations, contact, evidence, data_quality` }],
      { functionName: 'sf-extract-profile', preferOpenAI: true, temperature: promptData?.temperature || 0.2, maxTokens: promptData?.max_tokens || 3000, jsonMode: true }
    );

    const extractedProfile = parseAIJson<any>(response.content);

    await supabase.from("sf_ai_logs").insert({ prompt_key: "extract-profile", input_data: { url, content_length: page_markdown.length }, output_data: extractedProfile, tokens_used: response.tokensUsed, duration_ms: response.durationMs, success: true });

    if (scraped_url_id) await supabase.from("sf_scraped_urls").update({ extraction_status: "completed", extracted_at: new Date().toISOString() }).eq("id", scraped_url_id);

    // Create/update fund
    let fundId = null;
    if (extractedProfile.name) {
      const { data: existingFund } = await supabase.from("sf_funds").select("id").or(`website.eq.${extractedProfile.website},name.ilike.${extractedProfile.name}`).maybeSingle();
      const fundData = {
        entity_type: extractedProfile.entity_type, website: extractedProfile.website || url,
        country_base: extractedProfile.based_in?.country, city_base: extractedProfile.based_in?.city,
        geo_focus: extractedProfile.geo_focus, sector_focus: extractedProfile.industry_focus,
        status: { fundraising: "fundraising", searching: "searching", under_offer: "under_loi", acquired: "acquired", inactive: "inactive" }[extractedProfile.stage] || "searching",
        transaction_preferences: extractedProfile.transaction_preferences, size_criteria: extractedProfile.size_criteria,
        data_quality: extractedProfile.data_quality, last_scraped_at: new Date().toISOString(), scrape_source_urls: [url], updated_at: new Date().toISOString(),
      };

      if (existingFund) {
        fundId = existingFund.id;
        await supabase.from("sf_funds").update(fundData).eq("id", fundId);
      } else {
        const { data: newFund } = await supabase.from("sf_funds").insert({ name: extractedProfile.name, ...fundData }).select("id").single();
        fundId = newFund?.id;
      }

      if (fundId && extractedProfile.team?.length > 0) {
        for (const member of extractedProfile.team) {
          await supabase.from("sf_people").upsert({ fund_id: fundId, name: member.name, role: member.role || "other", linkedin_url: member.linkedin }, { onConflict: "fund_id,name" });
        }
      }
      if (fundId && extractedProfile.backers_or_affiliations?.length > 0) {
        for (const backer of extractedProfile.backers_or_affiliations) {
          const { data: existing } = await supabase.from("sf_backers").select("id").eq("name", backer.name).maybeSingle();
          let backerId = existing?.id;
          if (!backerId) { const { data: n } = await supabase.from("sf_backers").insert({ name: backer.name, type: { investor: "fund", school: "school", accelerator: "accelerator" }[backer.type] || "other" }).select("id").single(); backerId = n?.id; }
          if (backerId) await supabase.from("sf_fund_backers").upsert({ fund_id: fundId, backer_id: backerId }, { onConflict: "fund_id,backer_id" });
        }
      }
      if (scraped_url_id && fundId) await supabase.from("sf_scraped_urls").update({ fund_id: fundId }).eq("id", scraped_url_id);
    }

    return new Response(JSON.stringify({ success: true, profile: extractedProfile, fund_id: fundId, tokens_used: response.tokensUsed, duration_ms: response.durationMs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error in sf-extract-profile:", error);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await supabase.from("sf_ai_logs").insert({ prompt_key: "extract-profile", success: false, error_message: error.message });
    return aiErrorResponse(error, corsHeaders);
  }
});
