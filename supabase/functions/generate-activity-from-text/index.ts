import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const SYSTEM_PROMPT = `Eres un asistente especializado en M&A. A partir del texto que te proporciono, genera una descripción de actividad empresarial concisa (máximo 3 frases) que describa claramente a qué se dedica la empresa, qué productos o servicios ofrece y en qué mercados opera. La descripción debe estar optimizada para ser encontrada por búsquedas de keywords. Responde solo con la descripción, sin explicaciones ni formato adicional.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, company_name } = await req.json();

    if (!text || !text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Se requiere texto de entrada' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let userPrompt = text.trim();
    if (company_name) {
      userPrompt = `Empresa: ${company_name}\n\nTexto proporcionado:\n${userPrompt}`;
    }

    const response = await callAI(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      { functionName: 'generate-activity-from-text', maxTokens: 300, temperature: 0.3 }
    );

    const description = response.content.trim();

    return new Response(
      JSON.stringify({ description }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-activity-from-text:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
