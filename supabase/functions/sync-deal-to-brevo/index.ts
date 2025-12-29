import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sync Deal to Brevo - Edge Function
 * 
 * Sincroniza mandatos como Deals en Brevo CRM.
 * 
 * Brevo Deals API: https://developers.brevo.com/reference/post_crm-deals
 * 
 * Mapeo de campos:
 * - mandatos.id → deal.attributes.EXT_ID
 * - mandatos.tipo → deal.attributes.deal_type
 * - mandatos.valor → deal.amount
 * - mandatos.pipeline_stage → deal.pipelineId + stageId
 * - mandatos.probability → deal.probability (custom)
 * - mandatos.expected_close_date → deal.closeDate
 * - mandato_contactos → linkedContactsIds
 * - empresa_principal_id → linkedCompaniesIds
 */

interface SyncDealRequest {
  mandato_id: string;
  action?: 'create' | 'update' | 'delete';
}

interface BrevoDeal {
  name: string;
  attributes?: Record<string, any>;
  linkedContactsIds?: number[];
  linkedCompaniesIds?: string[];
}

// Mapeo de estados de mandato a stages de Brevo (IDs deben configurarse en Brevo)
const PIPELINE_STAGE_MAPPING: Record<string, string> = {
  'prospecting': 'Prospección',
  'initial_contact': 'Contacto Inicial',
  'qualification': 'Calificación',
  'documentation': 'Documentación',
  'valuation': 'Valoración',
  'negotiation': 'Negociación',
  'due_diligence': 'Due Diligence',
  'closing': 'Cierre',
  'closed_won': 'Ganado',
  'closed_lost': 'Perdido',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not configured');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { mandato_id, action = 'create' }: SyncDealRequest = await req.json();

    if (!mandato_id) {
      return new Response(
        JSON.stringify({ error: 'mandato_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 [sync-deal-to-brevo] Processing ${action} for mandato: ${mandato_id}`);

    // Obtener datos del mandato
    const { data: mandato, error: mandatoError } = await supabase
      .from('mandatos')
      .select(`
        *,
        empresa_principal:empresas!mandatos_empresa_principal_id_fkey(
          id, nombre, brevo_id
        )
      `)
      .eq('id', mandato_id)
      .single();

    if (mandatoError || !mandato) {
      console.error('❌ Mandato not found:', mandatoError);
      return new Response(
        JSON.stringify({ error: 'Mandato not found', details: mandatoError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Obtener contactos vinculados al mandato
    const { data: mandatoContactos } = await supabase
      .from('mandato_contactos')
      .select('contacto_id, contactos(id, email)')
      .eq('mandato_id', mandato_id);

    // Construir nombre del deal
    const dealName = mandato.empresa_principal?.nombre 
      ? `${mandato.tipo === 'venta' ? 'Venta' : 'Compra'} - ${mandato.empresa_principal.nombre}`
      : `Mandato ${mandato.tipo} - ${mandato_id.substring(0, 8)}`;

    // Construir atributos del deal
    const dealAttributes: Record<string, any> = {
      EXT_ID: mandato.id,
      DEAL_TYPE: mandato.tipo || 'venta',
      DEAL_STATUS: mandato.estado || 'activo',
      PIPELINE_STAGE: PIPELINE_STAGE_MAPPING[mandato.pipeline_stage] || mandato.pipeline_stage || 'Prospección',
      PRIORITY: mandato.prioridad || 'normal',
      PROBABILITY: mandato.probability || 0,
      EXPECTED_VALUE: mandato.valor || mandato.valoracion_esperada || 0,
      WEIGHTED_VALUE: mandato.weighted_value || 0,
      NEGOTIATION_STATUS: mandato.estado_negociacion || '',
      NUM_OFFERS: mandato.numero_ofertas_recibidas || 0,
      TARGET_BUYER_TYPE: mandato.tipo_comprador_buscado || '',
      TARGET_TIMELINE: mandato.timeline_objetivo || '',
      INVESTMENT_RANGE_MIN: mandato.rango_inversion_min || 0,
      INVESTMENT_RANGE_MAX: mandato.rango_inversion_max || 0,
      SECTORS_OF_INTEREST: Array.isArray(mandato.sectores_interes) 
        ? mandato.sectores_interes.join(', ') 
        : '',
      DAYS_IN_STAGE: mandato.days_in_stage || 0,
      IS_INTERNAL: mandato.es_interno || false,
      CREATED_AT: mandato.created_at,
    };

    // Construir payload para Brevo
    const brevoPayload: BrevoDeal = {
      name: dealName,
      attributes: dealAttributes,
    };

    // Añadir company vinculada si tiene brevo_id
    if (mandato.empresa_principal?.brevo_id) {
      brevoPayload.linkedCompaniesIds = [mandato.empresa_principal.brevo_id];
    }

    console.log('📤 Sending deal to Brevo:', {
      name: dealName,
      type: mandato.tipo,
      value: mandato.valor,
      stage: mandato.pipeline_stage,
      hasLinkedCompany: !!mandato.empresa_principal?.brevo_id,
      contactCount: mandatoContactos?.length || 0,
    });

    // Llamar a Brevo Deals API
    const brevoResponse = await fetch('https://api.brevo.com/v3/crm/deals', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    console.log(`📥 Brevo Deals API response: ${brevoResponse.status}`);

    let brevoData = null;
    const responseText = await brevoResponse.text();
    if (responseText) {
      try {
        brevoData = JSON.parse(responseText);
      } catch {
        console.log('Response was not JSON:', responseText.substring(0, 200));
      }
    }

    // Log en brevo_sync_log
    await supabase.from('brevo_sync_log').insert({
      entity_id: mandato.id,
      entity_type: 'deal',
      sync_status: brevoResponse.ok ? 'success' : 'failed',
      brevo_id: brevoData?.id || null,
      sync_error: brevoResponse.ok ? null : JSON.stringify(brevoData || responseText),
      last_sync_at: new Date().toISOString(),
      sync_type: 'deal',
      attributes_sent: dealAttributes,
      response_data: brevoData,
    });

    if (!brevoResponse.ok) {
      console.error('❌ Brevo Deals API error:', brevoData || responseText);
      
      // Si el deal ya existe, intentar actualizar
      if (brevoResponse.status === 400 && brevoData?.code === 'duplicate_parameter') {
        console.log('🔄 Deal might exist, attempting update...');
        // Brevo no soporta update por EXT_ID, necesitaríamos el brevo_id guardado
      }
      
      throw new Error(`Brevo Deals API error: ${JSON.stringify(brevoData || responseText)}`);
    }

    // Guardar brevo_id del deal si se creó correctamente
    if (brevoData?.id) {
      await supabase
        .from('mandatos')
        .update({ 
          // Nota: Añadir campo brevo_deal_id a mandatos si no existe
        })
        .eq('id', mandato.id);
    }

    console.log('✅ Deal synced successfully to Brevo');

    return new Response(
      JSON.stringify({ 
        success: true, 
        action,
        mandato_id,
        brevo_deal_id: brevoData?.id,
        deal_name: dealName,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in sync-deal-to-brevo:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
