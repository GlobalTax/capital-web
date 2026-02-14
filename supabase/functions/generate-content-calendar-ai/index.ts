import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = "https://fwhqtzkkvnjkazhaficj.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I";

const SYSTEM_PROMPT_IDEAS = `Eres un estratega de contenidos experto en Private Equity y M&A para el mercado español. Trabajas para Capittal, una firma de asesoramiento en valoración y venta de empresas.

Tu objetivo es generar ideas de contenido basadas en inteligencia de mercado PE. Cada idea debe seguir la fórmula:
- DATO CONCRETO del sector + CONTEXTO + IMPLICACIÓN PARA EL EMPRESARIO ESPAÑOL

Para cada idea genera un JSON con esta estructura:
{
  "ideas": [
    {
      "title": "Título atractivo y concreto",
      "channel": "linkedin_company|linkedin_personal|blog|newsletter",
      "content_type": "linkedin_post|carousel|article|newsletter_edition|sector_brief",
      "linkedin_format": "carousel|long_text|infographic|opinion|storytelling|data_highlight" (solo si channel es linkedin_*),
      "target_audience": "sellers|buyers|advisors",
      "priority": "low|medium|high|urgent",
      "category": "Categoría del sector PE",
      "notes": "Brief de 2-3 líneas con el enfoque y dato clave",
      "key_data": "El dato cuantitativo clave a destacar",
      "target_keywords": ["keyword1", "keyword2", "keyword3"],
      "meta_title": "Título SEO (max 60 chars, solo para blog)",
      "meta_description": "Descripción SEO (max 160 chars, solo para blog)"
    }
  ]
}

IMPORTANTE:
- Genera entre 5 y 10 ideas variadas por canal
- Usa datos concretos y verificables del contexto del sector
- Adapta el tono: LinkedIn empresa = profesional con datos; LinkedIn personal = opinión y storytelling; Blog = SEO y autoridad; Newsletter = resumen ejecutivo
- Prioriza temas que atraigan vendedores (empresarios que consideren vender)
- Incluye siempre implicación para España`;

const SYSTEM_PROMPT_DRAFT = `Eres un redactor experto en contenido de Private Equity y M&A para Capittal, firma española de asesoramiento en valoración y venta de empresas.

Redacta contenido de alta calidad según el canal:

**LinkedIn empresa** (fórmula obligatoria):
1. GANCHO (1ª línea): Dato sorprendente o pregunta provocadora
2. CONTEXTO (3-5 líneas): Explicar el "por qué" con datos
3. IMPLICACIÓN LOCAL (2-3 líneas): Conectar con España
4. CTA: Pregunta que invite a comentar o contactar

**LinkedIn personal**:
- Tono más humano y reflexivo
- Anécdotas y opiniones personales
- "Llevo X años en M&A y..."

**Blog** (1.500-2.500 palabras):
1. Titular con dato impactante + keyword SEO
2. Resumen ejecutivo (100 palabras)
3. Contexto del mercado: global → Europa → España
4. Compradores activos: nombres, fondos, operaciones
5. Múltiplos de referencia: tabla con rangos
6. Qué significa para tu empresa
7. CTA: valoración gratuita

**Newsletter** (5 secciones):
1. Dato de la quincena (2-3 frases)
2. Sector en foco (200-300 palabras)
3. Operación destacada (100-150 palabras)
4. Pregunta del mes (100 palabras)
5. CTA (1 frase + botón)

Escribe siempre en español de España. Usa Markdown para formato.`;

const SYSTEM_PROMPT_SEO = `Eres un experto en SEO para contenido de M&A y Private Equity en español. Genera:
- meta_title: máximo 60 caracteres, con keyword principal
- meta_description: máximo 160 caracteres, con CTA
- target_keywords: array de 5-8 keywords relevantes

Devuelve JSON: { "meta_title": "", "meta_description": "", "target_keywords": [] }`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { mode, sector_context, item_data, channel_filter } = await req.json();

    let systemPrompt: string;
    let userPrompt: string;
    let useToolCalling = false;

    if (mode === "generate_ideas") {
      systemPrompt = SYSTEM_PROMPT_IDEAS;
      const sectorInfo = sector_context
        ? `CONTEXTO DEL SECTOR:\n- Sector: ${sector_context.sector}\n- Subsector: ${sector_context.subsector}\n- Vertical: ${sector_context.vertical || 'N/A'}\n- Tesis PE: ${sector_context.pe_thesis || 'N/A'}\n- Datos cuantitativos: ${sector_context.quantitative_data || 'N/A'}\n- Firmas activas: ${sector_context.active_pe_firms || 'N/A'}\n- Múltiplos: ${sector_context.multiples_valuations || 'N/A'}\n- Fase consolidación: ${sector_context.consolidation_phase || 'N/A'}\n- Geografía: ${sector_context.geography || 'N/A'}`
        : "Genera ideas generales sobre Private Equity y M&A en España, cubriendo múltiples sectores.";
      
      const channelInstruction = channel_filter && channel_filter !== 'all'
        ? `Genera ideas SOLO para el canal: ${channel_filter}`
        : "Genera ideas variadas para todos los canales (LinkedIn empresa, LinkedIn personal, Blog, Newsletter)";

      userPrompt = `${sectorInfo}\n\n${channelInstruction}\n\nGenera entre 5 y 10 ideas de contenido de alta calidad.`;
      useToolCalling = true;

    } else if (mode === "generate_draft") {
      systemPrompt = SYSTEM_PROMPT_DRAFT;
      userPrompt = `Redacta un contenido completo para:\n\n- Título: ${item_data.title}\n- Canal: ${item_data.channel}\n- Tipo: ${item_data.content_type}\n- Formato LinkedIn: ${item_data.linkedin_format || 'N/A'}\n- Audiencia: ${item_data.target_audience || 'sellers'}\n- Brief/Notas: ${item_data.notes || 'Sin notas adicionales'}\n- Dato clave: ${item_data.key_data || 'N/A'}\n- Keywords: ${item_data.target_keywords?.join(', ') || 'N/A'}\n- Categoría/Sector: ${item_data.category || 'General'}\n\nRedacta el contenido completo en Markdown.`;

    } else if (mode === "optimize_seo") {
      systemPrompt = SYSTEM_PROMPT_SEO;
      userPrompt = `Optimiza el SEO para este contenido:\n\n- Título: ${item_data.title}\n- Canal: ${item_data.channel || 'blog'}\n- Categoría: ${item_data.category || 'M&A'}\n- Notas: ${item_data.notes || ''}\n- Contenido actual: ${(item_data.ai_generated_content || '').substring(0, 2000)}`;
      useToolCalling = true;

    } else {
      throw new Error(`Modo no válido: ${mode}`);
    }

    const body: any = {
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    };

    if (useToolCalling) {
      if (mode === "generate_ideas") {
        body.tools = [{
          type: "function",
          function: {
            name: "return_content_ideas",
            description: "Return generated content ideas",
            parameters: {
              type: "object",
              properties: {
                ideas: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      title: { type: "string" },
                      channel: { type: "string", enum: ["linkedin_company", "linkedin_personal", "blog", "newsletter"] },
                      content_type: { type: "string" },
                      linkedin_format: { type: "string" },
                      target_audience: { type: "string", enum: ["sellers", "buyers", "advisors"] },
                      priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
                      category: { type: "string" },
                      notes: { type: "string" },
                      key_data: { type: "string" },
                      target_keywords: { type: "array", items: { type: "string" } },
                      meta_title: { type: "string" },
                      meta_description: { type: "string" },
                    },
                    required: ["title", "channel", "content_type", "priority", "category", "notes"],
                    additionalProperties: false,
                  },
                },
              },
              required: ["ideas"],
              additionalProperties: false,
            },
          },
        }];
        body.tool_choice = { type: "function", function: { name: "return_content_ideas" } };
      } else if (mode === "optimize_seo") {
        body.tools = [{
          type: "function",
          function: {
            name: "return_seo_data",
            description: "Return SEO optimization data",
            parameters: {
              type: "object",
              properties: {
                meta_title: { type: "string" },
                meta_description: { type: "string" },
                target_keywords: { type: "array", items: { type: "string" } },
              },
              required: ["meta_title", "meta_description", "target_keywords"],
              additionalProperties: false,
            },
          },
        }];
        body.tool_choice = { type: "function", function: { name: "return_seo_data" } };
      }
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Añade créditos en Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
      throw new Error(`AI gateway error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();

    let result: any;
    if (useToolCalling) {
      const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
      if (toolCall?.function?.arguments) {
        result = JSON.parse(toolCall.function.arguments);
      } else {
        throw new Error("No tool call response from AI");
      }
    } else {
      // Draft mode: return the text content directly
      const content = aiData.choices?.[0]?.message?.content || "";
      result = { content };
    }

    return new Response(JSON.stringify({
      success: true,
      mode,
      result,
      metadata: {
        model: aiData.model || "google/gemini-3-flash-preview",
        usage: aiData.usage,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("generate-content-calendar-ai error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Error desconocido",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
