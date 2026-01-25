import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

const APOLLO_API_KEY = Deno.env.get('APOLLO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============= TYPES =============

interface SFFund {
  id: string;
  name: string;
  website: string | null;
  description: string | null;
  sector_focus: string[] | null;
  founded_year: number | null;
  country_base: string | null;
}

interface EnrichmentResult {
  fundId: string;
  fundName: string;
  status: 'enriched' | 'skipped' | 'not_found' | 'error';
  fieldsUpdated: string[];
  errorMessage?: string;
}

interface BatchResult {
  totalProcessed: number;
  enriched: number;
  skipped: number;
  notFound: number;
  errors: number;
  results: EnrichmentResult[];
}

// ============= APOLLO HELPERS =============

interface ApolloOrgResult {
  id: string;
  name: string;
  website_url?: string;
  short_description?: string;
  industry?: string;
  industries?: string[];
  founded_year?: number;
  primary_domain?: string;
  logo_url?: string;
  linkedin_url?: string;
  headquarters?: {
    city?: string;
    country?: string;
  };
}

async function searchOrganizationByName(name: string): Promise<ApolloOrgResult | null> {
  if (!APOLLO_API_KEY) {
    console.error('[SF Enrich] APOLLO_API_KEY not configured');
    return null;
  }

  console.log(`[SF Enrich] Searching Apollo for: "${name}"`);

  try {
    const response = await fetch('https://api.apollo.io/v1/organizations/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
      },
      body: JSON.stringify({
        q_organization_name: name,
        page: 1,
        per_page: 5,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[SF Enrich] Apollo search error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    const organizations = data.organizations || data.accounts || [];
    
    if (organizations.length === 0) {
      console.log(`[SF Enrich] No organizations found for: "${name}"`);
      return null;
    }

    // Find best match (exact or close match)
    const nameLower = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const match = organizations.find((org: ApolloOrgResult) => {
      const orgNameLower = (org.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return orgNameLower === nameLower || 
             orgNameLower.includes(nameLower) || 
             nameLower.includes(orgNameLower);
    });

    if (match) {
      console.log(`[SF Enrich] Found match: "${match.name}"`);
      return match;
    }

    // Fallback to first result if no exact match
    console.log(`[SF Enrich] Using first result: "${organizations[0].name}"`);
    return organizations[0];
  } catch (error) {
    console.error(`[SF Enrich] Error searching Apollo:`, error);
    return null;
  }
}

async function enrichOrganizationByDomain(domain: string): Promise<ApolloOrgResult | null> {
  if (!APOLLO_API_KEY) return null;

  console.log(`[SF Enrich] Enriching by domain: "${domain}"`);

  try {
    const response = await fetch('https://api.apollo.io/v1/organizations/enrich', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': APOLLO_API_KEY,
      },
    });

    // Apollo's enrich endpoint uses query params
    const enrichUrl = `https://api.apollo.io/v1/organizations/enrich?domain=${encodeURIComponent(domain)}`;
    const enrichResponse = await fetch(enrichUrl, {
      method: 'GET',
      headers: {
        'X-Api-Key': APOLLO_API_KEY,
      },
    });

    if (!enrichResponse.ok) {
      console.warn(`[SF Enrich] Domain enrich failed: ${enrichResponse.status}`);
      return null;
    }

    const data = await enrichResponse.json();
    return data.organization || null;
  } catch (error) {
    console.error(`[SF Enrich] Error enriching domain:`, error);
    return null;
  }
}

function extractDomain(website: string | null): string | null {
  if (!website) return null;
  try {
    const url = website.startsWith('http') ? website : `https://${website}`;
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return null;
  }
}

// ============= MAIN ENRICHMENT LOGIC =============

async function enrichFund(
  supabase: ReturnType<typeof createClient>,
  fund: SFFund
): Promise<EnrichmentResult> {
  const result: EnrichmentResult = {
    fundId: fund.id,
    fundName: fund.name,
    status: 'skipped',
    fieldsUpdated: [],
  };

  try {
    let apolloOrg: ApolloOrgResult | null = null;

    // Strategy 1: Enrich by domain if website exists (more accurate)
    const domain = extractDomain(fund.website);
    if (domain) {
      apolloOrg = await enrichOrganizationByDomain(domain);
    }

    // Strategy 2: Search by name if no domain or domain search failed
    if (!apolloOrg) {
      apolloOrg = await searchOrganizationByName(fund.name);
    }

    if (!apolloOrg) {
      result.status = 'not_found';
      return result;
    }

    // Prepare update data - only update empty fields
    const updates: Partial<SFFund> = {};

    if (!fund.description && apolloOrg.short_description) {
      updates.description = apolloOrg.short_description;
      result.fieldsUpdated.push('description');
    }

    if (!fund.website && apolloOrg.website_url) {
      updates.website = apolloOrg.website_url;
      result.fieldsUpdated.push('website');
    }

    if ((!fund.sector_focus || fund.sector_focus.length === 0)) {
      const sectors = apolloOrg.industries || (apolloOrg.industry ? [apolloOrg.industry] : null);
      if (sectors && sectors.length > 0) {
        updates.sector_focus = sectors;
        result.fieldsUpdated.push('sector_focus');
      }
    }

    if (!fund.founded_year && apolloOrg.founded_year) {
      updates.founded_year = apolloOrg.founded_year;
      result.fieldsUpdated.push('founded_year');
    }

    // Apply updates if any
    if (result.fieldsUpdated.length > 0) {
      const { error } = await supabase
        .from('sf_funds')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', fund.id);

      if (error) {
        console.error(`[SF Enrich] Error updating fund ${fund.name}:`, error);
        result.status = 'error';
        result.errorMessage = error.message;
        return result;
      }

      result.status = 'enriched';
      console.log(`[SF Enrich] ✅ Updated ${fund.name}: ${result.fieldsUpdated.join(', ')}`);
    } else {
      result.status = 'skipped';
      console.log(`[SF Enrich] ⏭️ Skipped ${fund.name}: no new data available`);
    }

    return result;
  } catch (error) {
    console.error(`[SF Enrich] Error processing fund ${fund.name}:`, error);
    result.status = 'error';
    result.errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return result;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    let body: { mode?: 'preview' | 'execute'; limit?: number; fundIds?: string[] } = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is OK for preview mode
    }

    const mode = body.mode || 'preview';
    const limit = body.limit || 50;
    const fundIds = body.fundIds;

    console.log(`[SF Enrich] Mode: ${mode}, Limit: ${limit}, Specific IDs: ${fundIds?.length || 'all'}`);

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Build query for funds needing enrichment
    let query = supabase
      .from('sf_funds')
      .select('id, name, website, description, sector_focus, founded_year, country_base');

    if (fundIds && fundIds.length > 0) {
      query = query.in('id', fundIds);
    } else {
      // Find funds with incomplete data
      query = query.or('description.is.null,website.is.null,sector_focus.is.null');
    }

    query = query.limit(limit);

    const { data: funds, error: fetchError } = await query;

    if (fetchError) {
      console.error('[SF Enrich] Error fetching funds:', fetchError);
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[SF Enrich] Found ${funds?.length || 0} funds to process`);

    // Preview mode - just return counts
    if (mode === 'preview') {
      const { count: totalCount } = await supabase
        .from('sf_funds')
        .select('id', { count: 'exact', head: true });

      const { count: withDesc } = await supabase
        .from('sf_funds')
        .select('id', { count: 'exact', head: true })
        .not('description', 'is', null);

      const { count: withWebsite } = await supabase
        .from('sf_funds')
        .select('id', { count: 'exact', head: true })
        .not('website', 'is', null);

      const { count: withSectors } = await supabase
        .from('sf_funds')
        .select('id', { count: 'exact', head: true })
        .not('sector_focus', 'is', null);

      return new Response(
        JSON.stringify({
          success: true,
          mode: 'preview',
          stats: {
            total: totalCount || 0,
            withDescription: withDesc || 0,
            withWebsite: withWebsite || 0,
            withSectors: withSectors || 0,
            needsEnrichment: funds?.length || 0,
          },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Execute mode - actually enrich the funds
    const batchResult: BatchResult = {
      totalProcessed: 0,
      enriched: 0,
      skipped: 0,
      notFound: 0,
      errors: 0,
      results: [],
    };

    for (const fund of funds || []) {
      // Add delay to avoid rate limiting (Apollo allows ~60 requests/minute)
      if (batchResult.totalProcessed > 0) {
        await new Promise(resolve => setTimeout(resolve, 1100)); // ~54 requests/minute
      }

      const result = await enrichFund(supabase, fund);
      batchResult.results.push(result);
      batchResult.totalProcessed++;

      switch (result.status) {
        case 'enriched':
          batchResult.enriched++;
          break;
        case 'skipped':
          batchResult.skipped++;
          break;
        case 'not_found':
          batchResult.notFound++;
          break;
        case 'error':
          batchResult.errors++;
          break;
      }
    }

    console.log(`[SF Enrich] Batch complete: ${batchResult.enriched} enriched, ${batchResult.skipped} skipped, ${batchResult.notFound} not found, ${batchResult.errors} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        mode: 'execute',
        ...batchResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[SF Enrich] Unexpected error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
