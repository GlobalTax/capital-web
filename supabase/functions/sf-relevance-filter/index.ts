import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { url, title, snippet, page_markdown, query_id } = await req.json();
    if (!url) return new Response(JSON.stringify({ error: "url is required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: promptData } = await supabase.from("sf_ai_prompts").select("system_prompt, model, temperature, max_tokens").eq("key", "relevance-filter").single();

    const systemPrompt = promptData?.system_prompt || `Clasificador de leads Search Fund/ETA. Determina relevancia. Responde JSON: {"is_relevant","entity_type","stage","confidence","reason"}`;
    const content = page_markdown || snippet || "";

    const response = await callAI(
      [{ role: "system", content: systemPrompt }, { role: "user", content: `URL: ${url}\nTítulo: ${title || ""}\nSnippet: ${snippet || ""}\nContenido: ${content.substring(0, 8000)}` }],
      { functionName: 'sf-relevance-filter', preferOpenAI: true, temperature: promptData?.temperature || 0.2, maxTokens: promptData?.max_tokens || 500, jsonMode: true }
    );

    const result = parseAIJson<any>(response.content);

    await supabase.from("sf_ai_logs").insert({ prompt_key: "relevance-filter", input_data: { url, title, has_content: !!page_markdown }, output_data: result, tokens_used: response.tokensUsed, duration_ms: response.durationMs, success: true });

    const urlHash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(url)).then(h => Array.from(new Uint8Array(h)).map(b => b.toString(16).padStart(2, "0")).join(""));
    let domain = ""; try { domain = new URL(url).hostname.replace("www.", ""); } catch {}

    const { data: scrapedUrl } = await supabase.from("sf_scraped_urls").upsert({
      url, url_hash: urlHash, domain, is_relevant: result.is_relevant, entity_type: result.entity_type,
      stage: result.stage, confidence: result.confidence, query_id, raw_title: title, raw_snippet: snippet,
      raw_content: page_markdown?.substring(0, 50000), extraction_status: result.is_relevant ? "pending" : "skipped",
    }, { onConflict: "url_hash" }).select("id").single();

    return new Response(JSON.stringify({ success: true, result, scraped_url_id: scrapedUrl?.id, tokens_used: response.tokensUsed, duration_ms: response.durationMs }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error: any) {
    console.error("Error in sf-relevance-filter:", error);
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    await supabase.from("sf_ai_logs").insert({ prompt_key: "relevance-filter", success: false, error_message: error.message });
    return aiErrorResponse(error, corsHeaders);
  }
});
