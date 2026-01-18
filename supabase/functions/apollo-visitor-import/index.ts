import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
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
  facebook_url?: string;
  twitter_url?: string;
  industry?: string;
  estimated_num_employees?: number;
  city?: string;
  state?: string;
  country?: string;
  raw_address?: string;
  annual_revenue?: number;
  annual_revenue_printed?: string;
  intent_level?: string;
  account_score?: number;
  // Enrichment data
  founded_year?: number;
  technologies?: string[];
  current_technologies?: any[];
  keywords?: string[];
  departmental_head_count?: Record<string, number>;
  alexa_ranking?: number;
  // Extra fields from Apollo
  short_description?: string;
  seo_description?: string;
  total_funding?: number;
  total_funding_printed?: string;
  latest_funding_round_date?: string;
  latest_funding_stage?: string;
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

// Verify if a list exists and detect its type (label vs saved list)
async function verifyListExists(listId: string): Promise<{ 
  exists: boolean; 
  name?: string; 
  listType?: string;
  total?: number;
} | null> {
  console.log('[Apollo Visitor] Verifying list exists:', listId);
  
  // First, try the /v1/labels endpoint to check if it's a label/tag
  try {
    const labelsResponse = await fetch('https://api.apollo.io/v1/labels', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY!,
      },
    });
    
    if (labelsResponse.ok) {
      const labelsData = await labelsResponse.json();
      // Handle both array response and object with labels key
      const labels = Array.isArray(labelsData) ? labelsData : (labelsData.labels || []);
      
      if (Array.isArray(labels)) {
        // Look for our list ID in the labels
        const foundLabel = labels.find((label: any) => label.id === listId || label._id === listId);
        if (foundLabel) {
          const listType = foundLabel.label_type || foundLabel.modality || 'label';
          console.log(`[Apollo Visitor] ✅ Found list via labels: "${foundLabel.name}" (type: ${listType}, cached_count: ${foundLabel.cached_count})`);
          return { 
            exists: true, 
            name: foundLabel.name,
            listType: 'label', // Force 'label' type since this comes from /v1/labels endpoint
            total: foundLabel.cached_count,
          };
        }
        console.log(`[Apollo Visitor] List ${listId} not found in labels endpoint`);
      }
    } else {
      console.log('[Apollo Visitor] Labels endpoint returned:', labelsResponse.status);
    }
  } catch (e) {
    console.log('[Apollo Visitor] Error checking labels:', e);
  }
  
  // If not found in labels, assume it's a saved list
  console.log(`[Apollo Visitor] List ${listId} not found in labels, assuming it's a saved list`);
  return { 
    exists: true, 
    name: 'Lista guardada',
    listType: 'saved_list',
  };
}

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
// Supports both contact lists and account lists, and detects labels vs saved lists
// WARNING: This ONLY works for items already in Apollo CRM, not "net new"
// Now with FULL PAGINATION to fetch ALL results
async function searchOrganizationsFromList(
  listId: string,
  listType: 'contacts' | 'accounts' = 'accounts',
  maxResults: number = 2000 // Safety limit
): Promise<{ organizations: ApolloOrganization[]; totalEntries: number; pagination: any; warning?: string }> {
  
  console.log('[Apollo API] Searching from list:', { listId, listType, maxResults });
  
  // First, verify if this is a label or a saved list
  const listCheck = await verifyListExists(listId);
  const isLabel = listCheck?.listType === 'label';
  const filterParam = isLabel ? 'label_ids' : (listType === 'contacts' ? 'contact_list_ids' : 'account_list_ids');
  console.log(`[Apollo Visitor] List type detected: "${listCheck?.listType}", using ${filterParam}`);
  
  let allOrganizations: ApolloOrganization[] = [];
  let totalEntries = 0;
  let lastPagination: any = {};
  const perPage = 100; // Max per page for Apollo API
  let currentPage = 1;
  let hasMore = true;

  if (listType === 'contacts') {
    // Paginate through contacts/search
    const orgMap = new Map<string, ApolloOrganization>();
    
    while (hasMore && allOrganizations.length < maxResults) {
      const requestBody: Record<string, unknown> = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (isLabel) {
        requestBody.label_ids = [listId];
      } else {
        requestBody.contact_list_ids = [listId];
      }

      console.log(`[Apollo API] contacts/search page ${currentPage}...`);
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
      lastPagination = data.pagination;

      console.log(`[Apollo API] Page ${currentPage}: ${contacts.length} contacts (total: ${totalEntries})`);
      
      // Extract organizations from contacts
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

      hasMore = contacts.length === perPage && (currentPage * perPage) < totalEntries;
      currentPage++;
      
      // Rate limiting: small delay between pages
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    allOrganizations = Array.from(orgMap.values());
    console.log(`[Apollo API] Total: ${totalEntries} contacts → ${allOrganizations.length} unique organizations`);
    
  } else {
    // Paginate through accounts/search
    while (hasMore && allOrganizations.length < maxResults) {
      const requestBody: Record<string, unknown> = {
        page: currentPage,
        per_page: perPage,
      };
      
      if (isLabel) {
        requestBody.label_ids = [listId];
      } else {
        requestBody.account_list_ids = [listId];
      }

      console.log(`[Apollo API] accounts/search page ${currentPage}...`);
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
      const accounts = data.accounts || [];
      totalEntries = data.pagination?.total_entries || 0;
      lastPagination = data.pagination;

      console.log(`[Apollo API] Page ${currentPage}: ${accounts.length} accounts (total: ${totalEntries})`);
      
      // Log sample fields for debugging
      if (currentPage === 1 && accounts.length > 0) {
        console.log('[Apollo API] Sample account fields:', Object.keys(accounts[0]));
        console.log('[Apollo API] Sample account data:', JSON.stringify(accounts[0], null, 2).substring(0, 1000));
      }
      
      // Normalize Apollo fields to ensure consistent mapping
      const normalizedAccounts = accounts.map((acc: any) => ({
        id: acc.id,
        name: acc.name,
        website_url: acc.website_url,
        primary_domain: acc.primary_domain || acc.domain,
        linkedin_url: acc.linkedin_url,
        facebook_url: acc.facebook_url,
        twitter_url: acc.twitter_url,
        industry: acc.industry || acc.organization_industry,
        estimated_num_employees: acc.estimated_num_employees || acc.employee_count,
        city: acc.city || acc.organization_city,
        state: acc.state || acc.organization_state,
        country: acc.country || acc.organization_country,
        annual_revenue: acc.annual_revenue,
        annual_revenue_printed: acc.annual_revenue_printed,
        intent_level: acc.intent_level || acc.website_visitor_intent_level,
        account_score: acc.account_score || acc.score,
        founded_year: acc.founded_year,
        keywords: acc.keywords,
        current_technologies: acc.current_technologies || acc.technologies,
        departmental_head_count: acc.departmental_head_count,
        alexa_ranking: acc.alexa_ranking,
        short_description: acc.short_description || acc.seo_description,
        logo_url: acc.logo_url,
        phone: acc.phone,
        raw_address: acc.raw_address,
        organization_id: acc.organization_id || acc.id,
      }));
      
      allOrganizations.push(...normalizedAccounts);

      // Fixed pagination: continue while there are more results
      hasMore = accounts.length > 0 && allOrganizations.length < totalEntries && allOrganizations.length < maxResults;
      currentPage++;
      
      // Rate limiting: small delay between pages
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    console.log(`[Apollo API] Total fetched: ${allOrganizations.length} accounts of ${totalEntries}`);
  }

  // Warning about CRM-only limitation
  const labelInfo = isLabel ? ' (Label/Tag detectado)' : '';
  const pagesInfo = currentPage > 2 ? ` [${currentPage - 1} páginas]` : '';
  const warning = listType === 'contacts'
    ? `ℹ️ Lista de contactos${labelInfo}: ${totalEntries} contactos → ${allOrganizations.length} empresas únicas.${pagesInfo}`
    : `✅ Lista de cuentas${labelInfo}: ${allOrganizations.length} de ${totalEntries} empresas.${pagesInfo}`;

  return {
    organizations: allOrganizations,
    totalEntries,
    pagination: lastPagination,
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

// Enrich people by IDs to get email/phone data
// Uses bulk_match endpoint which reveals contact details (1 credit per person)
async function enrichPeopleBulk(
  personIds: string[]
): Promise<ApolloPerson[]> {
  if (personIds.length === 0) return [];
  
  console.log(`[Apollo API] Enriching ${personIds.length} people via bulk_match...`);
  
  const response = await fetch('https://api.apollo.io/api/v1/people/bulk_match', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY!,
    },
    body: JSON.stringify({
      details: personIds.map(id => ({ id })),
      reveal_personal_emails: false,
      reveal_phone_number: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Apollo API] bulk_match failed:', response.status, errorText);
    // Don't throw - return empty array so search results still work
    return [];
  }

  const data = await response.json();
  const matches = data.matches || [];
  console.log(`[Apollo API] Enriched ${matches.length} people with contact details`);
  
  return matches;
}

async function searchContactsForOrganization(
  apolloOrgId: string,
  page: number = 1,
  perPage: number = 25
): Promise<{ contacts: ApolloPerson[]; totalEntries: number; pagination: any }> {
  console.log(`[Apollo API] Searching contacts for org: ${apolloOrgId}, page: ${page}, perPage: ${perPage}`);
  
  // STEP 1: Search for people using the correct endpoint and parameter
  // api/v1/mixed_people/api_search is the current endpoint (free, no credits)
  const response = await fetch('https://api.apollo.io/api/v1/mixed_people/api_search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': APOLLO_API_KEY!,
    },
    body: JSON.stringify({
      q_organization_ids: [apolloOrgId], // Correct parameter name
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
    console.error('[Apollo API] mixed_people/api_search error:', response.status, errorText);
    throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const basicPeople = data.people || [];
  const totalEntries = data.pagination?.total_entries || 0;
  
  console.log('[Apollo API] Found', basicPeople.length, 'contacts for org:', apolloOrgId, '(total:', totalEntries, ')');

  if (basicPeople.length === 0) {
    return {
      contacts: [],
      totalEntries: 0,
      pagination: data.pagination,
    };
  }

  // STEP 2: Enrich with email and phone data (bulk_match)
  // Limit to first 10 to save Apollo credits
  const peopleToEnrich = basicPeople.slice(0, 10);
  const personIds = peopleToEnrich.map((p: ApolloPerson) => p.id);
  const enrichedPeople = await enrichPeopleBulk(personIds);

  // STEP 3: Combine basic search data with enriched contact details
  const contacts: ApolloPerson[] = basicPeople.map((basic: ApolloPerson) => {
    const enriched = enrichedPeople.find((e: ApolloPerson) => e.id === basic.id);
    return {
      id: basic.id,
      first_name: basic.first_name,
      last_name: basic.last_name,
      name: basic.name || `${basic.first_name} ${basic.last_name}`,
      title: basic.title,
      linkedin_url: enriched?.linkedin_url || basic.linkedin_url,
      organization_id: basic.organization_id,
      organization: basic.organization,
      // Enriched data (only available if person was enriched)
      email: enriched?.email || null,
      email_status: enriched?.email_status || null,
      phone_numbers: enriched?.phone_numbers || [],
    };
  });

  console.log('[Apollo API] Contacts with email:', contacts.filter((c: ApolloPerson) => c.email).length);

  return {
    contacts,
    totalEntries,
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
      sector: org.industry || null, // Allow NULL for companies without industry
      ubicacion: [org.city, org.state, org.country].filter(Boolean).join(', ') || null,
      empleados: org.estimated_num_employees || null, // Keep as integer, not string
      // NEW: Enhanced Apollo data mapping
      facturacion: org.annual_revenue || null,
      linkedin_url: org.linkedin_url || null,
      facebook_url: org.facebook_url || null,
      founded_year: org.founded_year || null,
      keywords: org.keywords || null,
      technologies: org.current_technologies || org.technologies || null,
      departmental_headcount: org.departmental_head_count || null,
      alexa_ranking: org.alexa_ranking || null,
      // Apollo sync metadata
      apollo_org_id: org.id,
      apollo_intent_level: org.intent_level,
      apollo_score: org.account_score,
      apollo_last_synced_at: new Date().toISOString(),
      apollo_raw_data: org,
      // Track source and visitor date
      apollo_visitor_source: source,
      apollo_visitor_date: org.visitor_data?.visit_date || null,
    };

    if (existing) {
      // Update existing empresa with Apollo data (enhanced mapping)
      const { error } = await supabase
        .from('empresas')
        .update({
          // Enhanced Apollo data
          facturacion: org.annual_revenue || null,
          linkedin_url: org.linkedin_url || null,
          facebook_url: org.facebook_url || null,
          founded_year: org.founded_year || null,
          keywords: org.keywords || null,
          technologies: org.current_technologies || org.technologies || null,
          departmental_headcount: org.departmental_head_count || null,
          alexa_ranking: org.alexa_ranking || null,
          // Apollo sync metadata
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
  // Handle CORS preflight - MUST return 200 with headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    // Check API key upfront with proper CORS response
    if (!APOLLO_API_KEY) {
      console.error('[apollo-visitor-import] APOLLO_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'APOLLO_API_KEY not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Safely parse JSON body with dedicated error handling
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[apollo-visitor-import] JSON parse error:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
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
      const { import_id, list_id, list_type = 'contacts', max_results = 2000 } = params;

      // Update import status
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ status: 'searching' })
          .eq('id', import_id);
      }

      // FIX: Pass correct arguments - listId, listType, maxResults (not page/per_page)
      // searchOrganizationsFromList handles pagination internally
      console.log(`[Search Orgs] Starting search: list=${list_id}, type=${list_type}, max=${max_results}`);
      const result = await searchOrganizationsFromList(list_id, list_type, max_results);
      console.log(`[Search Orgs] Search complete: found=${result.organizations.length}, total=${result.totalEntries}`);

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

      // Update import with total found (from Apollo's total_entries, not just what we fetched)
      if (import_id) {
        await supabase
          .from('apollo_visitor_imports')
          .update({ 
            total_found: result.totalEntries,
            status: 'previewing',
            import_type: list_type === 'contacts' ? 'contacts' : 'organizations',
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

    // ============= ACTION: DELETE IMPORT =============
    if (action === 'delete_import') {
      const { import_id } = params;
      
      if (!import_id) {
        throw new Error('import_id is required');
      }
      
      console.log('[Apollo Visitor] Deleting import:', import_id);
      
      const { error } = await supabase
        .from('apollo_visitor_imports')
        .delete()
        .eq('id', import_id);

      if (error) {
        throw new Error(`Failed to delete import: ${error.message}`);
      }

      console.log('[Apollo Visitor] Import deleted successfully:', import_id);

      return new Response(JSON.stringify({
        success: true,
        message: 'Import deleted successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: GET IMPORTED EMPRESAS =============
    if (action === 'get_imported_empresas') {
      // Fetch ALL empresas with apollo_org_id (no limit)
      const { data, error, count } = await supabase
        .from('empresas')
        .select('id, nombre, sitio_web, sector, ubicacion, empleados, apollo_org_id, apollo_intent_level, apollo_score, apollo_last_synced_at, apollo_visitor_source, apollo_visitor_date, apollo_enriched_at', { count: 'exact' })
        .not('apollo_org_id', 'is', null)
        .order('apollo_last_synced_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch empresas: ${error.message}`);
      }

      console.log(`[Get Empresas] Fetched all ${data?.length || 0} empresas`);

      return new Response(JSON.stringify({
        success: true,
        empresas: data,
        total: count,
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
