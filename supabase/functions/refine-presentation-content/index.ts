import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { slides } = await req.json();

    if (!slides || !Array.isArray(slides)) {
      throw new Error('slides array is required');
    }

    const systemPrompt = `You are a senior investment banking editor with 20+ years of experience at top-tier firms.

Your task is to refine presentation slides to meet the highest standards of professional M&A communications.

EDITING GUIDELINES:
1. Remove ALL marketing language - no superlatives, no hype, no promotional tone
2. Increase clarity and precision - every word must earn its place
3. Reduce text density - if it can be said in fewer words, do it
4. Improve consistency of terminology - use the same terms throughout
5. Maintain a calm, confident tone - understated authority, never boastful

STRICT RULES:
- Do NOT add new facts or information
- Do NOT modify any numbers, percentages, or metrics
- Do NOT change the scope or meaning of statements
- Do NOT invent new claims or benefits
- Preserve all specific data points exactly as provided

STYLE REQUIREMENTS:
- Headlines: Maximum 10 words, impactful but sober
- Bullets: Maximum 12 words each, start with action verbs when possible
- Avoid adjectives like "exceptional", "outstanding", "unique", "best-in-class"
- Replace vague claims with neutral, factual language
- Use active voice whenever possible

You MUST return valid JSON only, no additional text or explanation.`;

    const userPrompt = `Refine these presentation slides according to the editorial guidelines:

${JSON.stringify(slides, null, 2)}

Return the refined slides as a JSON array with the exact same structure:
- slide_index
- slide_type
- layout
- headline
- subline (if present)
- bullets (if present)
- stats (if present)

Return JSON array only, no markdown, no explanation.`;

    console.log('Refining presentation content with Lovable AI...');

    const response = await fetch('https://api.lovable.dev/v1/chat/completions', {
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
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      }
      if (response.status === 402) {
        throw new Error('AI service quota exceeded.');
      }
      throw new Error(`AI service error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from AI');
    }

    // Parse the JSON response
    let refinedSlides: SlideContent[];
    try {
      // Clean up potential markdown formatting
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      refinedSlides = JSON.parse(cleanedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Failed to parse refined content');
    }

    // Validate the response structure
    if (!Array.isArray(refinedSlides)) {
      throw new Error('Invalid response structure: expected array');
    }

    // Ensure all required fields are present
    refinedSlides = refinedSlides.map((slide, index) => ({
      slide_index: slide.slide_index ?? index,
      slide_type: slide.slide_type || 'content',
      layout: slide.layout || 'A',
      headline: slide.headline || '',
      ...(slide.subline && { subline: slide.subline }),
      ...(slide.bullets && { bullets: slide.bullets }),
      ...(slide.stats && { stats: slide.stats }),
    }));

    console.log(`Successfully refined ${refinedSlides.length} slides`);

    return new Response(
      JSON.stringify({ 
        success: true,
        slides: refinedSlides 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error refining presentation:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to refine presentation content' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
