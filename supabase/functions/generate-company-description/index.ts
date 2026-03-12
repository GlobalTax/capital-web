import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Eres un asistente especializado en M&A. A partir del contenido de la web corporativa que te proporciono, genera una descripción de actividad empresarial concisa (máximo 3 frases) que describa claramente a qué se dedica la empresa, qué productos o servicios ofrece y en qué mercados opera. La descripción debe estar optimizada para ser encontrada por búsquedas de keywords. Responde solo con la descripción, sin explicaciones ni formato adicional.`;

function extractVisibleText(html: string): string {
  // Remove script and style tags with their content
  let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
  text = text.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');
  // Remove all HTML tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ').replace(/&\w+;/g, ' ');
  // Collapse whitespace
  text = text.replace(/\s+/g, ' ').trim();
  return text;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || !url.trim()) {
      return new Response(
        JSON.stringify({ error: 'Se requiere una URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Normalize URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // Fetch the website
    let htmlContent: string;
    try {
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CapittalBot/1.0)',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'es,en;q=0.5',
        },
        redirect: 'follow',
      });

      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: `No se ha podido acceder a la web (HTTP ${response.status})` }),
          { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      htmlContent = await response.text();
    } catch (fetchErr) {
      console.error('Fetch error:', fetchErr);
      return new Response(
        JSON.stringify({ error: 'No se ha podido acceder a la web de la empresa' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract visible text and truncate
    const visibleText = extractVisibleText(htmlContent).slice(0, 3000);

    if (visibleText.length < 20) {
      return new Response(
        JSON.stringify({ error: 'No se ha podido extraer contenido útil de la web' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call AI
    const response = await callAI(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: visibleText },
      ],
      { functionName: 'generate-company-description', maxTokens: 300, temperature: 0.3 }
    );

    const description = response.content.trim();

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-company-description:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
