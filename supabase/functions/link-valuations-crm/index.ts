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
    // Auth: require Authorization header (service role for cron, or valid JWT)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

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

    // Pre-fetch existing contacts only for emails we need (avoid loading entire table)
    const valuationEmails = [...new Set(
      valuations.filter(v => v.email).map(v => v.email!.toLowerCase().trim())
    )];
    const valuationCompanies = [...new Set(
      valuations.filter(v => v.company_name).map(v => v.company_name!.toLowerCase().trim())
    )];

    const contactsByEmail = new Map<string, string>();
    // Fetch in batches of 100 to avoid query size limits
    for (let i = 0; i < valuationEmails.length; i += 100) {
      const batch = valuationEmails.slice(i, i + 100);
      const { data: contacts, error: contactsError } = await supabase
        .from('contactos')
        .select('id, email')
        .in('email', batch);
      if (contactsError) {
        console.error('Error fetching contacts batch:', contactsError);
      }
      (contacts || []).forEach(c => {
        if (c.email) contactsByEmail.set(c.email.toLowerCase().trim(), c.id);
      });
    }
    console.log(`Loaded ${contactsByEmail.size} matching contacts`);

    const empresasByName = new Map<string, string>();
    for (let i = 0; i < valuationCompanies.length; i += 100) {
      const batch = valuationCompanies.slice(i, i + 100);
      const { data: empresas, error: empresasError } = await supabase
        .from('empresas')
        .select('id, nombre')
        .in('nombre', batch);
      if (empresasError) {
        console.error('Error fetching empresas batch:', empresasError);
      }
      (empresas || []).forEach(e => {
        if (e.nombre) empresasByName.set(e.nombre.toLowerCase().trim(), e.id);
      });
    }
    console.log(`Loaded ${empresasByName.size} matching empresas`);

    // Process each valuation
    for (const valuation of valuations) {
      // PHASE 1: Link to Contactos
      if (linkContacts && !valuation.crm_contacto_id && valuation.email) {
        const emailKey = valuation.email.toLowerCase().trim();
        let existingContactId = contactsByEmail.get(emailKey);

        // If not found in map, try a direct case-insensitive lookup
        if (!existingContactId) {
          const { data: directMatch } = await supabase
            .from('contactos')
            .select('id')
            .ilike('email', emailKey)
            .limit(1)
            .single();
          
          if (directMatch) {
            existingContactId = directMatch.id;
            contactsByEmail.set(emailKey, directMatch.id);
          }
        }

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
                valuation_id: valuation.id,
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
        let existingEmpresaId = empresasByName.get(companyKey);

        // If not found in map, try a direct case-insensitive lookup
        if (!existingEmpresaId) {
          const { data: directMatch } = await supabase
            .from('empresas')
            .select('id')
            .ilike('nombre', companyKey)
            .limit(1)
            .single();
          
          if (directMatch) {
            existingEmpresaId = directMatch.id;
            empresasByName.set(companyKey, directMatch.id);
          }
        }

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
      error: 'Error interno del servidor.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
