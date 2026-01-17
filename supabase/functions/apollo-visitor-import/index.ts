import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APOLLO_API_KEY = Deno.env.get('APOLLO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============= TYPES =============

interface ApolloOrganization {
  id: string;
  name: string;
  website_url?: string;
  primary_domain?: string;
  linkedin_url?: string;
  industry?: string;
  estimated_num_employees?: number;
  city?: string;
  state?: string;
  country?: string;
  raw_address?: string;
  annual_revenue?: number;
  intent_level?: string;
  account_score?: number;
}

interface ApolloPerson {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title?: string;
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  phone_numbers?: Array<{ raw_number: string; sanitized_number: string; type: string }>;
  organization_id?: string;
  organization?: ApolloOrganization;
}

// ============= HELPER FUNCTIONS =============

function normalizeWebsite(url: string | undefined): string | null {
  if (!url) return null;
  try {
    let normalized = url.toLowerCase().trim();
    if (!normalized.startsWith('http')) {
      normalized = 'https://' + normalized;
    }
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return url.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

async function findExistingEmpresa(
  supabase: ReturnType<typeof createClient>,
  org: ApolloOrganization
): Promise<{ id: string; action: 'exists' } | null> {
  // 1. By apollo_org_id
  if (org.id) {
    const { data } = await supabase
      .from('empresas')
      .select('id')
      .eq('apollo_org_id', org.id)
      .limit(1)
      .maybeSingle();
    
    if (data) return { id: data.id, action: 'exists' };
  }

  // 2. By website domain
  const domain = normalizeWebsite(org.website_url || org.primary_domain);
  if (domain) {
    const { data } = await supabase
      .from('empresas')
      .select('id')
      .or(`sitio_web.ilike.%${domain}%`)
      .limit(1)
      .maybeSingle();
    
    if (data) return { id: data.id, action: 'exists' };
  }

  // 3. By name (exact match)
  if (org.name) {
    const { data } = await supabase
      .from('empresas')
      .select('id')
      .ilike('nombre', org.name.trim())
      .limit(1)
      .maybeSingle();
    
    if (data) return { id: data.id, action: 'exists' };
  }

  return null;
}

async function importOrganizationToEmpresa(
  supabase: ReturnType<typeof createClient>,
  org: ApolloOrganization
): Promise<{ success: boolean; action: 'created' | 'updated' | 'skipped'; empresaId?: string; error?: string }> {
  try {
    const existing = await findExistingEmpresa(supabase, org);
    const domain = normalizeWebsite(org.website_url || org.primary_domain);

    const empresaData = {
      nombre: org.name,
      sitio_web: org.website_url || org.primary_domain,
      sector: org.industry,
      ubicacion: [org.city, org.state, org.country].filter(Boolean).join(', ') || null,
      empleados: org.estimated_num_employees?.toString(),
      apollo_org_id: org.id,
      apollo_intent_level: org.intent_level,
      apollo_score: org.account_score,
      apollo_last_synced_at: new Date().toISOString(),
      apollo_raw_data: org,
    };

    if (existing) {
      // Update existing empresa with Apollo data
      const { error } = await supabase
        .from('empresas')
        .update({
          apollo_org_id: org.id,
          apollo_intent_level: org.intent_level,
          apollo_score: org.account_score,
          apollo_last_synced_at: new Date().toISOString(),
          apollo_raw_data: org,
          // Only update if empty
          ...(domain && { sitio_web: org.website_url || org.primary_domain }),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('[Visitor Import] Update error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[Visitor Import] Updated empresa:', org.name, existing.id);
      return { success: true, action: 'updated', empresaId: existing.id };
    }

    // Create new empresa
    const { data: newEmpresa, error } = await supabase
      .from('empresas')
      .insert(empresaData)
      .select('id')
      .single();

    if (error) {
      console.error('[Visitor Import] Insert error:', error);
      return { success: false, action: 'skipped', error: error.message };
    }

    console.log('[Visitor Import] Created empresa:', org.name, newEmpresa.id);
    return { success: true, action: 'created', empresaId: newEmpresa.id };
  } catch (error) {
    console.error('[Visitor Import] Error:', error);
    return { success: false, action: 'skipped', error: String(error) };
  }
}

async function searchOrganizationsFromList(
  listId: string,
  listType: 'static' | 'dynamic',
  page: number = 1,
  perPage: number = 25
): Promise<{ organizations: ApolloOrganization[]; totalEntries: number; pagination: any }> {
  const listKey = listType === 'static' ? 'account_list_ids' : 'saved_list_ids';
  
  const response = await fetch('https://api.apollo.io/v1/accounts/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY!,
    },
    body: JSON.stringify({
      [listKey]: [listId],
      page,
      per_page: perPage,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Apollo API] Error:', response.status, errorText);
    throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Apollo API] Found', data.accounts?.length || 0, 'organizations, total:', data.pagination?.total_entries);

  return {
    organizations: data.accounts || [],
    totalEntries: data.pagination?.total_entries || 0,
    pagination: data.pagination,
  };
}

async function searchContactsForOrganization(
  apolloOrgId: string,
  page: number = 1,
  perPage: number = 25
): Promise<{ contacts: ApolloPerson[]; totalEntries: number; pagination: any }> {
  const response = await fetch('https://api.apollo.io/v1/people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY!,
    },
    body: JSON.stringify({
      organization_ids: [apolloOrgId],
      person_titles: [
        'CEO', 'Chief Executive', 'Founder', 'Co-Founder',
        'CFO', 'Chief Financial', 'Finance Director',
        'Director General', 'Managing Director',
        'Owner', 'Propietario', 'Gerente',
        'Director', 'VP', 'Vice President'
      ],
      page,
      per_page: perPage,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Apollo API] Error:', response.status, errorText);
    throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Apollo API] Found', data.people?.length || 0, 'contacts for org:', apolloOrgId);

  return {
    contacts: data.people || [],
    totalEntries: data.pagination?.total_entries || 0,
    pagination: data.pagination,
  };
}

async function importContactToLead(
  supabase: ReturnType<typeof createClient>,
  contact: ApolloPerson,
  empresaId: string
): Promise<{ success: boolean; action: 'created' | 'updated' | 'skipped'; leadId?: string; error?: string }> {
  try {
    if (!contact.email) {
      return { success: false, action: 'skipped', error: 'No email available' };
    }

    // Check if contact already exists
    const { data: existing } = await supabase
      .from('contact_leads')
      .select('id')
      .eq('email', contact.email)
      .limit(1)
      .maybeSingle();

    const leadData = {
      full_name: contact.name,
      email: contact.email,
      phone: contact.phone_numbers?.[0]?.sanitized_number,
      company: contact.organization?.name,
      empresa_id: empresaId,
      apollo_org_id: contact.organization_id,
      notes: `Importado desde Apollo (Visitor Import). Cargo: ${contact.title || 'N/A'}`,
      status: 'nuevo',
    };

    if (existing) {
      const { error } = await supabase
        .from('contact_leads')
        .update({
          ...leadData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('[Contact Import] Update error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      return { success: true, action: 'updated', leadId: existing.id };
    }

    const { data: newLead, error } = await supabase
      .from('contact_leads')
      .insert(leadData)
      .select('id')
      .single();

    if (error) {
      console.error('[Contact Import] Insert error:', error);
      return { success: false, action: 'skipped', error: error.message };
    }

    return { success: true, action: 'created', leadId: newLead.id };
  } catch (error) {
    console.error('[Contact Import] Error:', error);
    return { success: false, action: 'skipped', error: String(error) };
  }
}

// ============= MAIN HANDLER =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!APOLLO_API_KEY) {
      throw new Error('APOLLO_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action, ...params } = body;

    console.log('[apollo-visitor-import] Action:', action, 'Params:', JSON.stringify(params));

    // ============= ACTION: CREATE IMPORT JOB =============
    if (action === 'create_import') {
      const { list_id, list_type = 'static', user_id } = params;
      
      const { data: importJob, error } = await supabase
        .from('apollo_visitor_imports')
        .insert({
          list_id,
          list_type,
          status: 'pending',
          created_by: user_id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create import job: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        import: importJob,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: SEARCH ORGANIZATIONS FROM LIST =============
    if (action === 'search_organizations') {
      const { import_id, list_id, list_type = 'static', page = 1, per_page = 25 } = params;

      // Update import status
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ status: 'searching' })
          .eq('id', import_id);
      }

      const result = await searchOrganizationsFromList(list_id, list_type, page, per_page);

      // Check which organizations already exist in empresas
      const orgsWithStatus = await Promise.all(
        result.organizations.map(async (org) => {
          const existing = await findExistingEmpresa(supabase, org);
          return {
            ...org,
            existsInEmpresas: !!existing,
            existingEmpresaId: existing?.id,
          };
        })
      );

      // Update import with total found
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ 
            total_found: result.totalEntries,
            status: 'pending',
          })
          .eq('id', import_id);
      }

      return new Response(JSON.stringify({
        success: true,
        organizations: orgsWithStatus,
        total: result.totalEntries,
        pagination: result.pagination,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: IMPORT ORGANIZATIONS =============
    if (action === 'import_organizations') {
      const { 
        import_id, 
        organizations, 
        auto_import_contacts = false,
        max_contacts_per_company = 5 
      } = params;

      if (!organizations || !Array.isArray(organizations)) {
        throw new Error('Organizations array required');
      }

      // Update status
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ status: 'importing' })
          .eq('id', import_id);
      }

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
        empresas: [] as { id: string; name: string; apollo_org_id: string }[],
        // New: contact stats
        contacts: {
          imported: 0,
          updated: 0,
          skipped: 0,
          errors: [] as string[],
        },
      };

      const totalOrgs = organizations.length;
      let processedOrgs = 0;

      for (const org of organizations) {
        processedOrgs++;
        console.log(`[Visitor Import] Processing ${processedOrgs}/${totalOrgs}: ${org.name}`);
        
        const result = await importOrganizationToEmpresa(supabase, org);
        
        if (result.success) {
          if (result.action === 'created') results.imported++;
          if (result.action === 'updated') results.updated++;
          if (result.empresaId) {
            results.empresas.push({
              id: result.empresaId,
              name: org.name,
              apollo_org_id: org.id,
            });

            // Auto-import contacts if enabled
            if (auto_import_contacts && org.id) {
              try {
                console.log(`[Visitor Import] Searching contacts for ${org.name} (${org.id})`);
                const contactsResult = await searchContactsForOrganization(org.id, 1, max_contacts_per_company);
                
                // Import up to max_contacts_per_company
                const contactsToImport = contactsResult.contacts.slice(0, max_contacts_per_company);
                console.log(`[Visitor Import] Found ${contactsResult.contacts.length} contacts, importing ${contactsToImport.length}`);
                
                for (const contact of contactsToImport) {
                  const contactResult = await importContactToLead(supabase, contact, result.empresaId);
                  
                  if (contactResult.success) {
                    if (contactResult.action === 'created') results.contacts.imported++;
                    if (contactResult.action === 'updated') results.contacts.updated++;
                  } else {
                    results.contacts.skipped++;
                    if (contactResult.error) {
                      results.contacts.errors.push(`${contact.name}: ${contactResult.error}`);
                    }
                  }
                }
              } catch (contactError) {
                console.error(`[Visitor Import] Error fetching contacts for ${org.name}:`, contactError);
                results.contacts.errors.push(`${org.name}: ${String(contactError)}`);
              }
            }
          }
        } else {
          results.skipped++;
          if (result.error) results.errors.push(`${org.name}: ${result.error}`);
        }
      }

      // Update import job
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({
            status: 'completed',
            imported_count: results.imported,
            updated_count: results.updated,
            skipped_count: results.skipped,
            error_count: results.errors.length,
            error_message: results.errors.length > 0 ? results.errors.join('; ') : null,
            results: {
              empresas: results.empresas,
              contacts: results.contacts,
            },
          })
          .eq('id', import_id);
      }

      return new Response(JSON.stringify({
        success: true,
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: SEARCH CONTACTS FOR COMPANY =============
    if (action === 'search_contacts') {
      const { apollo_org_id, page = 1, per_page = 25 } = params;

      if (!apollo_org_id) {
        throw new Error('apollo_org_id required');
      }

      const result = await searchContactsForOrganization(apollo_org_id, page, per_page);

      return new Response(JSON.stringify({
        success: true,
        contacts: result.contacts,
        total: result.totalEntries,
        pagination: result.pagination,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: IMPORT CONTACTS =============
    if (action === 'import_contacts') {
      const { contacts, empresa_id } = params;

      if (!contacts || !Array.isArray(contacts) || !empresa_id) {
        throw new Error('Contacts array and empresa_id required');
      }

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
        leads: [] as { id: string; name: string; email: string }[],
      };

      for (const contact of contacts) {
        const result = await importContactToLead(supabase, contact, empresa_id);
        
        if (result.success) {
          if (result.action === 'created') results.imported++;
          if (result.action === 'updated') results.updated++;
          if (result.leadId) {
            results.leads.push({
              id: result.leadId,
              name: contact.name,
              email: contact.email,
            });
          }
        } else {
          results.skipped++;
          if (result.error) results.errors.push(`${contact.name}: ${result.error}`);
        }
      }

      return new Response(JSON.stringify({
        success: true,
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: GET IMPORT HISTORY =============
    if (action === 'get_history') {
      const { limit = 20 } = params;
      
      const { data, error } = await supabase
        .from('apollo_visitor_imports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch history: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        imports: data,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: GET IMPORTED EMPRESAS =============
    if (action === 'get_imported_empresas') {
      const { limit = 50 } = params;
      
      const { data, error } = await supabase
        .from('empresas')
        .select('id, nombre, sitio_web, sector, ubicacion, empleados, apollo_org_id, apollo_intent_level, apollo_score, apollo_last_synced_at')
        .not('apollo_org_id', 'is', null)
        .order('apollo_last_synced_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch empresas: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        empresas: data,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('[apollo-visitor-import] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
