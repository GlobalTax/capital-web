import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExtractedProfile {
  name: string | null;
  entity_type: string;
  website: string | null;
  based_in: { country: string | null; city: string | null };
  geo_focus: string[];
  industry_focus: string[];
  stage: string;
  transaction_preferences: {
    majority: boolean | null;
    full_buyout: boolean | null;
    minority: boolean | null;
    succession: boolean | null;
    carve_out: boolean | null;
  };
  size_criteria: {
    metric: string;
    min: number | null;
    max: number | null;
    currency: string;
    notes: string | null;
  };
  keywords: string[];
  team: Array<{ name: string; role: string | null; linkedin: string | null }>;
  backers_or_affiliations: Array<{ name: string; type: string }>;
  contact: {
    emails: string[];
    contact_forms: string[];
    linkedin: string | null;
  };
  evidence: Array<{ field: string; quote: string; url: string }>;
  data_quality: {
    is_homepage_only: boolean;
    missing_critical_fields: string[];
    notes: string | null;
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, page_markdown, scraped_url_id } = await req.json();

    if (!url || !page_markdown) {
      return new Response(
        JSON.stringify({ error: "url and page_markdown are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return new Response(
        JSON.stringify({ error: "OPENAI_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get prompt from database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: promptData } = await supabase
      .from("sf_ai_prompts")
      .select("system_prompt, user_prompt_template, model, temperature, max_tokens")
      .eq("key", "extract-profile")
      .single();

    const systemPrompt = promptData?.system_prompt || `Eres un extractor de datos para un CRM de compradores (Search Funds / Searchers / ETA) en España y Europa.`;
    
    const userPrompt = `URL: ${url}
Contenido (markdown): ${page_markdown.substring(0, 15000)}

Devuelve JSON EXACTAMENTE con este esquema:
{
  "name": string|null,
  "entity_type": "traditional_search_fund|self_funded_search|operator_led|holding_company|unknown",
  "website": string|null,
  "based_in": {"country": string|null, "city": string|null},
  "geo_focus": [string],
  "industry_focus": [string],
  "stage": "fundraising|searching|under_offer|acquired|inactive|unknown",
  "transaction_preferences": {
    "majority": boolean|null,
    "full_buyout": boolean|null,
    "minority": boolean|null,
    "succession": boolean|null,
    "carve_out": boolean|null
  },
  "size_criteria": {
    "metric": "EV|EBITDA|Revenue|Employees|unknown",
    "min": number|null,
    "max": number|null,
    "currency": "EUR|GBP|USD|unknown",
    "notes": string|null
  },
  "keywords": [string],
  "team": [{"name": string, "role": string|null, "linkedin": string|null}],
  "backers_or_affiliations": [{"name": string, "type": "investor|school|accelerator|partner|unknown"}],
  "contact": {"emails": [string], "contact_forms": [string], "linkedin": string|null},
  "evidence": [{"field": string, "quote": string, "url": string}],
  "data_quality": {"is_homepage_only": boolean, "missing_critical_fields": [string], "notes": string|null}
}`;

    const startTime = Date.now();

    // Call OpenAI
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: promptData?.model || "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: promptData?.temperature || 0.2,
        max_tokens: promptData?.max_tokens || 3000,
        response_format: { type: "json_object" },
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error("OpenAI error:", error);
      throw new Error(`OpenAI API error: ${openaiResponse.status}`);
    }

    const openaiData = await openaiResponse.json();
    const duration = Date.now() - startTime;
    const tokensUsed = openaiData.usage?.total_tokens || 0;

    let extractedProfile: ExtractedProfile;
    try {
      extractedProfile = JSON.parse(openaiData.choices[0].message.content);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Log the AI execution
    await supabase.from("sf_ai_logs").insert({
      prompt_key: "extract-profile",
      input_data: { url, content_length: page_markdown.length },
      output_data: extractedProfile,
      tokens_used: tokensUsed,
      duration_ms: duration,
      success: true,
    });

    // If scraped_url_id provided, update the scraped URL record
    if (scraped_url_id) {
      await supabase
        .from("sf_scraped_urls")
        .update({
          extraction_status: "completed",
          extracted_at: new Date().toISOString(),
        })
        .eq("id", scraped_url_id);
    }

    // Optionally create/update the fund in sf_funds
    let fundId = null;
    if (extractedProfile.name) {
      // Check if fund already exists by website or name
      const { data: existingFund } = await supabase
        .from("sf_funds")
        .select("id")
        .or(`website.eq.${extractedProfile.website},name.ilike.${extractedProfile.name}`)
        .maybeSingle();

      if (existingFund) {
        // Update existing fund
        fundId = existingFund.id;
        await supabase
          .from("sf_funds")
          .update({
            entity_type: extractedProfile.entity_type,
            website: extractedProfile.website || url,
            country_base: extractedProfile.based_in?.country,
            city_base: extractedProfile.based_in?.city,
            geo_focus: extractedProfile.geo_focus,
            sector_focus: extractedProfile.industry_focus,
            status: mapStageToStatus(extractedProfile.stage),
            transaction_preferences: extractedProfile.transaction_preferences,
            size_criteria: extractedProfile.size_criteria,
            data_quality: extractedProfile.data_quality,
            last_scraped_at: new Date().toISOString(),
            scrape_source_urls: [url],
            updated_at: new Date().toISOString(),
          })
          .eq("id", fundId);
      } else {
        // Create new fund
        const { data: newFund } = await supabase
          .from("sf_funds")
          .insert({
            name: extractedProfile.name,
            entity_type: extractedProfile.entity_type,
            website: extractedProfile.website || url,
            country_base: extractedProfile.based_in?.country,
            city_base: extractedProfile.based_in?.city,
            geo_focus: extractedProfile.geo_focus,
            sector_focus: extractedProfile.industry_focus,
            status: mapStageToStatus(extractedProfile.stage),
            transaction_preferences: extractedProfile.transaction_preferences,
            size_criteria: extractedProfile.size_criteria,
            data_quality: extractedProfile.data_quality,
            last_scraped_at: new Date().toISOString(),
            scrape_source_urls: [url],
          })
          .select("id")
          .single();

        fundId = newFund?.id;
      }

      // Create team members as sf_people
      if (fundId && extractedProfile.team?.length > 0) {
        for (const member of extractedProfile.team) {
          await supabase
            .from("sf_people")
            .upsert({
              fund_id: fundId,
              name: member.name,
              role: member.role as any || "other",
              linkedin_url: member.linkedin,
            }, { onConflict: "fund_id,name" })
            .select();
        }
      }

      // Create backers as sf_fund_backers
      if (fundId && extractedProfile.backers_or_affiliations?.length > 0) {
        for (const backer of extractedProfile.backers_or_affiliations) {
          // First ensure backer exists
          const { data: existingBacker } = await supabase
            .from("sf_backers")
            .select("id")
            .eq("name", backer.name)
            .maybeSingle();

          let backerId = existingBacker?.id;
          if (!backerId) {
            const { data: newBacker } = await supabase
              .from("sf_backers")
              .insert({
                name: backer.name,
                type: mapBackerType(backer.type),
              })
              .select("id")
              .single();
            backerId = newBacker?.id;
          }

          if (backerId) {
            await supabase
              .from("sf_fund_backers")
              .upsert({
                fund_id: fundId,
                backer_id: backerId,
              }, { onConflict: "fund_id,backer_id" });
          }
        }
      }

      // Update scraped_url with fund_id
      if (scraped_url_id && fundId) {
        await supabase
          .from("sf_scraped_urls")
          .update({ fund_id: fundId })
          .eq("id", scraped_url_id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        profile: extractedProfile,
        fund_id: fundId,
        tokens_used: tokensUsed,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sf-extract-profile:", error);
    
    // Log error
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase.from("sf_ai_logs").insert({
      prompt_key: "extract-profile",
      success: false,
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function mapStageToStatus(stage: string): string {
  const mapping: Record<string, string> = {
    fundraising: "fundraising",
    searching: "searching",
    under_offer: "under_loi",
    acquired: "acquired",
    inactive: "inactive",
  };
  return mapping[stage] || "searching";
}

function mapBackerType(type: string): string {
  const mapping: Record<string, string> = {
    investor: "fund",
    school: "school",
    accelerator: "accelerator",
    partner: "other",
    unknown: "other",
  };
  return mapping[type] || "other";
}