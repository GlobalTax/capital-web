import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RelevanceResult {
  is_relevant: boolean;
  entity_type: string;
  stage: string;
  confidence: number;
  reason: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, title, snippet, page_markdown, query_id } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "url is required" }),
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

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get prompt from database
    const { data: promptData } = await supabase
      .from("sf_ai_prompts")
      .select("system_prompt, user_prompt_template, model, temperature, max_tokens")
      .eq("key", "relevance-filter")
      .single();

    const systemPrompt = promptData?.system_prompt || `Actúa como clasificador de leads para una base de datos de compradores tipo Search Fund/ETA en Europa.

Tarea:
1) Determina si esta página describe (a) un search fund/searcher activo, (b) un programa/operator-led/holding de ETA, o (c) no es relevante.
2) Si NO es relevante, explica por qué (en 1-2 frases).
3) Si SÍ es relevante, clasifica el tipo y la etapa si hay señales.

Reglas:
- No adivines. Si no hay evidencia, usa "unknown".
- No confundas "search fund report/centro académico" con un buyer.
- Considera relevante si hay señales como: "looking to acquire", "acquisition criteria", "investment criteria", "searching for a company", "fondo de búsqueda para adquirir".`;

    const content = page_markdown || snippet || "";
    const userPrompt = `URL: ${url}
Título: ${title || ""}
Snippet: ${snippet || ""}
Contenido (markdown): ${content.substring(0, 8000)}

Devuelve JSON:
{
  "is_relevant": true|false,
  "entity_type": "traditional_search_fund|self_funded_search|operator_led|holding_company|community_or_report|pe_fund|other|unknown",
  "stage": "fundraising|searching|under_offer|acquired|inactive|unknown",
  "confidence": 0-100,
  "reason": "..."
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
        model: promptData?.model || "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: promptData?.temperature || 0.2,
        max_tokens: promptData?.max_tokens || 500,
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

    let result: RelevanceResult;
    try {
      result = JSON.parse(openaiData.choices[0].message.content);
    } catch (e) {
      throw new Error("Failed to parse AI response as JSON");
    }

    // Log the AI execution
    await supabase.from("sf_ai_logs").insert({
      prompt_key: "relevance-filter",
      input_data: { url, title, has_content: !!page_markdown },
      output_data: result,
      tokens_used: tokensUsed,
      duration_ms: duration,
      success: true,
    });

    // Create URL hash for deduplication
    const urlHash = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(url)
    ).then(hash => 
      Array.from(new Uint8Array(hash))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
    );

    // Extract domain
    let domain = "";
    try {
      domain = new URL(url).hostname.replace("www.", "");
    } catch {}

    // Save to sf_scraped_urls
    const { data: scrapedUrl, error: insertError } = await supabase
      .from("sf_scraped_urls")
      .upsert({
        url,
        url_hash: urlHash,
        domain,
        is_relevant: result.is_relevant,
        entity_type: result.entity_type,
        stage: result.stage,
        confidence: result.confidence,
        query_id,
        raw_title: title,
        raw_snippet: snippet,
        raw_content: page_markdown?.substring(0, 50000),
        extraction_status: result.is_relevant ? "pending" : "skipped",
      }, { onConflict: "url_hash" })
      .select("id")
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        result,
        scraped_url_id: scrapedUrl?.id,
        tokens_used: tokensUsed,
        duration_ms: duration,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in sf-relevance-filter:", error);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    await supabase.from("sf_ai_logs").insert({
      prompt_key: "relevance-filter",
      success: false,
      error_message: error.message,
    });

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});