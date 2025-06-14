
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const hubspotApiKey = Deno.env.get('HUBSPOT_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();

    if (!hubspotApiKey) {
      throw new Error('HubSpot API key not configured');
    }

    let result;

    switch (type) {
      case 'create_contact':
        result = await createContact(data);
        break;
      case 'create_company_valuation':
        result = await createCompanyValuation(data);
        break;
      case 'create_tool_rating':
        result = await createToolRating(data);
        break;
      default:
        throw new Error('Invalid operation type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('HubSpot integration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function createContact(contactData: any) {
  const { email, firstName, lastName, phone, company } = contactData;

  const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        email: email,
        firstname: firstName || '',
        lastname: lastName || '',
        phone: phone || '',
        company: company || '',
        lifecyclestage: 'lead',
        lead_source: 'Calculadora Valoración'
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot contact creation failed: ${error}`);
  }

  return await response.json();
}

async function createCompanyValuation(valuationData: any) {
  const {
    companyName,
    cif,
    contactName,
    email,
    phone,
    industry,
    revenue,
    ebitda,
    finalValuation,
    employeeRange,
    location
  } = valuationData;

  // Crear empresa en HubSpot
  const companyResponse = await fetch('https://api.hubapi.com/crm/v3/objects/companies', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        name: companyName,
        domain: '',
        industry: industry,
        city: location,
        numberofemployees: getEmployeeNumber(employeeRange),
        annualrevenue: revenue,
        custom_ebitda: ebitda,
        custom_valuation: finalValuation,
        custom_cif: cif,
        lead_source: 'Calculadora Valoración'
      }
    }),
  });

  if (!companyResponse.ok) {
    const error = await companyResponse.text();
    throw new Error(`HubSpot company creation failed: ${error}`);
  }

  const company = await companyResponse.json();

  // Crear contacto asociado a la empresa
  const contactResponse = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        email: email,
        firstname: contactName.split(' ')[0] || '',
        lastname: contactName.split(' ').slice(1).join(' ') || '',
        phone: phone || '',
        company: companyName,
        jobtitle: 'Contacto Principal',
        lifecyclestage: 'lead',
        lead_source: 'Calculadora Valoración'
      },
      associations: [
        {
          to: {
            id: company.id
          },
          types: [
            {
              associationCategory: "HUBSPOT_DEFINED",
              associationTypeId: 1
            }
          ]
        }
      ]
    }),
  });

  if (!contactResponse.ok) {
    const error = await contactResponse.text();
    console.error('Contact creation failed, but company was created:', error);
  }

  return {
    company: company,
    contact: contactResponse.ok ? await contactResponse.json() : null
  };
}

async function createToolRating(ratingData: any) {
  const {
    ease_of_use,
    result_accuracy,
    recommendation,
    feedback_comment,
    user_email,
    company_sector,
    company_size
  } = ratingData;

  // Crear un objeto personalizado para las valoraciones de herramienta
  const response = await fetch('https://api.hubapi.com/crm/v3/objects/2-8741844', { // ID del objeto personalizado
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hubspotApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        name: `Valoración - ${new Date().toISOString()}`,
        custom_ease_of_use: ease_of_use,
        custom_result_accuracy: result_accuracy,
        custom_recommendation: recommendation,
        custom_feedback: feedback_comment || '',
        custom_user_email: user_email || '',
        custom_company_sector: company_sector || '',
        custom_company_size: company_size || '',
        source: 'Calculadora Valoración'
      }
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('Tool rating creation failed:', error);
    // No lanzamos error aquí para no bloquear la valoración
    return { success: false, error };
  }

  return await response.json();
}

function getEmployeeNumber(range: string): number {
  switch (range) {
    case '1-10': return 5;
    case '11-50': return 30;
    case '51-200': return 125;
    case '201-500': return 350;
    case '500+': return 750;
    default: return 0;
  }
}
