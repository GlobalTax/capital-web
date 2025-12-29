import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to safely parse JSON responses (handles empty/204 responses)
async function safeJsonParse(response: Response): Promise<any> {
  const text = await response.text();
  if (!text || text.trim() === '') {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    console.log(`⚠️ Could not parse response as JSON: ${text.substring(0, 200)}`);
    return { raw: text };
  }
}

// Helper: Separar nombre completo en FIRSTNAME y LASTNAME (atributos nativos Brevo)
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  if (!fullName) return { firstName: '', lastName: '' };
  const parts = fullName.trim().split(/\s+/);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' ') || ''
  };
}

// Helper: Formatear teléfono para atributo SMS de Brevo (sin +, sin espacios, formato internacional)
function formatPhoneForBrevo(phone: string): string {
  if (!phone) return '';
  // Eliminar todo excepto dígitos
  let cleaned = phone.replace(/[^\d]/g, '');
  // Si empieza con 00, eliminar (formato internacional europeo)
  if (cleaned.startsWith('00')) cleaned = cleaned.substring(2);
  // Si es español (9 dígitos empezando por 6,7,8,9) y no tiene prefijo, añadir 34
  if (cleaned.length === 9 && /^[6789]/.test(cleaned)) {
    cleaned = '34' + cleaned;
  }
  return cleaned;
}

interface BrevoContact {
  email: string;
  attributes: {
    // === ATRIBUTOS NATIVOS BREVO ===
    FIRSTNAME: string;
    LASTNAME: string;
    SMS?: string;
    EXT_ID: string;
    JOB_TITLE?: string;
    
    // === DATOS DEL LEAD ===
    LEAD_SOURCE: string;
    LEAD_STATUS: string;
    COMPANY?: string;
    CIF?: string;
    INDUSTRY?: string;
    SUBSECTOR?: string;
    LOCATION?: string;
    REVENUE?: number;
    EBITDA?: number;
    FINAL_VALUATION?: number;
    EMPLOYEE_RANGE?: string;
    
    // === DATOS DE EMPRESA VINCULADA ===
    EMPRESA_ID?: string;
    EMPRESA_NOMBRE?: string;
    EMPRESA_WEBSITE?: string;
    EMPRESA_DESCRIPCION?: string;
    EMPRESA_FACTURACION?: number;
    EMPRESA_EBITDA?: number;
    EMPRESA_MARGEN_EBITDA?: number;
    EMPRESA_EMPLEADOS?: number;
    EMPRESA_DEUDA?: number;
    EMPRESA_CAPITAL_CIRCULANTE?: number;
    EMPRESA_ES_TARGET?: boolean;
    EMPRESA_ESTADO_TARGET?: string;
    EMPRESA_NIVEL_INTERES?: string;
    EMPRESA_SECTOR?: string;
    EMPRESA_SUBSECTOR?: string;
    EMPRESA_UBICACION?: string;
    
    // === CAMPOS COLABORADORES ===
    PROFESSION?: string;
    EXPERIENCE?: string;
    MOTIVATION?: string;
    
    // === CAMPOS ADQUISICIÓN ===
    INVESTMENT_BUDGET?: string;
    SECTORS_OF_INTEREST?: string;
    ACQUISITION_TYPE?: string;
    TARGET_TIMELINE?: string;
    PREFERRED_LOCATION?: string;
    
    // === UTM TRACKING ===
    UTM_SOURCE?: string;
    UTM_MEDIUM?: string;
    UTM_CAMPAIGN?: string;
    UTM_TERM?: string;
    UTM_CONTENT?: string;
    REFERRER?: string;
    
    // === TIMESTAMPS ===
    CREATED_AT: string;
  };
  listIds?: number[];
  updateEnabled?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const syncStartTime = Date.now();
  
  try {
    const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY');
    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { record, table, type } = await req.json();
    
    console.log(`📨 [sync-to-brevo] Processing ${type} for ${table}:`, record.id);

    // Determinar source y mapear datos
    let contact: BrevoContact;
    let leadType: string;

    // Función helper para obtener datos de empresa vinculada
    async function getEmpresaData(empresaId: string | null) {
      if (!empresaId) return null;
      
      try {
        const { data: empresa, error } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', empresaId)
          .single();
        
        if (error) {
          console.log(`⚠️ Error fetching empresa ${empresaId}:`, error.message);
          return null;
        }
        
        console.log('📊 Empresa vinculada encontrada:', empresa?.nombre);
        return empresa;
      } catch (e) {
        console.log('⚠️ Exception fetching empresa:', e);
        return null;
      }
    }

    // Función para construir atributos de empresa
    function buildEmpresaAttributes(empresa: any) {
      if (!empresa) return {};
      
      return {
        EMPRESA_ID: empresa.id || '',
        EMPRESA_NOMBRE: empresa.nombre || '',
        EMPRESA_WEBSITE: empresa.sitio_web || '',
        EMPRESA_DESCRIPCION: empresa.descripcion ? empresa.descripcion.substring(0, 500) : '',
        EMPRESA_FACTURACION: empresa.facturacion || 0,
        EMPRESA_EBITDA: empresa.ebitda || 0,
        EMPRESA_MARGEN_EBITDA: empresa.margen_ebitda || 0,
        EMPRESA_EMPLEADOS: empresa.empleados || 0,
        EMPRESA_DEUDA: empresa.deuda || 0,
        EMPRESA_CAPITAL_CIRCULANTE: empresa.capital_circulante || 0,
        EMPRESA_ES_TARGET: empresa.es_target || false,
        EMPRESA_ESTADO_TARGET: empresa.estado_target || '',
        EMPRESA_NIVEL_INTERES: empresa.nivel_interes || '',
        EMPRESA_SECTOR: empresa.sector || '',
        EMPRESA_SUBSECTOR: empresa.subsector || '',
        EMPRESA_UBICACION: empresa.ubicacion || '',
      };
    }

    if (table === 'company_valuations') {
      leadType = 'valuation';
      const { firstName, lastName } = splitFullName(record.contact_name);
      
      // Obtener empresa vinculada si existe
      const empresa = await getEmpresaData(record.empresa_id);
      const empresaAttrs = buildEmpresaAttributes(empresa);
      
      contact = {
        email: record.email,
        attributes: {
          // Atributos nativos Brevo
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: formatPhoneForBrevo(record.phone || record.phone_e164),
          EXT_ID: record.id,
          
          // Datos del lead
          LEAD_SOURCE: 'calculator',
          LEAD_STATUS: record.valuation_status || record.lead_status_crm || 'new',
          COMPANY: empresa?.nombre || record.company_name || '',
          CIF: empresa?.cif || record.cif || '',
          INDUSTRY: empresa?.sector || record.industry || '',
          SUBSECTOR: empresa?.subsector || '',
          LOCATION: empresa?.ubicacion || record.location || '',
          REVENUE: empresa?.facturacion || record.revenue || 0,
          EBITDA: empresa?.ebitda || record.ebitda || 0,
          FINAL_VALUATION: record.final_valuation || 0,
          EMPLOYEE_RANGE: record.employee_range || '',
          
          // Datos de empresa vinculada
          ...empresaAttrs,
          
          // UTM tracking
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          REFERRER: record.referrer || '',
          
          // Timestamps
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'contact_leads') {
      leadType = 'contact';
      const { firstName, lastName } = splitFullName(record.full_name);
      
      // Obtener empresa vinculada si existe
      const empresa = await getEmpresaData(record.empresa_id);
      const empresaAttrs = buildEmpresaAttributes(empresa);
      
      contact = {
        email: record.email,
        attributes: {
          // Atributos nativos Brevo
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: formatPhoneForBrevo(record.phone),
          EXT_ID: record.id,
          
          // Datos del lead
          LEAD_SOURCE: record.origin || 'contact_form',
          LEAD_STATUS: record.status || record.lead_status_crm || 'new',
          COMPANY: empresa?.nombre || record.company || '',
          INDUSTRY: empresa?.sector || record.sectors_of_interest || '',
          SUBSECTOR: empresa?.subsector || '',
          EMPLOYEE_RANGE: record.company_size || '',
          
          // Datos de empresa vinculada
          ...empresaAttrs,
          
          // UTM tracking
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          REFERRER: record.referral || record.referrer || '',
          
          // Timestamps
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'collaborator_applications') {
      leadType = 'collaborator';
      const { firstName, lastName } = splitFullName(record.full_name);
      
      contact = {
        email: record.email,
        attributes: {
          // Atributos nativos Brevo
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: formatPhoneForBrevo(record.phone),
          EXT_ID: record.id,
          JOB_TITLE: record.profession || '',
          
          // Datos del lead
          LEAD_SOURCE: 'collaborator_form',
          LEAD_STATUS: record.status || record.lead_status_crm || 'pending',
          COMPANY: record.company || '',
          
          // Campos específicos colaboradores
          PROFESSION: record.profession || '',
          EXPERIENCE: record.experience || '',
          MOTIVATION: record.motivation || '',
          
          // Timestamps
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'acquisition_leads') {
      leadType = 'acquisition';
      const { firstName, lastName } = splitFullName(record.full_name);
      
      contact = {
        email: record.email,
        attributes: {
          // Atributos nativos Brevo
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: formatPhoneForBrevo(record.phone),
          EXT_ID: record.id,
          
          // Datos del lead
          LEAD_SOURCE: 'acquisition_form',
          LEAD_STATUS: record.status || 'new',
          COMPANY: record.company || '',
          
          // Campos específicos adquisición
          INVESTMENT_BUDGET: record.investment_range || '',
          SECTORS_OF_INTEREST: record.sectors_of_interest || '',
          ACQUISITION_TYPE: record.acquisition_type || '',
          TARGET_TIMELINE: record.target_timeline || '',
          
          // UTM tracking
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          REFERRER: record.referrer || '',
          
          // Timestamps
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'company_acquisition_inquiries') {
      leadType = 'company_acquisition';
      const { firstName, lastName } = splitFullName(record.full_name);
      
      contact = {
        email: record.email,
        attributes: {
          // Atributos nativos Brevo
          FIRSTNAME: firstName,
          LASTNAME: lastName,
          SMS: formatPhoneForBrevo(record.phone),
          EXT_ID: record.id,
          
          // Datos del lead
          LEAD_SOURCE: 'acquisition_inquiry',
          LEAD_STATUS: record.status || 'new',
          COMPANY: record.company || '',
          
          // Campos específicos adquisición
          INVESTMENT_BUDGET: record.investment_budget || '',
          SECTORS_OF_INTEREST: record.sectors_of_interest || '',
          ACQUISITION_TYPE: record.acquisition_type || '',
          TARGET_TIMELINE: record.target_timeline || '',
          PREFERRED_LOCATION: record.preferred_location || '',
          
          // UTM tracking
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          REFERRER: record.referrer || '',
          
          // Timestamps
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else {
      throw new Error(`Unknown table: ${table}`);
    }

    // Añadir a lista específica si está configurada
    const listIdMapping: Record<string, string> = {
      'valuation': 'BREVO_LIST_ID_VALUATIONS',
      'contact': 'BREVO_LIST_ID_CONTACTS',
      'collaborator': 'BREVO_LIST_ID_COLLABORATORS',
      'acquisition': 'BREVO_LIST_ID_ACQUISITIONS',
      'company_acquisition': 'BREVO_LIST_ID_COMPANY_ACQUISITIONS'
    };
    
    const listIdEnvVar = listIdMapping[leadType];
    const listId = listIdEnvVar ? Deno.env.get(listIdEnvVar) : null;
    if (listId) {
      contact.listIds = [parseInt(listId)];
    }

    // Log de atributos enviados
    console.log('📤 Sending to Brevo:', {
      email: contact.email,
      firstName: contact.attributes.FIRSTNAME,
      lastName: contact.attributes.LASTNAME,
      sms: contact.attributes.SMS,
      company: contact.attributes.COMPANY,
      hasEmpresaData: !!contact.attributes.EMPRESA_ID,
      attributeCount: Object.keys(contact.attributes).filter(k => contact.attributes[k as keyof typeof contact.attributes]).length
    });
    
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    console.log(`📥 Brevo response status: ${brevoResponse.status}`);
    const brevoData = await safeJsonParse(brevoResponse);

    const durationMs = Date.now() - syncStartTime;

    // Registrar resultado en message_logs
    const logEntry = {
      type: 'brevo',
      status: brevoResponse.ok ? 'sent' : 'failed',
      recipient: contact.email,
      provider_name: 'brevo',
      valuation_id: leadType === 'valuation' ? record.id : null,
      contact_lead_id: leadType === 'contact' ? record.id : null,
      error_details: brevoResponse.ok ? null : JSON.stringify(brevoData),
      metadata: {
        brevo_response: brevoData,
        lead_source: contact.attributes.LEAD_SOURCE,
        list_ids: contact.listIds,
        attributes_sent: Object.keys(contact.attributes).length,
        has_empresa_data: !!contact.attributes.EMPRESA_ID,
      }
    };

    await supabase.from('message_logs').insert(logEntry);

    // Log to brevo_sync_log with full details
    await supabase.from('brevo_sync_log').insert({
      entity_id: record.id,
      entity_type: leadType,
      sync_status: brevoResponse.ok ? 'success' : 'failed',
      sync_type: 'contact',
      brevo_id: brevoData?.id?.toString() || null,
      sync_error: brevoResponse.ok ? null : JSON.stringify(brevoData),
      attributes_sent: contact.attributes,
      response_data: brevoData,
      duration_ms: durationMs,
      sync_attempts: 1,
      last_sync_at: new Date().toISOString(),
    });

    if (!brevoResponse.ok) {
      console.error('❌ Brevo API error:', brevoData);
      
      // Si el contacto ya existe (código 400 con "duplicate"), actualizar
      if (brevoResponse.status === 400 && brevoData.code === 'duplicate_parameter') {
        console.log('🔄 Contact exists, updating with enriched data...');
        
        const updateResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(contact.email)}`, {
          method: 'PUT',
          headers: {
            'api-key': BREVO_API_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            attributes: contact.attributes,
            listIds: contact.listIds,
          }),
        });

        console.log(`📥 Brevo update response status: ${updateResponse.status}`);
        
        if (updateResponse.ok) {
          console.log('✅ Contact updated successfully in Brevo with enriched data');
          const updateData = await safeJsonParse(updateResponse);
          return new Response(
            JSON.stringify({ 
              success: true, 
              action: 'updated', 
              brevo: updateData || { status: 'updated' },
              attributesSent: Object.keys(contact.attributes).length,
              hasEmpresaData: !!contact.attributes.EMPRESA_ID
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        const updateError = await safeJsonParse(updateResponse);
        console.error('❌ Failed to update contact:', updateError);
      }
      
      throw new Error(`Brevo API error: ${JSON.stringify(brevoData)}`);
    }

    console.log('✅ Successfully synced to Brevo with enriched data');

    return new Response(
      JSON.stringify({ 
        success: true, 
        action: 'created', 
        brevo: brevoData,
        attributesSent: Object.keys(contact.attributes).length,
        hasEmpresaData: !!contact.attributes.EMPRESA_ID
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('❌ Error in sync-to-brevo:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
