import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputs, outline, presentation_type } = await req.json();

    const systemPrompt = `You are generating a professional M&A-grade presentation for an investment banking / advisory firm.

STRICT RULES:
- Use ONLY the information provided in the inputs
- Do NOT invent metrics, clients, logos, or claims
- If data is missing, use neutral placeholder language like "[Company Name]", "[XX M€]"
- Tone must be sober, credible, and professional - no marketing hype
- Language: Spanish (Spain) unless inputs suggest otherwise

CONTENT CONSTRAINTS:
- Headline: max 10 words
- Subline: max 15 words (optional)
- Bullets: max 12 words each, max 5 per slide
- Stats: use actual numbers from inputs, format with € and M/K suffixes

Return ONLY a valid JSON array with the generated slides.`;

    const userPrompt = `Generate final copy for a ${presentation_type.replace('_', ' ')} presentation.

INPUTS PROVIDED:
${JSON.stringify(inputs, null, 2)}

SLIDE OUTLINE TO FILL:
${JSON.stringify(outline, null, 2)}

Generate content for each slide. Return JSON array with: slide_index, slide_type, layout, headline, subline (optional), bullets (array, max 5), stats (array of {label, value}).

IMPORTANT: Return ONLY the JSON array.`;

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        { model: "google/gemini-2.5-flash", temperature: 0.3, functionName: 'generate-presentation-content' }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    let slides;
    try {
      slides = parseAIJson(aiResponse.content);
    } catch {
      throw new Error("Failed to parse AI response as JSON");
    }

    const validatedSlides = (Array.isArray(slides) ? slides : []).map((slide: any, index: number) => ({
      slide_index: slide.slide_index ?? index,
      slide_type: slide.slide_type || outline[index]?.slide_type || 'custom',
      layout: slide.layout || outline[index]?.layout || 'A',
      headline: (slide.headline || '').slice(0, 100),
      subline: slide.subline ? slide.subline.slice(0, 150) : undefined,
      bullets: Array.isArray(slide.bullets)
        ? slide.bullets.slice(0, 5).map((b: string) => String(b).slice(0, 100))
        : undefined,
      stats: Array.isArray(slide.stats)
        ? slide.stats.slice(0, 6).map((s: any) => ({ label: String(s.label || '').slice(0, 50), value: String(s.value || '').slice(0, 30) }))
        : undefined
    }));

    return new Response(
      JSON.stringify({ success: true, slides: validatedSlides, presentation_type, generated_at: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-presentation-content error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error", success: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
