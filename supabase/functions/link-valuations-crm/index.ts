import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LinkRequest {
  dryRun?: boolean;
  limit?: number;
  linkContacts?: boolean;
  linkEmpresas?: boolean;
}

interface LinkResult {
  processed: number;
  contacts: {
    linked: number;
    created: number;
    failed: number;
    errors: string[];
  };
  empresas: {
    linked: number;
    created: number;
    failed: number;
    errors: string[];
  };
  dryRun: boolean;
}

function extractNombre(fullName: string | null): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts[0] || '';
}

function extractApellidos(fullName: string | null): string {
  if (!fullName) return '';
  const parts = fullName.trim().split(/\s+/);
  return parts.slice(1).join(' ') || '';
}

function parseEmpleados(employeeRange: string | null): number | null {
  if (!employeeRange) return null;
  // Parse ranges like "1-10", "11-50", "50+" etc.
  const match = employeeRange.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: LinkRequest = await req.json().catch(() => ({}));
    const {
      dryRun = false,
      limit = 1000,
      linkContacts = true,
      linkEmpresas = true,
    } = body;

    console.log(`Starting link-valuations-crm: dryRun=${dryRun}, limit=${limit}, linkContacts=${linkContacts}, linkEmpresas=${linkEmpresas}`);

    const result: LinkResult = {
      processed: 0,
      contacts: { linked: 0, created: 0, failed: 0, errors: [] },
      empresas: { linked: 0, created: 0, failed: 0, errors: [] },
      dryRun,
    };

    // Fetch valuations that need linking
    let query = supabase
      .from('company_valuations')
      .select('id, email, contact_name, phone, company_name, industry, revenue, ebitda, employee_range, crm_contacto_id, empresa_id')
      .limit(limit);

    // Only fetch unlinked ones
    if (linkContacts && !linkEmpresas) {
      query = query.is('crm_contacto_id', null);
    } else if (!linkContacts && linkEmpresas) {
      query = query.is('empresa_id', null);
    } else {
      query = query.or('crm_contacto_id.is.null,empresa_id.is.null');
    }

    const { data: valuations, error: fetchError } = await query;

    if (fetchError) {
      throw new Error(`Error fetching valuations: ${fetchError.message}`);
    }

    if (!valuations || valuations.length === 0) {
      return new Response(JSON.stringify({
        ...result,
        message: 'No valuations need linking'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    result.processed = valuations.length;
    console.log(`Found ${valuations.length} valuations to process`);

    // Pre-fetch ALL existing contacts (more reliable than .in() with large arrays)
    const { data: existingContacts, error: contactsError } = await supabase
      .from('contactos')
      .select('id, email');

    if (contactsError) {
      console.error('Error fetching contacts:', contactsError);
    }

    const contactsByEmail = new Map(
      (existingContacts || []).map(c => [c.email?.toLowerCase().trim(), c.id])
    );
    console.log(`Loaded ${contactsByEmail.size} existing contacts`);

    // Pre-fetch ALL existing empresas
    const { data: existingEmpresas, error: empresasError } = await supabase
      .from('empresas')
      .select('id, nombre');

    if (empresasError) {
      console.error('Error fetching empresas:', empresasError);
    }

    const empresasByName = new Map(
      (existingEmpresas || []).map(e => [e.nombre?.toLowerCase().trim(), e.id])
    );
    console.log(`Loaded ${empresasByName.size} existing empresas`);

    // Process each valuation
    for (const valuation of valuations) {
      // PHASE 1: Link to Contactos
      if (linkContacts && !valuation.crm_contacto_id && valuation.email) {
        const emailKey = valuation.email.toLowerCase().trim();
        const existingContactId = contactsByEmail.get(emailKey);

        if (existingContactId) {
          // Contact exists - link it
          if (!dryRun) {
            const { error: updateError } = await supabase
              .from('company_valuations')
              .update({ crm_contacto_id: existingContactId })
              .eq('id', valuation.id);

            if (updateError) {
              result.contacts.failed++;
              result.contacts.errors.push(`Failed to link ${valuation.id}: ${updateError.message}`);
            } else {
              result.contacts.linked++;
            }
          } else {
            result.contacts.linked++;
          }
        } else {
          // Contact doesn't exist - create it
          if (!dryRun) {
            const { data: newContact, error: createError } = await supabase
              .from('contactos')
              .insert({
                email: emailKey,
                nombre: extractNombre(valuation.contact_name),
                apellidos: extractApellidos(valuation.contact_name),
                telefono: valuation.phone,
                source: 'capittal_valuation',
                source_id: valuation.id,
                empresa_nombre: valuation.company_name,
              })
              .select('id')
              .single();

            if (createError) {
              result.contacts.failed++;
              result.contacts.errors.push(`Failed to create contact for ${emailKey}: ${createError.message}`);
            } else if (newContact) {
              // Link the new contact
              await supabase
                .from('company_valuations')
                .update({ crm_contacto_id: newContact.id })
                .eq('id', valuation.id);

              // Add to map to avoid duplicates
              contactsByEmail.set(emailKey, newContact.id);
              result.contacts.created++;
            }
          } else {
            result.contacts.created++;
          }
        }
      }

      // PHASE 2: Link to Empresas
      if (linkEmpresas && !valuation.empresa_id && valuation.company_name) {
        const companyKey = valuation.company_name.toLowerCase().trim();
        const existingEmpresaId = empresasByName.get(companyKey);

        if (existingEmpresaId) {
          // Empresa exists - link it
          if (!dryRun) {
            const { error: updateError } = await supabase
              .from('company_valuations')
              .update({ empresa_id: existingEmpresaId })
              .eq('id', valuation.id);

            if (updateError) {
              result.empresas.failed++;
              result.empresas.errors.push(`Failed to link empresa ${valuation.id}: ${updateError.message}`);
            } else {
              result.empresas.linked++;
            }
          } else {
            result.empresas.linked++;
          }
        } else {
          // Empresa doesn't exist - create it
          if (!dryRun) {
            const { data: newEmpresa, error: createError } = await supabase
              .from('empresas')
              .insert({
                nombre: valuation.company_name.trim(),
                sector: valuation.industry,
                revenue: valuation.revenue,
                ebitda: valuation.ebitda,
                empleados: parseEmpleados(valuation.employee_range),
                source: 'valuation',
                source_valuation_id: valuation.id,
              })
              .select('id')
              .single();

            if (createError) {
              result.empresas.failed++;
              result.empresas.errors.push(`Failed to create empresa for ${valuation.company_name}: ${createError.message}`);
            } else if (newEmpresa) {
              // Link the new empresa
              await supabase
                .from('company_valuations')
                .update({ empresa_id: newEmpresa.id })
                .eq('id', valuation.id);

              // Add to map to avoid duplicates
              empresasByName.set(companyKey, newEmpresa.id);
              result.empresas.created++;
            }
          } else {
            result.empresas.created++;
          }
        }
      }
    }

    console.log(`Completed: ${JSON.stringify(result)}`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in link-valuations-crm:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.toString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
