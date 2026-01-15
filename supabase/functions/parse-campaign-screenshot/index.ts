import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing campaign screenshot...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Eres un experto en analizar pantallazos de plataformas publicitarias como Meta Ads (Facebook Ads), Google Ads, y LinkedIn Ads.
Tu trabajo es extraer los datos de gasto de campañas en formato JSON estructurado.
Responde SOLO con JSON válido, sin explicaciones adicionales, sin markdown code blocks.

IMPORTANTE:
- Los montos de gasto pueden estar en euros (€) o dólares ($)
- Busca campos como "Amount spent", "Importe gastado", "Cost", "Coste", "Gasto"
- Las fechas pueden estar en varios formatos, conviértelas a YYYY-MM-DD
- Si no puedes determinar un valor con certeza, usa null
- La confianza (confidence) debe reflejar qué tan seguro estás de la extracción (0-1)`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analiza este pantallazo de una plataforma publicitaria y extrae los datos de gasto.

Extrae:
- channel: "meta_ads" si es Facebook/Instagram/Meta, "google_ads" si es Google Ads, "linkedin_ads" si es LinkedIn
- campaign_name: nombre de la campaña si es visible
- period_start: fecha de inicio del período (YYYY-MM-DD)
- period_end: fecha de fin del período (YYYY-MM-DD)
- amount: gasto total en número (sin símbolos de moneda)
- currency: "EUR" o "USD"
- impressions: número de impresiones si está visible
- clicks: número de clics si está visible
- ctr: CTR como porcentaje decimal (ej: 1.5 para 1.5%)
- cpc: coste por clic en número

Responde EXACTAMENTE en este formato JSON:
{
  "channel": "meta_ads|google_ads|linkedin_ads",
  "campaign_name": "string o null",
  "period_start": "YYYY-MM-DD",
  "period_end": "YYYY-MM-DD",
  "amount": number,
  "currency": "EUR|USD",
  "impressions": number o null,
  "clicks": number o null,
  "ctr": number o null,
  "cpc": number o null,
  "confidence": 0.0-1.0,
  "detected_text": "resumen breve del texto relevante detectado"
}`
              },
              {
                type: 'image_url',
                image_url: { 
                  url: imageBase64,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 800,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    console.log('OpenAI response:', content);

    // Parse the JSON response, handling potential markdown code blocks
    let cleanedContent = content.trim();
    if (cleanedContent.startsWith('```json')) {
      cleanedContent = cleanedContent.slice(7);
    } else if (cleanedContent.startsWith('```')) {
      cleanedContent = cleanedContent.slice(3);
    }
    if (cleanedContent.endsWith('```')) {
      cleanedContent = cleanedContent.slice(0, -3);
    }
    cleanedContent = cleanedContent.trim();

    const extractedData = JSON.parse(cleanedContent);

    return new Response(JSON.stringify({ 
      success: true, 
      data: extractedData 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in parse-campaign-screenshot:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
