import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const systemPrompt = `Eres un experto en analizar pantallazos de plataformas publicitarias como Meta Ads (Facebook Ads), Google Ads, y LinkedIn Ads.
Tu trabajo es extraer los datos de gasto de campañas en formato JSON estructurado.
Responde SOLO con JSON válido, sin explicaciones adicionales, sin markdown code blocks.

IMPORTANTE - FORMATOS DE GOOGLE ADS:
- Los montos pueden usar "mil" como multiplicador: "3,25 mil €" = 3250 EUR, "1,5 mil €" = 1500 EUR
- Busca "Conversiones" en lugar de "Resultados" (esto indica Google Ads)
- Las fechas pueden estar en formato español: "1 ene 2026", "15 feb 2025"
- Las fechas pueden estar en formato inglés: "Jan 1, 2026", "Feb 15, 2025"
- El layout de Google Ads usa colores rojo/amarillo/verde para métricas principales
- Detecta "google_ads" si ves términos como "Conversiones", "Clics", "CTR" en el estilo típico de Google

IMPORTANTE - FORMATOS DE META ADS:
- Los montos usan formato europeo: "€1.234,56" o "1.234,56 €"
- Busca "Resultados", "Importe gastado", "Amount spent"
- Detecta "meta_ads" si ves el layout típico de Facebook Ads Manager

IMPORTANTE - PARSING DE NÚMEROS:
- "3,25 mil €" → 3250 (multiplica por 1000)
- "12,5K" → 12500
- Formato europeo: "1.234,56" → 1234.56
- Formato americano: "1,234.56" → 1234.56

CAMPOS A EXTRAER:
- channel: "meta_ads" si es Facebook/Instagram/Meta, "google_ads" si es Google Ads, "linkedin_ads" si es LinkedIn
- campaign_name: nombre de la campaña si es visible
- period_start: fecha de inicio del período (YYYY-MM-DD)
- period_end: fecha de fin del período (YYYY-MM-DD)
- amount: gasto total en número (sin símbolos de moneda, convertido de "mil" si aplica)
- currency: "EUR" o "USD"
- impressions: número de impresiones si está visible
- clicks: número de clics si está visible
- ctr: CTR como porcentaje decimal (ej: 13.87 para 13,87%)
- cpc: coste por clic en número
- conversions: número de conversiones (específico para Google Ads)
- cost_per_conversion: coste por conversión si está visible
- confidence: confianza de 0 a 1 en la extracción
- detected_text: resumen breve del texto relevante detectado`;

const userPrompt = `Analiza este pantallazo de una plataforma publicitaria y extrae los datos de gasto.

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
  "conversions": number o null,
  "cost_per_conversion": number o null,
  "confidence": 0.0-1.0,
  "detected_text": "resumen breve del texto relevante detectado"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing campaign screenshot with Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userPrompt
              },
              {
                type: 'image_url',
                image_url: { 
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Límite de solicitudes excedido. Inténtalo de nuevo en unos minutos.' 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (response.status === 402) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: 'Créditos de IA insuficientes. Contacta al administrador.' 
        }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('AI response:', content);

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
