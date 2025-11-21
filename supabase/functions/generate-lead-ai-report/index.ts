import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

interface LeadData {
  id: string;
  company_name: string;
  industry: string;
  location: string;
  revenue: number;
  ebitda: number;
  employee_range: string;
  contact_name: string;
  email: string;
  phone: string;
}

interface ContactLeadData {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  utm_source?: string;
  utm_campaign?: string;
  created_at: string;
}

interface CollaboratorData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  profession: string;
  experience?: string;
  motivation?: string;
  created_at: string;
}

// Función universal para obtener datos del lead
async function fetchLeadData(leadId: string, leadType: string, supabase: any) {
  let data, error;
  
  switch (leadType) {
    case 'valuation':
      ({ data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('id', leadId)
        .single());
      break;
      
    case 'contact':
      ({ data, error } = await supabase
        .from('contact_leads')
        .select('*')
        .eq('id', leadId)
        .single());
      break;
      
    case 'collaborator':
      ({ data, error } = await supabase
        .from('collaborator_applications')
        .select('*')
        .eq('id', leadId)
        .single());
      break;
      
    default:
      throw new Error(`Tipo de lead no soportado: ${leadType}`);
  }
  
  if (error) throw error;
  if (!data) throw new Error('Lead no encontrado');
  
  return data;
}

// Prompts especializados por tipo de lead
function buildValuationPrompt(lead: any): string {
  const leadContext = `
DATOS DEL LEAD:
- Empresa: ${lead.company_name || 'No especificado'}
- Sector: ${lead.industry || 'No especificado'}
- País/Región: ${lead.location || 'España'}
- Facturación aproximada: ${lead.revenue ? `${(lead.revenue / 1000000).toFixed(1)}M€` : 'No especificado'}
- EBITDA: ${lead.ebitda ? `${(lead.ebitda / 1000000).toFixed(1)}M€` : 'No especificado'}
- Empleados: ${lead.employee_range || 'No especificado'}
- Tipo de cliente final: ${lead.industry?.toLowerCase().includes('b2b') ? 'B2B' : lead.industry?.toLowerCase().includes('b2c') ? 'B2C' : 'Por determinar'}
- Contacto: ${lead.contact_name || 'No especificado'}
- Email: ${lead.email || 'No especificado'}
- Teléfono: ${lead.phone || 'No especificado'}
  `.trim();

  return `${leadContext}

Quiero que me prepares una LLAMADA COMERCIAL con este lead. Dame:

1) RESUMEN RÁPIDO DEL SECTOR
   - Tipo de negocio típico
   - Qué está pasando en el sector (tendencias relevantes, no tecnicismos)

2) PERFIL TÍPICO DEL DUEÑO QUE QUIERE VENDER
   - Edad aproximada / momento vital típico
   - Sus miedos y preocupaciones más frecuentes
   - Qué suele querer maximizar (precio, legado, empleados, etc.)

3) DOLORES Y RETOS CLAVE QUE PUEDO TOCAR EN LA LLAMADA
   - Lista de 5–7 puntos muy concretos que le suelen doler a este tipo de empresario

4) ARGUMENTOS DE VALOR QUE YO (CAPITTAL) PUEDO USAR
   - Cómo explicar el valor de un asesor M&A adaptado a este sector
   - 5–7 bullets con ideas de frases que podría usar en la llamada

5) PREGUNTAS QUE DEBO HACERLE EN LA LLAMADA
   - Lista de 10–12 preguntas abiertas, muy prácticas, para entender bien su situación y su intención de venta

6) POSIBLES OBJECIONES Y CÓMO RESPONDER
   - 5–7 objeciones probables (precio, tiempos, miedo a enseñar datos, etc.)
   - Para cada una, una respuesta breve que suene tranquila y profesional

7) LENGUAJE / JERGA DEL SECTOR
   - 5–10 términos o conceptos que se usan en este sector y que me conviene conocer para sonar alineado`;
}

function buildContactPrompt(lead: ContactLeadData): string {
  const leadContext = `
DATOS DEL CONTACTO:
- Nombre: ${lead.full_name}
- Email: ${lead.email}
- Teléfono: ${lead.phone || 'N/A'}
- Empresa: ${lead.company || 'N/A'}
- Mensaje: ${lead.message || 'Sin mensaje'}
- Origen: ${lead.utm_source || 'Directo'}
- Campaña: ${lead.utm_campaign || 'N/A'}
- Fecha contacto: ${new Date(lead.created_at).toLocaleDateString('es-ES')}
  `.trim();
  
  return `${leadContext}

Genera un BRIEF ESTRATÉGICO para la primera llamada de cualificación:

1) 🎯 PERFIL RÁPIDO
   - Tipo de contacto estimado (empresario, inversor, consultor, etc.)
   - Nivel de interés probable (alto/medio/bajo) según los datos
   - Señales de urgencia o timing

2) 🔍 CONTEXTO DE LA LLAMADA
   - Qué SABEMOS con certeza
   - Qué NO SABEMOS y necesitamos averiguar
   - Hipótesis de por qué nos contactó

3) 💬 PREGUNTAS CLAVE DE CUALIFICACIÓN
   - Las 5 preguntas esenciales para entender si es un lead válido
   - Orden sugerido de las preguntas (de general a específico)

4) 🎁 PROPUESTA DE VALOR INICIAL
   - Qué destacar de Capittal según su perfil
   - 3-4 puntos de valor concretos para mencionar

5) 🚩 RED FLAGS A DETECTAR
   - Señales para descalificar rápido y no perder tiempo
   - Preguntas trampa para identificar tire-kickers

6) 📋 SIGUIENTE PASO CONCRETO
   - Acción específica post-llamada si califica
   - Criterios para pasar a siguiente fase`;
}

function buildCollaboratorPrompt(lead: CollaboratorData): string {
  const leadContext = `
DATOS DEL CANDIDATO:
- Nombre: ${lead.full_name}
- Email: ${lead.email}
- Teléfono: ${lead.phone || 'N/A'}
- Profesión: ${lead.profession || 'N/A'}
- Experiencia: ${lead.experience || 'N/A'}
- Motivación: ${lead.motivation || 'Sin especificar'}
- Fecha aplicación: ${new Date(lead.created_at).toLocaleDateString('es-ES')}
  `.trim();
  
  return `${leadContext}

Genera un ANÁLISIS DE CANDIDATO para la entrevista de colaborador:

1) 👤 PERFIL Y FIT INICIAL
   - Tipo de colaborador (advisor, partner, network, etc.)
   - Fit aparente con el modelo de negocio de Capittal
   - Fortalezas evidentes del perfil

2) 💼 ANÁLISIS DE EXPERIENCIA
   - Experiencia relevante para M&A/valoración de empresas
   - Sectores de expertise probable
   - Red de contactos estimada

3) 🎯 ANÁLISIS DE MOTIVACIÓN
   - Drivers principales (económicos, desarrollo, red, etc.)
   - Alineación con valores de Capittal
   - Señales de compromiso real vs curiosidad

4) ❓ PREGUNTAS CLAVE PARA LA ENTREVISTA
   - Top 7 preguntas para profundizar en su perfil
   - Preguntas sobre expectativas y disponibilidad
   - Casos prácticos sugeridos

5) 🤝 ENCAJE EN LA RED DE COLABORADORES
   - Rol potencial específico en el ecosistema
   - Tipo de deals donde podría aportar valor
   - Complementariedad con el equipo actual

6) 📋 RECOMENDACIÓN Y SIGUIENTE PASO
   - Viabilidad del perfil (alto/medio/bajo)
   - Onboarding sugerido si procede
   - Criterios de descarte si no encaja`;
}

function buildPromptForLeadType(leadData: any, leadType: string): string {
  switch (leadType) {
    case 'valuation':
      return buildValuationPrompt(leadData);
    case 'contact':
      return buildContactPrompt(leadData);
    case 'collaborator':
      return buildCollaboratorPrompt(leadData);
    default:
      throw new Error(`Tipo no soportado: ${leadType}`);
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let reportId: string | null = null;

  try {
    const { lead_id, lead_type = 'valuation', force_regenerate = false } = await req.json();
    console.log('📊 Generando reporte IA para lead:', lead_id, 'tipo:', lead_type, 'force:', force_regenerate);

    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    // Crear cliente de Supabase con service_role
    const supabase = createClient(
      SUPABASE_URL!,
      SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // 🔥 CACHÉ: Verificar si ya existe un reporte reciente (menos de 24 horas)
    if (!force_regenerate) {
      const { data: existingReport, error: existingError } = await supabase
        .from('lead_ai_reports')
        .select('*')
        .eq('lead_id', lead_id)
        .eq('generation_status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingReport && !existingError) {
        const reportAge = Date.now() - new Date(existingReport.created_at).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;

        if (reportAge < twentyFourHours) {
          console.log(`🔥 Usando reporte cacheado (${(reportAge / (60 * 60 * 1000)).toFixed(1)}h antiguo)`);
          return new Response(
            JSON.stringify({ 
              ...existingReport, 
              cached: true,
              cache_age_hours: (reportAge / (60 * 60 * 1000)).toFixed(1)
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
    }

    console.log('🚀 Generando nuevo reporte...');

    // 1. Obtener datos del lead según el tipo
    const leadData = await fetchLeadData(lead_id, lead_type, supabase);
    console.log('✅ Datos del lead obtenidos');

    // 2. Crear registro inicial en lead_ai_reports
    const { data: report, error: reportError } = await supabase
      .from('lead_ai_reports')
      .insert({
        lead_id: lead_id,
        generation_status: 'processing'
      })
      .select()
      .single();

    if (reportError) {
      throw new Error(`Error creando reporte: ${reportError.message}`);
    }

    reportId = report.id;
    console.log('✅ Registro de reporte creado:', reportId);

    // 3. Construir prompt según tipo de lead
    const systemPrompt = lead_type === 'valuation' 
      ? `Actúas como analista de M&A y consultor de negocio especializado en PYMES.
Eres asesor en compraventa de empresas en Capittal. Ayudas a dueños de empresas a vender total o parcialmente su compañía, buscar socios o planificar sucesión.

Responde en español (España), de forma concreta y estructurada con viñetas.`
      : lead_type === 'contact'
      ? `Eres un analista comercial senior de Capittal especializado en cualificación de leads.
Tu objetivo es ayudar al equipo a identificar rápidamente si un contacto es viable y preparar una llamada efectiva.

Responde en español (España), de forma concreta y estructurada con viñetas.`
      : `Eres el director de desarrollo de red de colaboradores de Capittal.
Tu objetivo es evaluar candidatos para la red de asesores, partners y colaboradores del ecosistema M&A.

Responde en español (España), de forma concreta y estructurada con viñetas.`;

    const userPrompt = buildPromptForLeadType(leadData, lead_type);

    console.log('🤖 Llamando a OpenAI...');
    
    // 5. Llamar a OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_completion_tokens: 3000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const reportContent = openaiData.choices[0].message.content;
    const tokensUsed = openaiData.usage.total_tokens;
    const costUsd = (tokensUsed / 1000000) * 0.0002; // gpt-5-mini-2025-08-07 pricing

    console.log('✅ Reporte generado:', tokensUsed, 'tokens, $', costUsd.toFixed(4));

    // 6. Guardar el reporte en la base de datos
    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    const { error: updateError } = await supabase
      .from('lead_ai_reports')
      .update({
        report_commercial_prep: reportContent,
        generation_status: 'completed',
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        processing_time_seconds: processingTime,
        completed_at: new Date().toISOString()
      })
      .eq('id', reportId);

    if (updateError) {
      throw new Error(`Error actualizando reporte: ${updateError.message}`);
    }

    console.log('✅ Reporte guardado exitosamente');

    return new Response(
      JSON.stringify({
        success: true,
        report_id: reportId,
        lead_id: lead_id,
        tokens_used: tokensUsed,
        cost_usd: costUsd,
        processing_time_seconds: processingTime
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Error generando reporte:', error);

    // Si tenemos un reportId, marcar como fallido
    if (reportId && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      await supabase
        .from('lead_ai_reports')
        .update({
          generation_status: 'failed',
          error_message: error instanceof Error ? error.message : 'Error desconocido'
        })
        .eq('id', reportId);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
