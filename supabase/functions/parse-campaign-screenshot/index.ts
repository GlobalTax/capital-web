import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `Eres un experto en analizar pantallazos de plataformas publicitarias como Meta Ads, Google Ads, y LinkedIn Ads.
Tu trabajo es extraer los datos de gasto de campañas en formato JSON estructurado.
Responde SOLO con JSON válido, sin explicaciones adicionales, sin markdown code blocks.

IMPORTANTE - PARSING DE NÚMEROS:
- "3,25 mil €" → 3250 (multiplica por 1000)
- Formato europeo: "1.234,56" → 1234.56

CAMPOS A EXTRAER:
- channel: "meta_ads" | "google_ads" | "linkedin_ads"
- campaign_name, period_start (YYYY-MM-DD), period_end (YYYY-MM-DD)
- amount (número), currency ("EUR"|"USD")
- impressions, clicks, ctr, cpc, conversions, cost_per_conversion
- confidence (0-1), detected_text (resumen breve)`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) throw new Error('No image provided');

    const response = await callAI(
      [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Analiza este pantallazo de una plataforma publicitaria y extrae los datos de gasto.' },
            { type: 'image_url', image_url: { url: imageBase64 } }
          ]
        }
      ],
      { functionName: 'parse-campaign-screenshot', maxTokens: 1000, temperature: 0.1 }
    );

    const extractedData = parseAIJson(response.content);

    return new Response(JSON.stringify({ success: true, data: extractedData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-campaign-screenshot:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
