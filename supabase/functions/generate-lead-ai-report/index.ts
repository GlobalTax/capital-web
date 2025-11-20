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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let reportId: string | null = null;

  try {
    const { lead_id } = await req.json();
    console.log('📊 Generando reporte IA para lead:', lead_id);

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

    // 1. Obtener datos del lead
    const { data: lead, error: leadError } = await supabase
      .from('company_valuations')
      .select('*')
      .eq('id', lead_id)
      .single();

    if (leadError || !lead) {
      throw new Error(`Error obteniendo lead: ${leadError?.message}`);
    }

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

    // 3. Preparar datos para el prompt
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

    // 4. PROMPT 1: Preparación de Llamada Comercial
    const systemPrompt = `Actúas como analista de M&A y consultor de negocio especializado en PYMES.
Eres asesor en compraventa de empresas en Capittal. Ayudas a dueños de empresas a vender total o parcialmente su compañía, buscar socios o planificar sucesión.

Responde en español (España), de forma concreta y estructurada con viñetas.`;

    const userPrompt = `${leadContext}

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

    console.log('🤖 Llamando a OpenAI...');
    
    // 5. Llamar a OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`);
    }

    const openaiData = await openaiResponse.json();
    const reportContent = openaiData.choices[0].message.content;
    const tokensUsed = openaiData.usage.total_tokens;
    const costUsd = (tokensUsed / 1000000) * 0.15; // gpt-4o-mini pricing

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
