import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const SUPPORTED_LANGUAGES: Record<string, string> = {
  'es': 'Spanish (Spain)', 'en': 'English (UK)', 'ca': 'Catalan',
  'fr': 'French', 'de': 'German', 'pt': 'Portuguese (Portugal)', 'it': 'Italian'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { slides, language } = body;
    if (!slides || !Array.isArray(slides)) {
      return new Response(JSON.stringify({ success: false, error: 'slides array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    if (!language || !SUPPORTED_LANGUAGES[language]) {
      return new Response(JSON.stringify({ success: false, error: `Unsupported language. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const targetLanguage = SUPPORTED_LANGUAGES[language];

    const systemPrompt = `You are a professional financial translator specializing in M&A and investment banking documentation.
Translate to ${targetLanguage}. Do NOT change meaning, numbers, or metrics. Keep proper nouns as-is. Use formal business language. Return valid JSON only.`;

    const userPrompt = `Translate these slides to ${targetLanguage}:\n\n${JSON.stringify(slides, null, 2)}\n\nReturn JSON array: slide_index (unchanged), slide_type (unchanged), layout (unchanged), headline (translated), subline (translated if present), bullets (translated if present), stats (labels translated, values unchanged).`;

    console.log(`Translating presentation to ${targetLanguage}...`);

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
        { model: 'google/gemini-2.5-flash', temperature: 0.3, maxTokens: 4000, functionName: 'translate-presentation-content' }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    let translatedSlides;
    try {
      translatedSlides = parseAIJson(aiResponse.content);
    } catch {
      throw new Error('Failed to parse translated content');
    }

    if (!Array.isArray(translatedSlides)) throw new Error('Invalid response structure');

    translatedSlides = translatedSlides.map((slide: any, index: number) => ({
      slide_index: slide.slide_index ?? index,
      slide_type: slide.slide_type || slides[index]?.slide_type || 'content',
      layout: slide.layout || slides[index]?.layout || 'A',
      headline: slide.headline || '',
      ...(slide.subline && { subline: slide.subline }),
      ...(slide.bullets && { bullets: slide.bullets }),
      ...(slide.stats && { stats: slide.stats }),
    }));

    console.log(`Translated ${translatedSlides.length} slides to ${targetLanguage}`);

    return new Response(
      JSON.stringify({ success: true, slides: translatedSlides, target_language: language, target_language_name: targetLanguage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error translating presentation:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Failed to translate' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
