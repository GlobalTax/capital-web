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
  founded_year?: number;
  technologies?: string[];
  current_technologies?: any[];
  keywords?: string[];
  short_description?: string;
  seo_description?: string;
  phone?: string;
  logo_url?: string;
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

async function findExistingBoutique(
  supabase: ReturnType<typeof createClient>,
  org: ApolloOrganization
): Promise<{ id: string; action: 'exists' } | null> {
  // 1. By apollo_org_id
  if (org.id) {
    const { data } = await supabase
      .from('mna_boutiques')
      .select('id')
      .eq('apollo_org_id', org.id)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (data) return { id: data.id, action: 'exists' };
  }

  // 2. By website domain
  const domain = normalizeWebsite(org.website_url || org.primary_domain);
  if (domain) {
    const { data } = await supabase
      .from('mna_boutiques')
      .select('id')
      .or(`website.ilike.%${domain}%`)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (data) return { id: data.id, action: 'exists' };
  }

  // 3. By name (exact match)
  if (org.name) {
    const { data } = await supabase
      .from('mna_boutiques')
      .select('id')
      .ilike('name', org.name.trim())
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (data) return { id: data.id, action: 'exists' };
  }

  return null;
}

// ============= APOLLO API FUNCTIONS =============

// Verify if a list exists and detect its type
async function verifyListExists(listId: string): Promise<{ 
  exists: boolean; 
  name?: string; 
  listType?: string;
  total?: number;
} | null> {
  console.log('[MNA Apollo Visitor] Verifying list exists:', listId);
  
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
      const labels = Array.isArray(labelsData) ? labelsData : (labelsData.labels || []);
      
      if (Array.isArray(labels)) {
        const foundLabel = labels.find((label: any) => label.id === listId || label._id === listId);
        if (foundLabel) {
          const listType = foundLabel.label_type || foundLabel.modality || 'label';
          console.log(`[MNA Apollo Visitor] ✅ Found list via labels: "${foundLabel.name}" (type: ${listType}, cached_count: ${foundLabel.cached_count})`);
          return { 
            exists: true, 
            name: foundLabel.name,
            listType: 'label',
            total: foundLabel.cached_count,
          };
        }
      }
    }
  } catch (e) {
    console.log('[MNA Apollo Visitor] Error checking labels:', e);
  }
  
  console.log(`[MNA Apollo Visitor] List ${listId} not found in labels, assuming saved list`);
  return { 
    exists: true, 
    name: 'Lista guardada',
    listType: 'saved_list',
  };
}

// Search website visitors using mixed_companies/search
async function searchWebsiteVisitors(
  dateFrom: string,
  dateTo: string,
  intentLevels: string[] = ['high', 'medium', 'low'],
  onlyNew: boolean = false,
  page: number = 1,
  perPage: number = 25
): Promise<{ organizations: ApolloOrganization[]; totalEntries: number; pagination: any; warning?: string }> {
  
  console.log('[Apollo API] Searching website visitors for MNA:', { dateFrom, dateTo, intentLevels, onlyNew });

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

  // Filter for M&A related industries/keywords
  // These are typical industries for M&A boutiques
  const mnaIndustries = [
    'financial services',
    'investment banking',
    'management consulting',
    'professional services',
    'legal services',
    'accounting',
    'business consulting',
  ];

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

// Enrich organization by domain
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
    console.log(`[Apollo Enrich] No data for domain ${domain}: ${response.status}`);
    return null;
  }

  const data = await response.json();
  console.log('[Apollo Enrich] Success for domain:', domain, '- Org:', data.organization?.name);
  
  return data.organization || null;
}

// ============= IMPORT FUNCTIONS =============

async function importOrganizationToBoutique(
  supabase: ReturnType<typeof createClient>,
  org: ApolloOrganization,
  source: string = 'visitor_import'
): Promise<{ success: boolean; action: 'created' | 'updated' | 'skipped'; boutiqueId?: string; error?: string }> {
  try {
    const existing = await findExistingBoutique(supabase, org);

    // Determine specialization based on industry
    let specialization: string = 'generalist';
    const industry = (org.industry || '').toLowerCase();
    if (industry.includes('tech') || industry.includes('software')) {
      specialization = 'tech';
    } else if (industry.includes('healthcare') || industry.includes('pharma')) {
      specialization = 'healthcare';
    } else if (industry.includes('financial') || industry.includes('banking')) {
      specialization = 'financial_services';
    } else if (industry.includes('industrial') || industry.includes('manufacturing')) {
      specialization = 'industrial';
    } else if (industry.includes('consumer') || industry.includes('retail')) {
      specialization = 'consumer';
    }

    // Determine tier based on employee count
    let tier: string = 'local';
    const employees = org.estimated_num_employees || 0;
    if (employees > 100) {
      tier = 'global';
    } else if (employees > 50) {
      tier = 'regional';
    } else if (employees > 10) {
      tier = 'boutique';
    }

    const boutiqueData = {
      name: org.name,
      website: org.website_url || org.primary_domain || null,
      linkedin_url: org.linkedin_url || null,
      cities: org.city ? [org.city] : null,
      country_base: org.country || 'España',
      description: org.short_description || org.seo_description || null,
      specialization,
      tier,
      status: 'active' as const,
      // Apollo data
      apollo_org_id: org.id,
      apollo_raw_data: org,
      apollo_last_synced_at: new Date().toISOString(),
      // Source tracking
      import_source: source,
      founded_year: org.founded_year || null,
    };

    if (existing) {
      // Update existing boutique
      const { error } = await supabase
        .from('mna_boutiques')
        .update({
          website: org.website_url || org.primary_domain || null,
          linkedin_url: org.linkedin_url || null,
          description: org.short_description || org.seo_description || null,
          apollo_org_id: org.id,
          apollo_raw_data: org,
          apollo_last_synced_at: new Date().toISOString(),
        })
        .eq('id', existing.id);

      if (error) {
        console.error('[MNA Visitor Import] Update error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[MNA Visitor Import] Updated boutique:', org.name, existing.id);
      return { success: true, action: 'updated', boutiqueId: existing.id };
    }

    // Create new boutique
    const { data: newBoutique, error } = await supabase
      .from('mna_boutiques')
      .insert(boutiqueData)
      .select('id')
      .single();

    if (error) {
      console.error('[MNA Visitor Import] Insert error:', error);
      return { success: false, action: 'skipped', error: error.message };
    }

    console.log('[MNA Visitor Import] Created boutique:', org.name, newBoutique.id);
    return { success: true, action: 'created', boutiqueId: newBoutique.id };
  } catch (error) {
    console.error('[MNA Visitor Import] Error:', error);
    return { success: false, action: 'skipped', error: String(error) };
  }
}

// ============= MAIN HANDLER =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    if (!APOLLO_API_KEY) {
      console.error('[mna-apollo-visitor-import] APOLLO_API_KEY not configured');
      return new Response(JSON.stringify({
        success: false,
        error: 'APOLLO_API_KEY not configured',
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[mna-apollo-visitor-import] JSON parse error:', parseError);
      return new Response(JSON.stringify({
        success: false,
        error: 'Invalid JSON body',
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const { action, ...params } = body;
    console.log('[mna-apollo-visitor-import] Action:', action, 'Params:', JSON.stringify(params));

    // ============= ACTION: CREATE IMPORT JOB =============
    if (action === 'create_import') {
      const { list_id, list_type = 'website_visitors', user_id } = params;
      
      const { data: importJob, error } = await supabase
        .from('mna_apollo_visitor_imports')
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

    // ============= ACTION: SEARCH WEBSITE VISITORS =============
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

      if (import_id) {
        await supabase
          .from('mna_apollo_visitor_imports')
          .update({ status: 'previewing' })
          .eq('id', import_id);
      }

      const result = await searchWebsiteVisitors(
        date_from as string, 
        date_to as string, 
        intent_levels as string[], 
        only_new as boolean, 
        page as number, 
        per_page as number
      );

      // Check which organizations already exist in boutiques
      const orgsWithStatus = await Promise.all(
        result.organizations.map(async (org) => {
          const existing = await findExistingBoutique(supabase, org);
          return {
            ...org,
            existsInBoutiques: !!existing,
            existingBoutiqueId: existing?.id,
          };
        })
      );

      if (import_id) {
        await supabase
          .from('mna_apollo_visitor_imports')
          .update({ 
            total_found: result.totalEntries,
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

    // ============= ACTION: IMPORT ORGANIZATIONS AS BOUTIQUES =============
    if (action === 'import_organizations') {
      const { organizations, import_id } = params;
      
      if (!organizations || !Array.isArray(organizations) || organizations.length === 0) {
        throw new Error('No organizations to import');
      }

      if (import_id) {
        await supabase
          .from('mna_apollo_visitor_imports')
          .update({ status: 'importing' })
          .eq('id', import_id);
      }

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: [] as string[],
        boutiques: [] as { id: string; name: string; apollo_org_id: string }[],
      };

      const boutiqueIds: string[] = [];

      for (const org of organizations) {
        const result = await importOrganizationToBoutique(supabase, org, 'visitor_import');
        
        if (result.success) {
          if (result.action === 'created') {
            results.imported++;
          } else if (result.action === 'updated') {
            results.updated++;
          }
          
          if (result.boutiqueId) {
            boutiqueIds.push(result.boutiqueId);
            results.boutiques.push({
              id: result.boutiqueId,
              name: org.name,
              apollo_org_id: org.id,
            });
          }
        } else {
          results.skipped++;
          if (result.error) {
            results.errors.push(`${org.name}: ${result.error}`);
          }
        }
      }

      // Update import with final results
      if (import_id) {
        await supabase
          .from('mna_apollo_visitor_imports')
          .update({ 
            status: 'completed',
            total_imported: results.imported,
            total_updated: results.updated,
            total_skipped: results.skipped,
            total_errors: results.errors.length,
            imported_boutique_ids: boutiqueIds,
            imported_data: results,
            error_log: results.errors.length > 0 ? results.errors : null,
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

    // ============= ACTION: ENRICH AND IMPORT =============
    if (action === 'enrich_and_import') {
      const { 
        import_id,
        date_from, 
        date_to, 
        intent_levels = ['high', 'medium'],
        only_new = true,
      } = params;

      if (!date_from || !date_to) {
        throw new Error('date_from and date_to are required');
      }

      if (import_id) {
        await supabase
          .from('mna_apollo_visitor_imports')
          .update({ status: 'importing' })
          .eq('id', import_id);
      }

      console.log('[MNA Enrich & Import] Step 1: Searching website visitors...');
      const visitors = await searchWebsiteVisitors(
        date_from as string, 
        date_to as string, 
        intent_levels as string[], 
        only_new as boolean, 
        1, 
        100
      );
      
      console.log(`[MNA Enrich & Import] Found ${visitors.totalEntries} visitors, processing ${visitors.organizations.length}`);

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        enriched: 0,
        errors: [] as string[],
        boutiques: [] as { id: string; name: string; apollo_org_id: string }[],
      };

      const boutiqueIds: string[] = [];

      for (const org of visitors.organizations) {
        // Try to enrich if we have a domain
        let enrichedOrg = org;
        const domain = normalizeWebsite(org.website_url || org.primary_domain);
        
        if (domain) {
          try {
            const enriched = await enrichOrganization(domain);
            if (enriched) {
              enrichedOrg = { ...org, ...enriched };
              results.enriched++;
            }
          } catch (e) {
            console.log(`[MNA Enrich] Failed to enrich ${domain}:`, e);
          }
        }

        const result = await importOrganizationToBoutique(supabase, enrichedOrg, 'enrich_import');
        
        if (result.success) {
          if (result.action === 'created') {
            results.imported++;
          } else if (result.action === 'updated') {
            results.updated++;
          }
          
          if (result.boutiqueId) {
            boutiqueIds.push(result.boutiqueId);
            results.boutiques.push({
              id: result.boutiqueId,
              name: enrichedOrg.name,
              apollo_org_id: enrichedOrg.id,
            });
          }
        } else {
          results.skipped++;
          if (result.error) {
            results.errors.push(`${enrichedOrg.name}: ${result.error}`);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (import_id) {
        await supabase
          .from('mna_apollo_visitor_imports')
          .update({ 
            status: 'completed',
            total_found: visitors.totalEntries,
            total_imported: results.imported,
            total_updated: results.updated,
            total_skipped: results.skipped,
            total_errors: results.errors.length,
            imported_boutique_ids: boutiqueIds,
            imported_data: results,
            error_log: results.errors.length > 0 ? results.errors : null,
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

    // ============= ACTION: GET HISTORY =============
    if (action === 'get_history') {
      const { limit = 20 } = params;
      
      const { data: imports, error } = await supabase
        .from('mna_apollo_visitor_imports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit as number);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        imports,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: GET IMPORTED BOUTIQUES =============
    if (action === 'get_imported_boutiques') {
      const { data: boutiques, error, count } = await supabase
        .from('mna_boutiques')
        .select('id, name, website, cities, country_base, specialization, tier, status, apollo_org_id, apollo_last_synced_at', { count: 'exact' })
        .not('apollo_org_id', 'is', null)
        .eq('is_deleted', false)
        .order('apollo_last_synced_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
        boutiques,
        total: count || 0,
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

      const { error } = await supabase
        .from('mna_apollo_visitor_imports')
        .delete()
        .eq('id', import_id);

      if (error) throw error;

      return new Response(JSON.stringify({
        success: true,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('[mna-apollo-visitor-import] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});