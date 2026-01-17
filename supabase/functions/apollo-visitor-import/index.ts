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
  // Enrichment data
  founded_year?: number;
  technologies?: string[];
  // Visitor data (when source is website visitors)
  visitor_data?: {
    visit_date?: string;
    intent_level?: string;
  };
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

// ============= APOLLO API FUNCTIONS =============

// NEW: Enrich organization by domain - THE RELIABLE WAY
// Uses /v1/organizations/enrich which is designed for single-org lookups
async function enrichOrganization(domain: string): Promise<ApolloOrganization | null> {
  console.log('[Apollo API] Enriching organization by domain:', domain);
  
  const response = await fetch(
    `https://api.apollo.io/v1/organizations/enrich?domain=${encodeURIComponent(domain)}`,
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY!,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.log(`[Apollo Enrich] No data for domain ${domain}: ${response.status} ${errorText}`);
    return null;
  }

  const data = await response.json();
  console.log('[Apollo Enrich] Success for domain:', domain, '- Org:', data.organization?.name);
  
  return data.organization || null;
}

// SIMPLIFIED: Search organizations from Apollo list (CRM only)
// Supports both contact lists and account lists
// WARNING: This ONLY works for items already in Apollo CRM, not "net new"
async function searchOrganizationsFromList(
  listId: string,
  listType: 'contacts' | 'accounts' = 'accounts',
  page: number = 1,
  perPage: number = 25
): Promise<{ organizations: ApolloOrganization[]; totalEntries: number; pagination: any; warning?: string }> {
  
  console.log('[Apollo API] Searching from list:', { listId, listType });
  
  let organizations: ApolloOrganization[] = [];
  let totalEntries = 0;
  let pagination: any = {};

  if (listType === 'contacts') {
    // Use contacts/search for contact lists
    const requestBody = {
      contact_list_ids: [listId],
      page,
      per_page: perPage,
    };

    console.log('[Apollo API] Using /v1/contacts/search with contact_list_ids');
    
    const response = await fetch('https://api.apollo.io/v1/contacts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY!,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Apollo API] contacts/search failed:', response.status, errorText);
      throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const contacts = data.contacts || data.people || [];
    totalEntries = data.pagination?.total_entries || 0;
    pagination = data.pagination;

    console.log('[Apollo API] contacts/search result:', {
      total: totalEntries,
      returned: contacts.length,
      firstResult: contacts[0]?.name || contacts[0]?.first_name,
    });

    // Extract organizations from contacts
    const orgMap = new Map<string, ApolloOrganization>();
    for (const contact of contacts) {
      const org = contact.organization;
      if (org && org.id && !orgMap.has(org.id)) {
        orgMap.set(org.id, {
          id: org.id,
          name: org.name,
          website_url: org.website_url,
          primary_domain: org.primary_domain,
          linkedin_url: org.linkedin_url,
          industry: org.industry,
          estimated_num_employees: org.estimated_num_employees,
          city: org.city,
          state: org.state,
          country: org.country,
        });
      }
    }
    organizations = Array.from(orgMap.values());
    console.log('[Apollo API] Extracted', organizations.length, 'unique organizations from contacts');
    
  } else {
    // Use accounts/search for account lists
    const requestBody = {
      account_list_ids: [listId],
      page,
      per_page: perPage,
    };

    console.log('[Apollo API] Using /v1/accounts/search with account_list_ids');

    const response = await fetch('https://api.apollo.io/v1/accounts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY!,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Apollo API] accounts/search failed:', response.status, errorText);
      throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    organizations = data.accounts || [];
    totalEntries = data.pagination?.total_entries || 0;
    pagination = data.pagination;

    console.log('[Apollo API] accounts/search result:', {
      total: totalEntries,
      returned: organizations.length,
      firstResult: organizations[0]?.name,
    });
  }

  // Warning about CRM-only limitation
  const warning = listType === 'contacts'
    ? `ℹ️ Lista de contactos: Se encontraron ${totalEntries} contactos → ${organizations.length} empresas únicas.`
    : `⚠️ Lista de cuentas: Solo muestra empresas ya en el CRM de Apollo (${totalEntries} encontradas).`;

  return {
    organizations,
    totalEntries: organizations.length,
    pagination,
    warning,
  };
}

// PRIMARY: Search website visitors with native Apollo filters
// This is the RECOMMENDED method - uses date range + intent filters
async function searchWebsiteVisitors(
  dateFrom: string,
  dateTo: string,
  intentLevels: string[] = ['high', 'medium', 'low'],
  onlyNew: boolean = false,
  page: number = 1,
  perPage: number = 25
): Promise<{ organizations: ApolloOrganization[]; totalEntries: number; pagination: any; warning?: string }> {
  
  console.log('[Apollo API] Searching website visitors:', { dateFrom, dateTo, intentLevels, onlyNew });

  // Build the search criteria
  const searchCriteria: Record<string, any> = {
    website_visitor_visit_date_range: {
      min: dateFrom,
      max: dateTo,
    },
  };

  if (intentLevels.length > 0) {
    searchCriteria.website_visitor_intent_level = intentLevels;
  }

  if (onlyNew) {
    searchCriteria.prospected_by_current_team = [false];
  }

  const requestBody = {
    q_organization_search_criteria: searchCriteria,
    page,
    per_page: perPage,
  };

  console.log('[Apollo API] Request body:', JSON.stringify(requestBody, null, 2));

  const response = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY!,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Apollo API] Error:', response.status, errorText);
    throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  
  // mixed_companies/search returns "organizations" for website visitors
  const organizations = data.organizations || [];
  const totalEntries = data.pagination?.total_entries || 0;

  console.log('[Apollo API] Website visitors result:', {
    total: totalEntries,
    returned: organizations.length,
    firstResult: organizations[0]?.name,
  });

  let warning: string | undefined;
  if (totalEntries > 500) {
    warning = `Se encontraron ${totalEntries} resultados. Considera reducir el rango de fechas o aumentar el nivel de intent.`;
  }

  return {
    organizations,
    totalEntries,
    pagination: data.pagination,
    warning,
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

// ============= IMPORT FUNCTIONS =============

async function importOrganizationToEmpresa(
  supabase: ReturnType<typeof createClient>,
  org: ApolloOrganization,
  source: string = 'manual_import'
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
      // NEW: Track source and visitor date
      apollo_visitor_source: source,
      apollo_visitor_date: org.visitor_data?.visit_date || null,
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
          apollo_visitor_source: source,
          ...(org.visitor_data?.visit_date && { apollo_visitor_date: org.visitor_data.visit_date }),
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

    // ============= ACTION: SEARCH ORGANIZATIONS FROM LIST (CRM ONLY) =============
    if (action === 'search_organizations') {
      const { import_id, list_id, list_type = 'contacts', page = 1, per_page = 25 } = params;

      // Update import status
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ status: 'searching' })
          .eq('id', import_id);
      }

      // Pass list_type to determine contacts vs accounts endpoint
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
        warning: result.warning,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: SEARCH WEBSITE VISITORS (RECOMMENDED) =============
    if (action === 'search_website_visitors') {
      const { 
        import_id, 
        date_from, 
        date_to, 
        intent_levels = ['high', 'medium', 'low'],
        only_new = false,
        page = 1, 
        per_page = 25 
      } = params;

      if (!date_from || !date_to) {
        throw new Error('date_from and date_to are required');
      }

      // Update import status
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ status: 'searching' })
          .eq('id', import_id);
      }

      const result = await searchWebsiteVisitors(date_from, date_to, intent_levels, only_new, page, per_page);

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
        warning: result.warning,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: ENRICH AND IMPORT (NEW - CAMINO A) =============
    // This action: 1) Searches website visitors, 2) Enriches by domain, 3) Imports
    if (action === 'enrich_and_import') {
      const { 
        import_id,
        date_from, 
        date_to, 
        intent_levels = ['high', 'medium'],
        only_new = true,
        auto_import_contacts = false,
        max_contacts_per_company = 5,
      } = params;

      if (!date_from || !date_to) {
        throw new Error('date_from and date_to are required');
      }

      // Update import status
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ status: 'searching' })
          .eq('id', import_id);
      }

      console.log('[Enrich & Import] Step 1: Searching website visitors...');
      const visitors = await searchWebsiteVisitors(date_from, date_to, intent_levels, only_new, 1, 100);
      
      console.log(`[Enrich & Import] Found ${visitors.totalEntries} visitors, processing ${visitors.organizations.length}`);

      // Update import with total found
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ 
            total_found: visitors.totalEntries,
            status: 'importing',
          })
          .eq('id', import_id);
      }

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        enriched: 0,
        errors: [] as string[],
        empresas: [] as { id: string; name: string; apollo_org_id: string }[],
        contacts: {
          imported: 0,
          updated: 0,
          skipped: 0,
          errors: [] as string[],
        },
      };

      // Step 2: Enrich and import each visitor
      for (const org of visitors.organizations) {
        const domain = normalizeWebsite(org.website_url || org.primary_domain);
        
        let enrichedOrg = org;
        
        // Enrich by domain if we have one
        if (domain) {
          console.log(`[Enrich & Import] Enriching ${org.name} (${domain})...`);
          const enriched = await enrichOrganization(domain);
          
          if (enriched) {
            enrichedOrg = {
              ...org,
              ...enriched,
              // Keep visitor data
              visitor_data: {
                visit_date: new Date().toISOString(),
                intent_level: org.intent_level,
              },
            };
            results.enriched++;
          }
        }

        // Import to empresas
        const importResult = await importOrganizationToEmpresa(supabase, enrichedOrg, 'website_visitor');

        if (importResult.success) {
          if (importResult.action === 'created') results.imported++;
          if (importResult.action === 'updated') results.updated++;
          
          if (importResult.empresaId) {
            results.empresas.push({
              id: importResult.empresaId,
              name: org.name,
              apollo_org_id: org.id,
            });

            // Auto-import contacts if enabled
            if (auto_import_contacts && org.id) {
              try {
                const contactsResult = await searchContactsForOrganization(org.id, 1, max_contacts_per_company);
                const contactsToImport = contactsResult.contacts.slice(0, max_contacts_per_company);
                
                for (const contact of contactsToImport) {
                  const contactResult = await importContactToLead(supabase, contact, importResult.empresaId);
                  
                  if (contactResult.success) {
                    if (contactResult.action === 'created') results.contacts.imported++;
                    if (contactResult.action === 'updated') results.contacts.updated++;
                  } else {
                    results.contacts.skipped++;
                  }
                }
              } catch (contactError) {
                console.error(`[Enrich & Import] Error fetching contacts for ${org.name}:`, contactError);
              }
            }
          }
        } else {
          results.skipped++;
          if (importResult.error) results.errors.push(`${org.name}: ${importResult.error}`);
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
              enriched: results.enriched,
            },
          })
          .eq('id', import_id);
      }

      console.log(`[Enrich & Import] Complete:`, results);

      return new Response(JSON.stringify({
        success: true,
        results,
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
        max_contacts_per_company = 5,
        source = 'manual_import',
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
        contacts: {
          imported: 0,
          updated: 0,
          skipped: 0,
          errors: [] as string[],
        },
      };

      for (const org of organizations) {
        console.log(`[Visitor Import] Processing: ${org.name}`);
        
        const result = await importOrganizationToEmpresa(supabase, org, source);
        
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
                const contactsToImport = contactsResult.contacts.slice(0, max_contacts_per_company);
                
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
        .select('id, nombre, sitio_web, sector, ubicacion, empleados, apollo_org_id, apollo_intent_level, apollo_score, apollo_last_synced_at, apollo_visitor_source, apollo_visitor_date, apollo_enriched_at')
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
