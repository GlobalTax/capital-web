import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const VALID_CATEGORIES = ["Análisis", "Due Diligence", "Estrategia", "Financiación", "Fiscalidad", "M&A", "Private Equity", "Valoración"];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { raw_content } = await req.json();
    if (!raw_content) return new Response(JSON.stringify({ error: "raw_content required" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const wordCount = raw_content.split(/\s+/).length;
    const reading_time = Math.max(1, Math.ceil(wordCount / 200));

    // Call 1: Extract Metadata with tools
    const metadataResponse = await callAI(
      [
        { role: "system", content: `Experto SEO M&A. Extrae metadatos. Título (1ra línea o genera), slug SEO (sin tildes, guiones), excerpt (150-200 char), categoría (${VALID_CATEGORIES.join(", ")}), tags (5-7), meta título (max 60), meta desc (max 160).` },
        { role: "user", content: `Analiza:\n\n${raw_content.substring(0, 8000)}` }
      ],
      {
        functionName: 'process-blog-quick-create-metadata',
        tools: [{
          type: "function",
          function: {
            name: "process_blog_content",
            parameters: {
              type: "object",
              properties: { title: { type: "string" }, slug: { type: "string" }, excerpt: { type: "string" }, category: { type: "string", enum: VALID_CATEGORIES }, tags: { type: "array", items: { type: "string" } }, meta_title: { type: "string" }, meta_description: { type: "string" } },
              required: ["title", "slug", "excerpt", "category", "tags", "meta_title", "meta_description"], additionalProperties: false
            }
          }
        }],
        tool_choice: { type: "function", function: { name: "process_blog_content" } }
      }
    );

    const toolCall = metadataResponse.toolCalls?.[0];
    if (!toolCall) throw new Error("No tool call in metadata response");
    const metadata = JSON.parse(toolCall.function.arguments);
    const extractedTitle = metadata.title || raw_content.trim().split("\n")[0]?.trim();

    // Call 2: Format content
    const formatResponse = await callAI(
      [
        { role: "system", content: "Editor M&A. Convierte texto en HTML semántico. NO <h1>. Usa <h2>, <h3>, <p>, <ul><li>, <strong>. No CSS ni markdown. DEVUELVE SOLO EL HTML." },
        { role: "user", content: `Título: "${extractedTitle}"\nContenido:\n\n${raw_content}` }
      ],
      { functionName: 'process-blog-quick-create-format', maxTokens: 8000, temperature: 0.3 }
    );

    let formattedContent = formatResponse.content.replace(/^```html?\n?/gm, "").replace(/\n?```$/gm, "").trim();
    const titleRegex = new RegExp(`<h[12]>\\s*${extractedTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*</h[12]>\\n?`, "i");
    formattedContent = formattedContent.replace(titleRegex, "");

    const sanitizeSlug = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").substring(0, 80);

    return new Response(JSON.stringify({
      title: extractedTitle, slug: sanitizeSlug(metadata.slug), excerpt: metadata.excerpt?.substring(0, 250) || "",
      content: formattedContent, category: VALID_CATEGORIES.includes(metadata.category) ? metadata.category : "M&A",
      tags: Array.isArray(metadata.tags) ? metadata.tags.slice(0, 7) : [],
      meta_title: metadata.meta_title?.substring(0, 60) || extractedTitle?.substring(0, 60) || "",
      meta_description: metadata.meta_description?.substring(0, 160) || metadata.excerpt?.substring(0, 160) || "",
      reading_time
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    console.error("process-blog-quick-create error:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});
