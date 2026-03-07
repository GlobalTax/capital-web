import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const { slides } = await req.json();
    if (!slides || !Array.isArray(slides)) throw new Error('slides array is required');

    const systemPrompt = `You are a senior investment banking editor with 20+ years of experience at top-tier firms.

EDITING GUIDELINES:
1. Remove ALL marketing language - no superlatives, no hype
2. Increase clarity and precision
3. Reduce text density
4. Improve terminology consistency
5. Maintain calm, confident tone

STRICT RULES:
- Do NOT add new facts or information
- Do NOT modify numbers, percentages, or metrics
- Preserve all specific data points exactly
- Headlines: max 10 words
- Bullets: max 12 words each
- Avoid adjectives like "exceptional", "outstanding", "unique"

Return valid JSON only.`;

    const userPrompt = `Refine these presentation slides:\n\n${JSON.stringify(slides, null, 2)}\n\nReturn JSON array with: slide_index, slide_type, layout, headline, subline, bullets, stats.`;

    console.log('Refining presentation content...');

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        { model: 'google/gemini-2.5-flash', temperature: 0.3, maxTokens: 4000, functionName: 'refine-presentation-content' }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    let refinedSlides;
    try {
      refinedSlides = parseAIJson(aiResponse.content);
    } catch {
      throw new Error('Failed to parse refined content');
    }

    if (!Array.isArray(refinedSlides)) throw new Error('Invalid response structure: expected array');

    refinedSlides = refinedSlides.map((slide: any, index: number) => ({
      slide_index: slide.slide_index ?? index,
      slide_type: slide.slide_type || 'content',
      layout: slide.layout || 'A',
      headline: slide.headline || '',
      ...(slide.subline && { subline: slide.subline }),
      ...(slide.bullets && { bullets: slide.bullets }),
      ...(slide.stats && { stats: slide.stats }),
    }));

    console.log(`Refined ${refinedSlides.length} slides`);

    return new Response(
      JSON.stringify({ success: true, slides: refinedSlides }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error refining presentation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to refine' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
