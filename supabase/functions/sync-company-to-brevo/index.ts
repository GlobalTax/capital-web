import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Sync Company to Brevo - Edge Function
 * 
 * Sincroniza empresas como Companies en Brevo CRM.
 * 
 * Brevo Companies API: https://developers.brevo.com/reference/post_companies
 * 
 * Mapeo de campos:
 * - empresas.id → company.attributes.EXT_ID
 * - empresas.nombre → company.name
 * - empresas.sitio_web → company.attributes.domain
 * - empresas.sector → company.attributes.industry
 * - empresas.facturacion → company.attributes.revenue
 * - empresas.empleados → company.attributes.number_of_employees
 * - empresas.ubicacion → company.attributes.country_code
 */

interface SyncCompanyRequest {
  empresa_id: string;
  action?: 'create' | 'update' | 'delete';
  link_contacts?: boolean; // Si debe vincular contactos existentes
}

interface BrevoCompany {
  name: string;
  attributes?: Record<string, any>;
  linkedContactsIds?: number[];
}

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

    const { empresa_id, action = 'create', link_contacts = false }: SyncCompanyRequest = await req.json();

    if (!empresa_id) {
      return new Response(
        JSON.stringify({ error: 'empresa_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🏢 [sync-company-to-brevo] Processing ${action} for empresa: ${empresa_id}`);

    // Obtener datos de la empresa
    const { data: empresa, error: empresaError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', empresa_id)
      .single();

    if (empresaError || !empresa) {
      console.error('❌ Empresa not found:', empresaError);
      return new Response(
        JSON.stringify({ error: 'Empresa not found', details: empresaError }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Si ya tiene brevo_id y es action update, usar PUT
    const existingBrevoId = empresa.brevo_id;
    const isUpdate = action === 'update' && existingBrevoId;

    // Extraer dominio del sitio web
    let domain = '';
    if (empresa.sitio_web) {
      try {
        const url = new URL(empresa.sitio_web.startsWith('http') ? empresa.sitio_web : `https://${empresa.sitio_web}`);
        domain = url.hostname.replace('www.', '');
      } catch {
        domain = empresa.sitio_web;
      }
    }

    // Mapear ubicación a código de país (simplificado)
    const countryCodeMapping: Record<string, string> = {
      'españa': 'ES', 'spain': 'ES', 'madrid': 'ES', 'barcelona': 'ES', 'valencia': 'ES',
      'portugal': 'PT', 'francia': 'FR', 'france': 'FR', 'alemania': 'DE', 'germany': 'DE',
      'italia': 'IT', 'italy': 'IT', 'reino unido': 'GB', 'uk': 'GB', 'usa': 'US', 'eeuu': 'US',
    };
    
    const ubicacionLower = (empresa.ubicacion || '').toLowerCase();
    let countryCode = 'ES'; // Default España
    for (const [key, code] of Object.entries(countryCodeMapping)) {
      if (ubicacionLower.includes(key)) {
        countryCode = code;
        break;
      }
    }

    // Construir atributos de la company
    const companyAttributes: Record<string, any> = {
      // Atributos nativos de Brevo Companies
      domain: domain,
      industry: empresa.sector || '',
      number_of_employees: empresa.empleados || 0,
      revenue: empresa.facturacion || empresa.revenue || 0,
      country_code: countryCode,
      
      // Atributos personalizados
      EXT_ID: empresa.id,
      CIF: empresa.cif || '',
      SUBSECTOR: empresa.subsector || '',
      LOCATION: empresa.ubicacion || '',
      DESCRIPTION: empresa.descripcion ? empresa.descripcion.substring(0, 500) : '',
      EBITDA: empresa.ebitda || 0,
      EBITDA_MARGIN: empresa.margen_ebitda || empresa.ebitda_margin || 0,
      DEBT: empresa.deuda || 0,
      WORKING_CAPITAL: empresa.capital_circulante || 0,
      IS_TARGET: empresa.es_target || false,
      TARGET_STATUS: empresa.estado_target || '',
      INTEREST_LEVEL: empresa.nivel_interes || '',
      CREATED_AT: empresa.created_at,
    };

    // Construir payload para Brevo
    const brevoPayload: BrevoCompany = {
      name: empresa.nombre,
      attributes: companyAttributes,
    };

    console.log('📤 Sending company to Brevo:', {
      name: empresa.nombre,
      domain,
      sector: empresa.sector,
      revenue: empresa.facturacion,
      employees: empresa.empleados,
      isUpdate,
    });

    // Llamar a Brevo Companies API
    const apiUrl = isUpdate 
      ? `https://api.brevo.com/v3/companies/${existingBrevoId}`
      : 'https://api.brevo.com/v3/companies';
    
    const brevoResponse = await fetch(apiUrl, {
      method: isUpdate ? 'PATCH' : 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoPayload),
    });

    console.log(`📥 Brevo Companies API response: ${brevoResponse.status}`);

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
      entity_id: empresa.id,
      entity_type: 'company',
      sync_status: brevoResponse.ok ? 'success' : 'failed',
      brevo_id: brevoData?.id || existingBrevoId || null,
      sync_error: brevoResponse.ok ? null : JSON.stringify(brevoData || responseText),
      last_sync_at: new Date().toISOString(),
      sync_type: 'company',
      attributes_sent: companyAttributes,
      response_data: brevoData,
    });

    if (!brevoResponse.ok) {
      console.error('❌ Brevo Companies API error:', brevoData || responseText);
      
      // Si la company ya existe, intentar actualizar
      if (brevoResponse.status === 400) {
        console.log('⚠️ Company creation failed, might already exist');
      }
      
      throw new Error(`Brevo Companies API error: ${JSON.stringify(brevoData || responseText)}`);
    }

    // Guardar brevo_id si se creó correctamente
    const newBrevoId = brevoData?.id || existingBrevoId;
    if (newBrevoId && !existingBrevoId) {
      await supabase
        .from('empresas')
        .update({ 
          brevo_id: newBrevoId,
          brevo_synced_at: new Date().toISOString(),
        })
        .eq('id', empresa.id);
      
      console.log(`💾 Saved brevo_id ${newBrevoId} for empresa ${empresa.id}`);
    }

    // Si se solicita vincular contactos, buscar leads con esta empresa
    if (link_contacts && newBrevoId) {
      console.log('🔗 Linking contacts to company...');
      
      // Buscar valuations con esta empresa_id
      const { data: valuations } = await supabase
        .from('company_valuations')
        .select('id, email')
        .eq('empresa_id', empresa.id);

      // Buscar contact_leads con esta empresa_id  
      const { data: contacts } = await supabase
        .from('contact_leads')
        .select('id, email')
        .eq('empresa_id', empresa.id);

      const allEmails = [
        ...(valuations || []).map(v => v.email),
        ...(contacts || []).map(c => c.email),
      ].filter(Boolean);

      console.log(`📧 Found ${allEmails.length} contacts to potentially link`);
      
      // Nota: Para vincular contactos en Brevo, necesitaríamos sus IDs de Brevo
      // Esto requeriría una llamada adicional para cada contacto
    }

    console.log('✅ Company synced successfully to Brevo');

    return new Response(
      JSON.stringify({ 
        success: true, 
        action: isUpdate ? 'updated' : 'created',
        empresa_id,
        brevo_company_id: newBrevoId,
        company_name: empresa.nombre,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('❌ Error in sync-company-to-brevo:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
