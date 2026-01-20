import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SlideOutline {
  slide_index: number;
  slide_type: string;
  layout: 'A' | 'B' | 'C';
  purpose: string;
}

interface PresentationInputs {
  company_name?: string;
  sector?: string;
  transaction_type?: string;
  key_highlights?: string[];
  financial_metrics?: {
    revenue?: number;
    ebitda?: number;
    ebitda_margin?: number;
    growth_rate?: number;
    employees?: number;
    years_in_business?: number;
  };
  target_audience?: string;
  geographic_scope?: string;
  competitive_advantages?: string[];
  growth_opportunities?: string[];
  transaction_timeline?: string;
  advisor_name?: string;
  advisor_contact?: string;
  project_code?: string;
  confidentiality_level?: 'standard' | 'high' | 'maximum';
}

interface GeneratedSlide {
  slide_index: number;
  slide_type: string;
  layout: string;
  headline: string;
  subline?: string;
  bullets?: string[];
  stats?: { label: string; value: string }[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { inputs, outline, presentation_type } = await req.json() as {
      inputs: PresentationInputs;
      outline: SlideOutline[];
      presentation_type: string;
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are generating a professional M&A-grade presentation for an investment banking / advisory firm.

STRICT RULES:
- Use ONLY the information provided in the inputs
- Do NOT invent metrics, clients, logos, or claims
- If data is missing, use neutral placeholder language like "[Company Name]", "[XX M€]"
- Tone must be sober, credible, and professional - no marketing hype
- Language: Spanish (Spain) unless inputs suggest otherwise

CONTENT CONSTRAINTS:
- Headline: max 10 words
- Subline: max 15 words (optional, only if needed)
- Bullets: max 12 words each
- Max 5 bullets per slide
- Stats: use actual numbers from inputs, format with € and M/K suffixes

FORMATTING:
- Use proper capitalization (not ALL CAPS)
- Numbers: use European format (1.000.000 €)
- Percentages: use % symbol
- Years: just the number (2024, not "Year 2024")

Return ONLY a valid JSON array with the generated slides.`;

    const userPrompt = `Generate final copy for a ${presentation_type.replace('_', ' ')} presentation.

INPUTS PROVIDED:
${JSON.stringify(inputs, null, 2)}

SLIDE OUTLINE TO FILL:
${JSON.stringify(outline, null, 2)}

Generate the content for each slide. Return a JSON array where each item has:
- slide_index (number)
- slide_type (string)
- layout (string: A, B, or C)
- headline (string, max 10 words)
- subline (string, optional, max 15 words)
- bullets (array of strings, max 5 items, max 12 words each) - include for layouts B and C
- stats (array of {label, value} objects) - include for stats slides

IMPORTANT: Return ONLY the JSON array, no markdown, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3, // Lower temperature for more consistent, professional output
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content received from AI");
    }

    // Parse the JSON response
    let slides: GeneratedSlide[];
    try {
      // Clean up potential markdown code blocks
      let cleanContent = content.trim();
      if (cleanContent.startsWith("```json")) {
        cleanContent = cleanContent.slice(7);
      } else if (cleanContent.startsWith("```")) {
        cleanContent = cleanContent.slice(3);
      }
      if (cleanContent.endsWith("```")) {
        cleanContent = cleanContent.slice(0, -3);
      }
      cleanContent = cleanContent.trim();
      
      slides = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    // Validate and clean up the slides
    const validatedSlides = slides.map((slide, index) => ({
      slide_index: slide.slide_index ?? index,
      slide_type: slide.slide_type || outline[index]?.slide_type || 'custom',
      layout: slide.layout || outline[index]?.layout || 'A',
      headline: (slide.headline || '').slice(0, 100), // Safety limit
      subline: slide.subline ? slide.subline.slice(0, 150) : undefined,
      bullets: Array.isArray(slide.bullets) 
        ? slide.bullets.slice(0, 5).map((b: string) => String(b).slice(0, 100))
        : undefined,
      stats: Array.isArray(slide.stats) 
        ? slide.stats.slice(0, 6).map((s: { label: string; value: string }) => ({
            label: String(s.label || '').slice(0, 50),
            value: String(s.value || '').slice(0, 30)
          }))
        : undefined
    }));

    return new Response(
      JSON.stringify({ 
        success: true, 
        slides: validatedSlides,
        presentation_type,
        generated_at: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("generate-presentation-content error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
