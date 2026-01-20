import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface SlideContent {
  slide_index: number;
  slide_type: string;
  layout: string;
  headline: string;
  subline?: string;
  bullets?: string[];
  stats?: Array<{ label: string; value: string }>;
}

const SUPPORTED_LANGUAGES: Record<string, string> = {
  'es': 'Spanish (Spain)',
  'en': 'English (UK)',
  'ca': 'Catalan',
  'fr': 'French',
  'de': 'German',
  'pt': 'Portuguese (Portugal)',
  'it': 'Italian'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { slides, language } = body;

    if (!slides || !Array.isArray(slides)) {
      return new Response(
        JSON.stringify({ success: false, error: 'slides array is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!language || !SUPPORTED_LANGUAGES[language]) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Unsupported language. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const targetLanguage = SUPPORTED_LANGUAGES[language];

    const systemPrompt = `You are a professional financial translator specializing in M&A and investment banking documentation.

Your task is to translate presentation slides to ${targetLanguage}.

STRICT TRANSLATION RULES:
1. Do NOT change the meaning of any statement
2. Do NOT modify numbers, percentages, or financial metrics
3. Do NOT alter claims, facts, or scope of statements
4. Do NOT add or remove information
5. Maintain the professional investment banking tone
6. Keep copy length similar to the original
7. Use formal business language appropriate for ${targetLanguage}
8. Preserve all proper nouns and company names as-is
9. Translate technical M&A terms using standard industry terminology

TERMINOLOGY GUIDELINES FOR ${targetLanguage}:
- EBITDA: Keep as "EBITDA" (universal)
- Revenue: Use standard local term
- Due Diligence: Use local equivalent if common, otherwise keep in English
- M&A: Keep as "M&A" or use local equivalent
- Teaser: Keep as "Teaser" or use local term

QUALITY STANDARDS:
- Natural, fluent translation (not literal word-for-word)
- Consistent terminology throughout all slides
- Professional tone suitable for senior executives and investors

You MUST return valid JSON only, maintaining the exact same structure as the input.`;

    const userPrompt = `Translate these presentation slides to ${targetLanguage}:

${JSON.stringify(slides, null, 2)}

Return the translated slides as a JSON array with the exact same structure:
- slide_index (unchanged)
- slide_type (unchanged)
- layout (unchanged)
- headline (translated)
- subline (translated if present)
- bullets (translated if present)
- stats (labels translated, values unchanged)

Return JSON array only, no markdown, no explanation.`;

    console.log(`Translating presentation to ${targetLanguage} with Lovable AI...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI service quota exceeded.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // Parse the JSON response
    let translatedSlides: SlideContent[];
    try {
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      translatedSlides = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse translated content');
    }

    // Validate the response structure
    if (!Array.isArray(translatedSlides)) {
      throw new Error('Invalid response structure: expected array');
    }

    // Ensure slide structure is preserved
    translatedSlides = translatedSlides.map((slide, index) => ({
      slide_index: slide.slide_index ?? index,
      slide_type: slide.slide_type || slides[index]?.slide_type || 'content',
      layout: slide.layout || slides[index]?.layout || 'A',
      headline: slide.headline || '',
      ...(slide.subline && { subline: slide.subline }),
      ...(slide.bullets && { bullets: slide.bullets }),
      ...(slide.stats && { stats: slide.stats }),
    }));

    console.log(`Successfully translated ${translatedSlides.length} slides to ${targetLanguage}`);

    return new Response(
      JSON.stringify({ 
        success: true,
        slides: translatedSlides,
        target_language: language,
        target_language_name: targetLanguage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error translating presentation:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Failed to translate presentation content' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
