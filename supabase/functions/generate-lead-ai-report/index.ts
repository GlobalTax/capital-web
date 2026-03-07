import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { callAI, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function fetchLeadData(leadId: string, leadType: string, supabase: any) {
  const tableMap: Record<string, string> = { valuation: 'company_valuations', contact: 'contact_leads', collaborator: 'collaborator_applications' };
  const table = tableMap[leadType];
  if (!table) throw new Error(`Tipo de lead no soportado: ${leadType}`);
  const { data, error } = await supabase.from(table).select('*').eq('id', leadId).single();
  if (error) throw error;
  if (!data) throw new Error('Lead no encontrado');
  return data;
}

function buildValuationPrompt(leadData: any): string {
  return `DATOS DEL LEAD:\\n- Empresa: ${leadData.company_name || 'N/A'}, Sector: ${leadData.industry || 'N/A'}, Facturación: ${leadData.revenue ? `${(leadData.revenue / 1000000).toFixed(1)}M€` : 'N/A'}, EBITDA: ${leadData.ebitda ? `${(leadData.ebitda / 1000000).toFixed(1)}M€` : 'N/A'}, Empleados: ${leadData.employee_range || 'N/A'}\\n- Contacto: ${leadData.contact_name || 'N/A'}, Email: ${leadData.email || 'N/A'}\\n\\nPrepara LLAMADA COMERCIAL con: 1) Resumen sector 2) Perfil dueño 3) Dolores clave 4) Argumentos valor Capittal 5) Preguntas para la llamada 6) Objeciones y respuestas 7) Jerga del sector`;
}

function buildContactPrompt(leadData: any): string {
  return `CONTACTO: ${leadData.full_name}, Email: ${leadData.email}, Empresa: ${leadData.company || 'N/A'}, Mensaje: ${leadData.message || 'Sin mensaje'}, Origen: ${leadData.utm_source || 'Directo'}\\n\\nGenera BRIEF ESTRATÉGICO: 1) Perfil rápido 2) Contexto llamada 3) Preguntas cualificación 4) Propuesta valor 5) Red flags 6) Siguiente paso`;
}

function buildCollaboratorPrompt(leadData: any): string {
  return `CANDIDATO: ${leadData.full_name}, Profesión: ${leadData.profession || 'N/A'}, Motivación: ${leadData.motivation || 'N/A'}\\n\\nGenera ANÁLISIS CANDIDATO: 1) Perfil y fit 2) Experiencia 3) Motivación 4) Preguntas entrevista 5) Encaje red 6) Recomendación`;
}

function buildPromptForLeadType(leadData: any, leadType: string): string {
  if (leadType === 'valuation') {
    return `DATOS DEL LEAD:\\n- Empresa: ${leadData.company_name || 'N/A'}, Sector: ${leadData.industry || 'N/A'}, Facturación: ${leadData.revenue ? `${(leadData.revenue / 1000000).toFixed(1)}M€` : 'N/A'}, EBITDA: ${leadData.ebitda ? `${(leadData.ebitda / 1000000).toFixed(1)}M€` : 'N/A'}, Empleados: ${leadData.employee_range || 'N/A'}\\n- Contacto: ${leadData.contact_name || 'N/A'}, Email: ${leadData.email || 'N/A'}\\n\\nPrepara LLAMADA COMERCIAL con: 1) Resumen sector 2) Perfil dueño 3) Dolores clave 4) Argumentos valor Capittal 5) Preguntas para la llamada 6) Objeciones y respuestas 7) Jerga del sector`;
  }
  if (leadType === 'contact') {
    return `CONTACTO: ${leadData.full_name}, Email: ${leadData.email}, Empresa: ${leadData.company || 'N/A'}, Mensaje: ${leadData.message || 'Sin mensaje'}, Origen: ${leadData.utm_source || 'Directo'}\\n\\nGenera BRIEF ESTRATÉGICO: 1) Perfil rápido 2) Contexto llamada 3) Preguntas cualificación 4) Propuesta valor 5) Red flags 6) Siguiente paso`;
  }
  return `CANDIDATO: ${leadData.full_name}, Profesión: ${leadData.profession || 'N/A'}, Motivación: ${leadData.motivation || 'N/A'}\\n\\nGenera ANÁLISIS CANDIDATO: 1) Perfil y fit 2) Experiencia 3) Motivación 4) Preguntas entrevista 5) Encaje red 6) Recomendación`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let reportId: string | null = null;
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

  try {
    const { lead_id, lead_type = 'valuation', force_regenerate = false } = await req.json();
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false, persistSession: false } });

    // Cache check
    if (!force_regenerate) {
      const { data: existing } = await supabase.from('lead_ai_reports').select('*').eq('lead_id', lead_id).eq('generation_status', 'completed').order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (existing) {
        const age = Date.now() - new Date(existing.created_at).getTime();
        if (age < 24 * 60 * 60 * 1000) {
          return new Response(JSON.stringify({ ...existing, cached: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }
      }
    }

    const leadData = await fetchLeadData(lead_id, lead_type, supabase);

    const { data: report } = await supabase.from('lead_ai_reports').insert({ lead_id, generation_status: 'processing' }).select().single();
    reportId = report?.id;

    const systemPrompts: Record<string, string> = {
      valuation: 'Actúas como analista de M&A en Capittal. Ayudas a dueños a vender empresas. Responde en español con viñetas.',
      contact: 'Eres analista comercial senior de Capittal. Cualificas leads. Responde en español con viñetas.',
      collaborator: 'Eres director de desarrollo de red de Capittal. Evalúas colaboradores. Responde en español con viñetas.'
    };

    const response = await callAI(
      [
        { role: 'system', content: systemPrompts[lead_type] || systemPrompts.valuation },
        { role: 'user', content: buildPromptForLeadType(leadData, lead_type) }
      ],
      { functionName: 'generate-lead-ai-report', maxTokens: 3000 }
    );

    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    await supabase.from('lead_ai_reports').update({
      report_commercial_prep: response.content,
      generation_status: 'completed',
      tokens_used: response.tokensUsed,
      cost_usd: 0,
      processing_time_seconds: processingTime,
      completed_at: new Date().toISOString()
    }).eq('id', reportId);

    return new Response(JSON.stringify({ success: true, report_id: reportId, lead_id, tokens_used: response.tokensUsed, processing_time_seconds: processingTime }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generando reporte:', error);
    if (reportId) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase.from('lead_ai_reports').update({ generation_status: 'failed', error_message: String(error) }).eq('id', reportId);
    }
    return aiErrorResponse(error, corsHeaders);
  }
});
