import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BrevoContact {
  email: string;
  attributes: {
    LEAD_SOURCE: string;
    LEAD_ID: string;
    CONTACT_NAME?: string;
    COMPANY?: string;
    PHONE?: string;
    
    // Campos financieros (valoraciones)
    INDUSTRY?: string;
    REVENUE?: number;
    EBITDA?: number;
    FINAL_VALUATION?: number;
    EMPLOYEE_RANGE?: string;
    
    // Campos colaboradores
    PROFESSION?: string;
    EXPERIENCE?: string;
    MOTIVATION?: string;
    
    // Campos adquisición
    INVESTMENT_BUDGET?: string;
    SECTORS_OF_INTEREST?: string;
    ACQUISITION_TYPE?: string;
    TARGET_TIMELINE?: string;
    PREFERRED_LOCATION?: string;
    
    // Tracking
    UTM_SOURCE?: string;
    UTM_MEDIUM?: string;
    UTM_CAMPAIGN?: string;
    UTM_TERM?: string;
    UTM_CONTENT?: string;
    REFERRER?: string;
    
    // Status
    LEAD_STATUS: string;
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

    if (table === 'company_valuations') {
      leadType = 'valuation';
      contact = {
        email: record.email,
        attributes: {
          LEAD_SOURCE: 'calculator',
          LEAD_ID: record.id,
          COMPANY: record.company_name,
          CONTACT_NAME: record.contact_name,
          PHONE: record.phone || '',
          INDUSTRY: record.industry || '',
          REVENUE: record.revenue || 0,
          EBITDA: record.ebitda || 0,
          FINAL_VALUATION: record.final_valuation || 0,
          EMPLOYEE_RANGE: record.employee_range || '',
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          REFERRER: record.referrer || '',
          LEAD_STATUS: record.valuation_status || 'new',
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'contact_leads') {
      leadType = 'contact';
      contact = {
        email: record.email,
        attributes: {
          LEAD_SOURCE: 'contact_form',
          LEAD_ID: record.id,
          COMPANY: record.company,
          CONTACT_NAME: record.full_name,
          PHONE: record.phone || '',
          INDUSTRY: record.sectors_of_interest || '',
          EMPLOYEE_RANGE: record.company_size || '',
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          REFERRER: record.referral || '',
          LEAD_STATUS: record.status || 'new',
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'collaborator_applications') {
      leadType = 'collaborator';
      contact = {
        email: record.email,
        attributes: {
          LEAD_SOURCE: 'collaborator_form',
          LEAD_ID: record.id,
          CONTACT_NAME: record.full_name,
          COMPANY: record.company || '',
          PHONE: record.phone || '',
          PROFESSION: record.profession || '',
          EXPERIENCE: record.experience || '',
          MOTIVATION: record.motivation || '',
          LEAD_STATUS: record.status || 'pending',
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'acquisition_leads') {
      leadType = 'acquisition';
      contact = {
        email: record.email,
        attributes: {
          LEAD_SOURCE: 'acquisition_form',
          LEAD_ID: record.id,
          CONTACT_NAME: record.full_name,
          COMPANY: record.company || '',
          PHONE: record.phone || '',
          INVESTMENT_BUDGET: record.investment_range || '',
          SECTORS_OF_INTEREST: record.sectors_of_interest || '',
          ACQUISITION_TYPE: record.acquisition_type || '',
          TARGET_TIMELINE: record.target_timeline || '',
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          REFERRER: record.referrer || '',
          LEAD_STATUS: record.status || 'new',
          CREATED_AT: record.created_at,
        },
        updateEnabled: true
      };
    } else if (table === 'company_acquisition_inquiries') {
      leadType = 'company_acquisition';
      contact = {
        email: record.email,
        attributes: {
          LEAD_SOURCE: 'acquisition_inquiry',
          LEAD_ID: record.id,
          CONTACT_NAME: record.full_name,
          COMPANY: record.company || '',
          PHONE: record.phone || '',
          INVESTMENT_BUDGET: record.investment_budget || '',
          SECTORS_OF_INTEREST: record.sectors_of_interest || '',
          ACQUISITION_TYPE: record.acquisition_type || '',
          TARGET_TIMELINE: record.target_timeline || '',
          PREFERRED_LOCATION: record.preferred_location || '',
          UTM_SOURCE: record.utm_source || '',
          UTM_MEDIUM: record.utm_medium || '',
          UTM_CAMPAIGN: record.utm_campaign || '',
          UTM_TERM: record.utm_term || '',
          UTM_CONTENT: record.utm_content || '',
          REFERRER: record.referrer || '',
          LEAD_STATUS: record.status || 'new',
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

    // Enviar a Brevo API
    console.log('📤 Sending to Brevo:', contact.email);
    
    const brevoResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    const brevoData = await brevoResponse.json();

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
      }
    };

    await supabase.from('message_logs').insert(logEntry);

    if (!brevoResponse.ok) {
      console.error('❌ Brevo API error:', brevoData);
      
      // Si el contacto ya existe (código 400 con "duplicate"), actualizar
      if (brevoResponse.status === 400 && brevoData.code === 'duplicate_parameter') {
        console.log('🔄 Contact exists, updating...');
        
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

        if (updateResponse.ok) {
          console.log('✅ Contact updated successfully');
          return new Response(
            JSON.stringify({ success: true, action: 'updated', brevo: await updateResponse.json() }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }
      
      throw new Error(`Brevo API error: ${JSON.stringify(brevoData)}`);
    }

    console.log('✅ Successfully synced to Brevo');

    return new Response(
      JSON.stringify({ success: true, action: 'created', brevo: brevoData }),
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
