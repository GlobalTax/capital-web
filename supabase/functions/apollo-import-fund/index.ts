import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ApolloOrganization {
  id: string;
  name: string;
  website_url: string | null;
  primary_domain: string | null;
  linkedin_url: string | null;
  industry: string | null;
  short_description: string | null;
  founded_year: number | null;
  city: string | null;
  state: string | null;
  country: string | null;
  estimated_num_employees: number | null;
  annual_revenue: number | null;
  annual_revenue_printed: string | null;
  logo_url: string | null;
}

interface ImportFundResult {
  name: string;
  website: string | null;
  source_url: string | null;
  description: string | null;
  country_base: string | null;
  cities: string[];
  founded_year: number | null;
  sector_focus: string[];
  apollo_org_id: string;
  logo_url: string | null;
}

function parseApolloInput(input: string): { type: 'apollo_id' | 'domain' | 'search'; value: string } {
  const trimmed = input.trim();
  
// Apollo organization URL: 
  // - https://app.apollo.io/#/companies/5e66b6381e05b4008c8331b8
  // - https://app.apollo.io/#/accounts/67dc122e71f6900014360594
  if (trimmed.includes('apollo.io')) {
    // Check for /companies/ pattern
    const companiesMatch = trimmed.match(/\/companies\/([a-f0-9]+)/i);
    if (companiesMatch) return { type: 'apollo_id', value: companiesMatch[1] };
    
    // Check for /accounts/ pattern (also valid for organizations)
    const accountsMatch = trimmed.match(/\/accounts\/([a-f0-9]+)/i);
    if (accountsMatch) return { type: 'apollo_id', value: accountsMatch[1] };
  }
  
  // Domain pattern: example.com or www.example.com
  if (trimmed.match(/^[a-z0-9.-]+\.[a-z]{2,}$/i)) {
    return { type: 'domain', value: trimmed.replace(/^www\./, '') };
  }
  
  // Full URL: https://example.com/...
  if (trimmed.startsWith('http')) {
    try {
      const url = new URL(trimmed);
      return { type: 'domain', value: url.hostname.replace(/^www\./, '') };
    } catch {
      // Invalid URL, treat as search
    }
  }
  
  // Default: search by name
  return { type: 'search', value: trimmed };
}

async function enrichByDomain(apiKey: string, domain: string): Promise<ApolloOrganization | null> {
  console.log('[Apollo Import Fund] Enriching by domain:', domain);
  
  const response = await fetch('https://api.apollo.io/api/v1/organizations/enrich', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ domain }),
  });
  
  if (!response.ok) {
    console.error('[Apollo Import Fund] Enrich failed:', response.status);
    return null;
  }
  
  const data = await response.json();
  return data.organization || null;
}

async function searchByName(apiKey: string, name: string): Promise<ApolloOrganization | null> {
  console.log('[Apollo Import Fund] Searching by name:', name);
  
  const response = await fetch('https://api.apollo.io/api/v1/mixed_companies/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({
      q_organization_name: name,
      per_page: 1,
    }),
  });
  
  if (!response.ok) {
    console.error('[Apollo Import Fund] Search failed:', response.status);
    return null;
  }
  
  const data = await response.json();
  const organizations = data.organizations || data.accounts || [];
  return organizations[0] || null;
}

async function getOrganizationById(apiKey: string, id: string): Promise<ApolloOrganization | null> {
  console.log('[Apollo Import Fund] Getting org by ID:', id);
  
  // Apollo doesn't have a direct get-by-id endpoint for organizations
  // We'll use the enrichment search approach instead
  const response = await fetch('https://api.apollo.io/api/v1/organizations/enrich', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': apiKey,
    },
    body: JSON.stringify({ organization_id: id }),
  });
  
  if (!response.ok) {
    console.error('[Apollo Import Fund] Get by ID failed:', response.status);
    return null;
  }
  
  const data = await response.json();
  return data.organization || null;
}

function mapApolloToFundData(org: ApolloOrganization): ImportFundResult {
  return {
    name: org.name,
    website: org.website_url || (org.primary_domain ? `https://${org.primary_domain}` : null),
    source_url: org.linkedin_url || null,
    description: org.short_description || null,
    country_base: org.country || null,
    cities: org.city ? [org.city] : [],
    founded_year: org.founded_year || null,
    sector_focus: org.industry ? [org.industry] : [],
    apollo_org_id: org.id,
    logo_url: org.logo_url || null,
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const APOLLO_API_KEY = Deno.env.get('APOLLO_API_KEY');
    if (!APOLLO_API_KEY) {
      throw new Error('APOLLO_API_KEY not configured');
    }

    const { input } = await req.json();
    if (!input || typeof input !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Input is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = parseApolloInput(input);
    console.log('[Apollo Import Fund] Parsed input:', parsed);

    let organization: ApolloOrganization | null = null;

    switch (parsed.type) {
      case 'apollo_id':
        organization = await getOrganizationById(APOLLO_API_KEY, parsed.value);
        break;
      case 'domain':
        organization = await enrichByDomain(APOLLO_API_KEY, parsed.value);
        break;
      case 'search':
        organization = await searchByName(APOLLO_API_KEY, parsed.value);
        break;
    }

    if (!organization) {
      return new Response(
        JSON.stringify({ error: 'Organization not found', input_type: parsed.type }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const fundData = mapApolloToFundData(organization);
    console.log('[Apollo Import Fund] Mapped fund data:', fundData.name);

    return new Response(
      JSON.stringify({ success: true, data: fundData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Apollo Import Fund] Error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
