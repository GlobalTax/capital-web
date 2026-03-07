import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { callAI, extractToolCallArgs, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";

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
      "linkedin_format": "carousel|long_text|infographic|opinion|storytelling|data_highlight",
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
- Prioriza temas que atraigan vendedores (empresarios que consideren vender)
- Incluye siempre implicación para España`;

const SYSTEM_PROMPT_DRAFT = `Eres un redactor experto en contenido de Private Equity y M&A para Capittal, firma española de asesoramiento en valoración y venta de empresas.

Redacta contenido de alta calidad según el canal:

**LinkedIn empresa**: GANCHO + CONTEXTO + IMPLICACIÓN LOCAL + CTA
**LinkedIn personal**: Tono humano, anécdotas, "Llevo X años en M&A..."
**Blog** (1.500-2.500 palabras): Titular + Resumen + Contexto + Compradores + Múltiplos + Implicación + CTA
**Newsletter** (5 secciones): Dato de la quincena + Sector en foco + Operación destacada + Pregunta del mes + CTA

Escribe siempre en español de España. Usa Markdown.`;

const SYSTEM_PROMPT_SEO = `Eres un experto en SEO para contenido de M&A y Private Equity en español. Genera:
- meta_title: máximo 60 caracteres, con keyword principal
- meta_description: máximo 160 caracteres, con CTA
- target_keywords: array de 5-8 keywords relevantes

Devuelve JSON: { "meta_title": "", "meta_description": "", "target_keywords": [] }`;

const SYSTEM_PROMPT_SMART_PLAN = `Eres un estratega de contenidos experto en Private Equity y M&A para Capittal (España). Recibes IDEAS AMPLIAS del usuario y TÚ las descompones en un plan editorial completo.

TU ROL: Interpretar ideas amplias y descomponerlas en 5-10 piezas de contenido específicas. Crear narrativa coherente. Decidir fechas, canales, formatos y frecuencia autónomamente.

REGLAS: Fecha inicio MAÑANA. LinkedIn empresa máx 3/semana (mar-jue). LinkedIn personal 2-3/semana (lun/mié/vie). Blog 1-2/mes (mar o mié). Newsletter quincenal/mensual (mar o jue). NUNCA más de 1 por canal por día.`;

const SYSTEM_PROMPT_AUTO_SCHEDULE = `Eres un planificador editorial experto. Tu tarea es ASIGNAR FECHAS ÓPTIMAS a contenidos existentes sin fecha.

REGLAS: LinkedIn empresa máx 3/semana mar-jue. LinkedIn personal 2-3/semana lun/mié/vie. Blog 1-2/mes mar o mié. Newsletter quincenal/mensual mar o jue. No solapar canales por día. Respetar items ya programados. Priorizar urgentes al inicio. No programar fines de semana.`;

// Tool definitions
const TOOL_IDEAS = {
  type: 'function' as const,
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
              title: { type: "string" }, channel: { type: "string", enum: ["linkedin_company", "linkedin_personal", "blog", "newsletter"] },
              content_type: { type: "string" }, linkedin_format: { type: "string" },
              target_audience: { type: "string", enum: ["sellers", "buyers", "advisors"] },
              priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
              category: { type: "string" }, notes: { type: "string" }, key_data: { type: "string" },
              target_keywords: { type: "array", items: { type: "string" } },
              meta_title: { type: "string" }, meta_description: { type: "string" },
            },
            required: ["title", "channel", "content_type", "priority", "category", "notes"],
            additionalProperties: false,
          },
        },
      },
      required: ["ideas"], additionalProperties: false,
    },
  },
};

const TOOL_SEO = {
  type: 'function' as const,
  function: {
    name: "return_seo_data",
    description: "Return SEO optimization data",
    parameters: {
      type: "object",
      properties: {
        meta_title: { type: "string" }, meta_description: { type: "string" },
        target_keywords: { type: "array", items: { type: "string" } },
      },
      required: ["meta_title", "meta_description", "target_keywords"], additionalProperties: false,
    },
  },
};

const TOOL_PLAN = {
  type: 'function' as const,
  function: {
    name: "return_editorial_plan",
    description: "Return the complete editorial plan with scheduled dates",
    parameters: {
      type: "object",
      properties: {
        plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title: { type: "string" }, channel: { type: "string", enum: ["linkedin_company", "linkedin_personal", "blog", "newsletter"] },
              content_type: { type: "string", enum: ["linkedin_post", "carousel", "article", "newsletter_edition", "sector_brief"] },
              linkedin_format: { type: "string", enum: ["carousel", "long_text", "infographic", "opinion", "storytelling", "data_highlight"] },
              target_audience: { type: "string", enum: ["sellers", "buyers", "advisors"] },
              priority: { type: "string", enum: ["low", "medium", "high", "urgent"] },
              category: { type: "string" }, notes: { type: "string" }, key_data: { type: "string" },
              target_keywords: { type: "array", items: { type: "string" } },
              scheduled_date: { type: "string", description: "YYYY-MM-DD format" },
            },
            required: ["title", "channel", "content_type", "priority", "category", "notes", "scheduled_date"],
            additionalProperties: false,
          },
        },
      },
      required: ["plan"], additionalProperties: false,
    },
  },
};

const TOOL_SCHEDULE = {
  type: 'function' as const,
  function: {
    name: "return_schedule",
    description: "Return the scheduled dates for each item",
    parameters: {
      type: "object",
      properties: {
        schedule: {
          type: "array",
          items: {
            type: "object",
            properties: {
              item_id: { type: "string", description: "The original item ID" },
              scheduled_date: { type: "string", description: "YYYY-MM-DD format" },
            },
            required: ["item_id", "scheduled_date"], additionalProperties: false,
          },
        },
      },
      required: ["schedule"], additionalProperties: false,
    },
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No autorizado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseAuth = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Token inválido o expirado" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { mode, sector_context, item_data, channel_filter, topics, idea, start_date, frequency, preferred_channels, items_to_schedule, already_scheduled, end_date } = await req.json();

    let systemPrompt: string;
    let userPrompt: string;
    let tools: any[] | undefined;
    let tool_choice: any | undefined;

    if (mode === "generate_ideas") {
      systemPrompt = SYSTEM_PROMPT_IDEAS;
      const sectorInfo = sector_context
        ? `CONTEXTO DEL SECTOR:\n- Sector: ${sector_context.sector}\n- Subsector: ${sector_context.subsector}\n- Vertical: ${sector_context.vertical || 'N/A'}\n- Tesis PE: ${sector_context.pe_thesis || 'N/A'}\n- Datos: ${sector_context.quantitative_data || 'N/A'}\n- Firmas activas: ${sector_context.active_pe_firms || 'N/A'}\n- Múltiplos: ${sector_context.multiples_valuations || 'N/A'}\n- Consolidación: ${sector_context.consolidation_phase || 'N/A'}\n- Geografía: ${sector_context.geography || 'N/A'}`
        : "Genera ideas generales sobre Private Equity y M&A en España.";
      const channelInstruction = channel_filter && channel_filter !== 'all'
        ? `Genera ideas SOLO para el canal: ${channel_filter}`
        : "Genera ideas variadas para todos los canales";
      userPrompt = `${sectorInfo}\n\n${channelInstruction}\n\nGenera entre 5 y 10 ideas de contenido.`;
      tools = [TOOL_IDEAS];
      tool_choice = { type: "function", function: { name: "return_content_ideas" } };

    } else if (mode === "generate_draft") {
      systemPrompt = SYSTEM_PROMPT_DRAFT;
      userPrompt = `Redacta contenido completo para:\n- Título: ${item_data.title}\n- Canal: ${item_data.channel}\n- Tipo: ${item_data.content_type}\n- Formato LinkedIn: ${item_data.linkedin_format || 'N/A'}\n- Audiencia: ${item_data.target_audience || 'sellers'}\n- Brief: ${item_data.notes || 'Sin notas'}\n- Dato clave: ${item_data.key_data || 'N/A'}\n- Keywords: ${item_data.target_keywords?.join(', ') || 'N/A'}\n- Categoría: ${item_data.category || 'General'}\n\nRedacta en Markdown.`;

    } else if (mode === "optimize_seo") {
      systemPrompt = SYSTEM_PROMPT_SEO;
      userPrompt = `Optimiza SEO:\n- Título: ${item_data.title}\n- Canal: ${item_data.channel || 'blog'}\n- Categoría: ${item_data.category || 'M&A'}\n- Notas: ${item_data.notes || ''}\n- Contenido: ${(item_data.ai_generated_content || '').substring(0, 2000)}`;
      tools = [TOOL_SEO];
      tool_choice = { type: "function", function: { name: "return_seo_data" } };

    } else if (mode === "smart_plan") {
      const userIdea = idea || (topics && Array.isArray(topics) ? topics.join('\n') : null);
      if (!userIdea) throw new Error("Se requiere al menos una idea o tema");
      systemPrompt = SYSTEM_PROMPT_SMART_PLAN;
      const today = new Date().toISOString().split('T')[0];
      userPrompt = `FECHA ACTUAL: ${today}\n\nIDEAS DEL USUARIO:\n${userIdea}\n\nDescompón en piezas de contenido concretas con plan editorial completo.`;
      tools = [TOOL_PLAN];
      tool_choice = { type: "function", function: { name: "return_editorial_plan" } };

    } else if (mode === "auto_schedule") {
      if (!items_to_schedule || !Array.isArray(items_to_schedule) || items_to_schedule.length === 0) {
        throw new Error("No hay items para programar");
      }
      systemPrompt = SYSTEM_PROMPT_AUTO_SCHEDULE;
      const today = new Date().toISOString().split('T')[0];
      const itemsList = items_to_schedule.map((it: any, idx: number) =>
        `${idx + 1}. [ID: ${it.id}] "${it.title}" | Canal: ${it.channel} | Tipo: ${it.content_type} | Prioridad: ${it.priority} | Categoría: ${it.category || 'N/A'}`
      ).join('\n');
      const scheduledList = (already_scheduled || []).map((it: any) =>
        `- ${it.scheduled_date} | Canal: ${it.channel}`
      ).join('\n') || 'Ninguno';
      userPrompt = `FECHA ACTUAL: ${today}\nRANGO: ${start_date || today} a ${end_date || 'sin límite'}\n\nYA PROGRAMADOS:\n${scheduledList}\n\nITEMS A PROGRAMAR (${items_to_schedule.length}):\n${itemsList}`;
      tools = [TOOL_SCHEDULE];
      tool_choice = { type: "function", function: { name: "return_schedule" } };

    } else {
      throw new Error(`Modo no válido: ${mode}`);
    }

    let aiResponse;
    try {
      aiResponse = await callAI(
        [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        {
          model: "google/gemini-2.5-flash",
          tools: tools as any,
          tool_choice,
          functionName: 'generate-content-calendar-ai',
        }
      );
    } catch (error) {
      return aiErrorResponse(error, corsHeaders);
    }

    let result: any;
    if (tools) {
      result = extractToolCallArgs(aiResponse);
      if (!result) throw new Error("No tool call response from AI");

      if (mode === "generate_ideas" && !Array.isArray(result?.ideas)) result = { ideas: [] };
      if (mode === "smart_plan" && !Array.isArray(result?.plan)) result = { plan: [] };
      if (mode === "optimize_seo") {
        result = {
          meta_title: result?.meta_title || "",
          meta_description: result?.meta_description || "",
          target_keywords: Array.isArray(result?.target_keywords) ? result.target_keywords : [],
        };
      }
      if (mode === "auto_schedule" && !Array.isArray(result?.schedule)) result = { schedule: [] };
    } else {
      result = { content: aiResponse.content };
    }

    return new Response(JSON.stringify({
      success: true, mode, result,
      metadata: { model: aiResponse.model, usage: { total_tokens: aiResponse.tokensUsed } },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (e) {
    console.error("generate-content-calendar-ai error:", e);
    return new Response(JSON.stringify({
      error: e instanceof Error ? e.message : "Error desconocido",
    }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
