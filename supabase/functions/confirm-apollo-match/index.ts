import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Decision maker titles for People Search
const DECISION_MAKER_TITLES = [
  'CEO', 'CFO', 'COO', 'CTO', 'CMO',
  'Founder', 'Co-Founder', 'Owner',
  'Managing Director', 'General Manager', 'Director General',
  'President', 'Vice President',
  'Partner', 'Socio', 'Gerente',
];

interface ApolloOrgData {
  id: string;
  name: string;
  primary_domain?: string;
  linkedin_url?: string;
  twitter_url?: string;
  facebook_url?: string;
  website_url?: string;
  logo_url?: string;
  industry?: string;
  industries?: string[];
  estimated_num_employees?: number;
  annual_revenue?: number;
  annual_revenue_printed?: string;
  city?: string;
  state?: string;
  country?: string;
  short_description?: string;
  founded_year?: number;
  keywords?: string[];
  phone?: string;
  technology_names?: string[];
}

// Summarize org data for storage
function summarizeOrgData(org: any): ApolloOrgData {
  return {
    id: org.id,
    name: org.name,
    primary_domain: org.primary_domain,
    linkedin_url: org.linkedin_url,
    twitter_url: org.twitter_url,
    facebook_url: org.facebook_url,
    website_url: org.website_url,
    logo_url: org.logo_url,
    industry: org.industry,
    industries: org.industries?.slice(0, 5),
    estimated_num_employees: org.estimated_num_employees,
    annual_revenue: org.annual_revenue,
    annual_revenue_printed: org.annual_revenue_printed,
    city: org.city,
    state: org.state,
    country: org.country,
    short_description: org.short_description?.slice(0, 500),
    founded_year: org.founded_year,
    keywords: org.keywords?.slice(0, 10),
    phone: org.phone,
    technology_names: org.technology_names?.slice(0, 10),
  };
}

// Apollo API call with retry
async function apolloFetch(endpoint: string, options: RequestInit, apiKey: string, retries = 1): Promise<Response> {
  const url = `https://api.apollo.io/v1${endpoint}`;
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'X-Api-Key': apiKey,
  };

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 429) {
        if (attempt < retries) {
          console.log(`Apollo rate limited, waiting before retry...`);
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        throw new Error('Apollo API rate limit exceeded. Please try again later.');
      }
      
      return response;
    } catch (error) {
      if (attempt === retries) throw error;
      console.log(`Apollo request failed, retrying...`);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  
  throw new Error('Apollo API request failed after retries');
}

// Enrich organization by domain
async function enrichByDomain(domain: string, apiKey: string): Promise<{ success: boolean; org?: ApolloOrgData; error?: string }> {
  try {
    const response = await apolloFetch(
      `/organizations/enrich?domain=${encodeURIComponent(domain)}`,
      { method: 'GET' },
      apiKey
    );
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Apollo enrich error:', response.status, text);
      return { success: false, error: `Apollo API error: ${response.status}` };
    }
    
    const data = await response.json();
    if (!data.organization) {
      return { success: false, error: 'No organization data returned' };
    }
    
    return { success: true, org: summarizeOrgData(data.organization) };
  } catch (error) {
    console.error('Apollo enrich exception:', error);
    return { success: false, error: error.message || 'Failed to enrich organization' };
  }
}

// Search for decision makers
async function searchPeople(orgId: string, apiKey: string): Promise<any[]> {
  try {
    const response = await apolloFetch(
      '/mixed_people/search',
      {
        method: 'POST',
        body: JSON.stringify({
          organization_ids: [orgId],
          person_titles: DECISION_MAKER_TITLES,
          person_locations: ['Spain', 'España'],
          page: 1,
          per_page: 5,
        }),
      },
      apiKey
    );
    
    if (!response.ok) {
      console.warn('Apollo people search failed:', response.status);
      return [];
    }
    
    const data = await response.json();
    return (data.people || []).map((p: any) => ({
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      name: p.name,
      title: p.title,
      seniority: p.seniority,
      linkedin_url: p.linkedin_url,
      email: p.email,
      email_status: p.email_status,
      city: p.city,
      country: p.country,
    }));
  } catch (error) {
    console.warn('People search exception:', error);
    return [];
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get Apollo API key
    const apolloApiKey = Deno.env.get("APOLLO_API_KEY");
    if (!apolloApiKey) {
      console.error("APOLLO_API_KEY not configured");
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: "Apollo API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate authorization
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify JWT
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      console.error("JWT validation failed:", claimsError);
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request body
    const { lead_id, apollo_org_id } = await req.json();
    if (!lead_id || !apollo_org_id) {
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: "lead_id and apollo_org_id are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Confirming Apollo match for lead: ${lead_id}, org: ${apollo_org_id}`);

    // Fetch the lead with candidates
    const { data: lead, error: leadError } = await supabase
      .from("company_valuations")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      console.error("Lead not found:", leadError);
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: "Lead not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find the selected candidate
    const candidates = lead.apollo_candidates as any[] || [];
    const selectedCandidate = candidates.find(c => c.id === apollo_org_id);
    
    if (!selectedCandidate) {
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: "Selected organization not found in candidates" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Selected candidate: ${selectedCandidate.name}, domain: ${selectedCandidate.primary_domain}`);

    // Mark as running
    await supabase
      .from("company_valuations")
      .update({ apollo_status: 'running', apollo_error: null })
      .eq("id", lead_id);

    let orgData: ApolloOrgData;
    let errorMessage: string | null = null;

    // Try to enrich the selected organization
    if (selectedCandidate.primary_domain) {
      const enrichResult = await enrichByDomain(selectedCandidate.primary_domain, apolloApiKey);
      if (enrichResult.success && enrichResult.org) {
        orgData = enrichResult.org;
      } else {
        // Use candidate data as fallback
        console.log(`Enrichment failed, using candidate data: ${enrichResult.error}`);
        orgData = {
          id: selectedCandidate.id,
          name: selectedCandidate.name,
          primary_domain: selectedCandidate.primary_domain,
          linkedin_url: selectedCandidate.linkedin_url,
          logo_url: selectedCandidate.logo_url,
          industry: selectedCandidate.industry,
          estimated_num_employees: selectedCandidate.estimated_num_employees,
          city: selectedCandidate.city,
          country: selectedCandidate.country,
          short_description: selectedCandidate.short_description,
        };
      }
    } else {
      // No domain, use candidate data directly
      orgData = {
        id: selectedCandidate.id,
        name: selectedCandidate.name,
        primary_domain: selectedCandidate.primary_domain,
        linkedin_url: selectedCandidate.linkedin_url,
        logo_url: selectedCandidate.logo_url,
        industry: selectedCandidate.industry,
        estimated_num_employees: selectedCandidate.estimated_num_employees,
        city: selectedCandidate.city,
        country: selectedCandidate.country,
        short_description: selectedCandidate.short_description,
      };
    }

    // Try to get decision makers
    let peopleData: any[] = [];
    if (orgData.id) {
      console.log(`Fetching decision makers for org: ${orgData.id}`);
      peopleData = await searchPeople(orgData.id, apolloApiKey);
      if (peopleData.length > 0) {
        console.log(`Found ${peopleData.length} decision makers`);
      }
    }

    // Update the lead
    await supabase
      .from("company_valuations")
      .update({
        apollo_status: 'ok',
        apollo_error: null,
        apollo_org_id: orgData.id,
        apollo_org_data: orgData,
        apollo_last_enriched_at: new Date().toISOString(),
        apollo_candidates: null, // Clear candidates
        apollo_people_data: peopleData.length > 0 ? peopleData : null,
        email_domain: orgData.primary_domain || lead.email_domain,
      })
      .eq("id", lead_id);

    console.log(`Match confirmed successfully`);

    return new Response(
      JSON.stringify({
        success: true,
        status: 'ok',
        org_data: orgData,
        people_data: peopleData,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Confirm match error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        status: 'error',
        message: error.message || "Internal server error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
