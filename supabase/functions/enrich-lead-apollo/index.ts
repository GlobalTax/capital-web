import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Generic email domains to exclude from domain-based enrichment
const GENERIC_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'outlook.com', 'hotmail.com',
  'live.com', 'yahoo.com', 'yahoo.es', 'icloud.com',
  'proton.me', 'protonmail.com', 'msn.com', 'aol.com',
  'mail.com', 'zoho.com', 'yandex.com', 'gmx.com', 'gmx.es',
];

// Decision maker titles for People Search
const DECISION_MAKER_TITLES = [
  'CEO', 'CFO', 'COO', 'CTO', 'CMO',
  'Founder', 'Co-Founder', 'Owner',
  'Managing Director', 'General Manager', 'Director General',
  'President', 'Vice President',
  'Partner', 'Socio', 'Gerente',
];

// Table mapping by origin
const TABLE_MAP: Record<string, { table: string; emailField: string; companyField: string }> = {
  'valuation': { table: 'company_valuations', emailField: 'email', companyField: 'company_name' },
  'contact': { table: 'contact_leads', emailField: 'email', companyField: 'company' },
  'collaborator': { table: 'collaborator_applications', emailField: 'email', companyField: 'company' },
  'acquisition': { table: 'acquisition_leads', emailField: 'email', companyField: 'company' },
  'company_acquisition': { table: 'company_acquisition_inquiries', emailField: 'email', companyField: 'company' },
  'general': { table: 'general_contact_leads', emailField: 'email', companyField: 'company' },
  'advisor': { table: 'advisor_valuations', emailField: 'email', companyField: 'company_name' },
};

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

interface ApolloCandidate {
  id: string;
  name: string;
  primary_domain?: string;
  logo_url?: string;
  industry?: string;
  estimated_num_employees?: number;
  city?: string;
  country?: string;
  linkedin_url?: string;
  short_description?: string;
}

// Extract domain from email, return null if generic
function extractEmailDomain(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) return null;
  return GENERIC_EMAIL_DOMAINS.includes(domain) ? null : domain;
}

// Summarize org data for storage (avoid storing too much)
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

// Calculate name similarity (simple Levenshtein-based)
function nameSimilarity(a: string, b: string): number {
  const aLower = (a || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const bLower = (b || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (aLower === bLower) return 1;
  if (aLower.includes(bLower) || bLower.includes(aLower)) return 0.8;
  
  // Simple character overlap ratio
  const longer = aLower.length > bLower.length ? aLower : bLower;
  const shorter = aLower.length > bLower.length ? bLower : aLower;
  if (longer.length === 0) return 1;
  
  let matches = 0;
  for (const char of shorter) {
    if (longer.includes(char)) matches++;
  }
  return matches / longer.length;
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
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      // Handle rate limits
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
      console.log(`Apollo request failed, retrying... (${attempt + 1}/${retries})`);
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
      if (response.status === 404) {
        return { success: false, error: 'Organization not found for this domain' };
      }
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

// Search organizations by name
async function searchByName(companyName: string, apiKey: string): Promise<{ success: boolean; candidates?: ApolloCandidate[]; error?: string }> {
  try {
    const response = await apolloFetch(
      '/mixed_companies/search',
      {
        method: 'POST',
        body: JSON.stringify({
          q_organization_name: companyName,
          organization_locations: ['Spain', 'España'],
          page: 1,
          per_page: 10,
        }),
      },
      apiKey
    );
    
    if (!response.ok) {
      const text = await response.text();
      console.error('Apollo search error:', response.status, text);
      return { success: false, error: `Apollo API error: ${response.status}` };
    }
    
    const data = await response.json();
    const organizations = data.organizations || data.accounts || [];
    
    if (organizations.length === 0) {
      return { success: false, error: 'No organizations found matching this company name' };
    }
    
    const candidates: ApolloCandidate[] = organizations.map((org: any) => ({
      id: org.id,
      name: org.name,
      primary_domain: org.primary_domain,
      logo_url: org.logo_url,
      industry: org.industry,
      estimated_num_employees: org.estimated_num_employees,
      city: org.city,
      country: org.country,
      linkedin_url: org.linkedin_url,
      short_description: org.short_description?.slice(0, 200),
    }));
    
    return { success: true, candidates };
  } catch (error) {
    console.error('Apollo search exception:', error);
    return { success: false, error: error.message || 'Failed to search organizations' };
  }
}

// Search for decision makers (optional)
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
    const { lead_id, origin = 'valuation' } = await req.json();
    if (!lead_id) {
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: "lead_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get table configuration for this origin
    const tableConfig = TABLE_MAP[origin];
    if (!tableConfig) {
      return new Response(
        JSON.stringify({ success: false, status: 'error', message: `Invalid origin: ${origin}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Starting Apollo enrichment for lead: ${lead_id}, origin: ${origin}, table: ${tableConfig.table}`);

    // Fetch the lead
    const { data: lead, error: leadError } = await supabase
      .from(tableConfig.table)
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

    // Mark as running
    await supabase
      .from(tableConfig.table)
      .update({
        apollo_status: 'running',
        apollo_error: null,
      })
      .eq("id", lead_id);

    // Extract email and company name using field mapping
    const email = lead[tableConfig.emailField];
    const companyName = lead[tableConfig.companyField];
    
    // Extract email domain
    const emailDomain = extractEmailDomain(email);
    console.log(`Lead email: ${email}, company: ${companyName}, extracted domain: ${emailDomain}`);

    let orgData: ApolloOrgData | null = null;
    let candidates: ApolloCandidate[] | null = null;
    let finalStatus: string = 'error';
    let errorMessage: string | null = null;

    // Strategy 1: Try domain-based enrichment if corporate email
    if (emailDomain) {
      console.log(`Attempting domain enrichment for: ${emailDomain}`);
      const enrichResult = await enrichByDomain(emailDomain, apolloApiKey);
      
      if (enrichResult.success && enrichResult.org) {
        orgData = enrichResult.org;
        finalStatus = 'ok';
        console.log(`Domain enrichment successful: ${orgData.name}`);
      } else {
        console.log(`Domain enrichment failed: ${enrichResult.error}, falling back to name search`);
        // Fall back to name search
        if (companyName) {
          const searchResult = await searchByName(companyName, apolloApiKey);
          if (searchResult.success && searchResult.candidates) {
            candidates = searchResult.candidates;
            // Check for clear match
            const clearMatch = candidates.find(c => nameSimilarity(c.name, companyName) >= 0.85);
            if (clearMatch) {
              // Enrich the clear match
              if (clearMatch.primary_domain) {
                const matchEnrich = await enrichByDomain(clearMatch.primary_domain, apolloApiKey);
                if (matchEnrich.success && matchEnrich.org) {
                  orgData = matchEnrich.org;
                  finalStatus = 'ok';
                  candidates = null;
                }
              } else {
                // Use candidate data directly if no domain
                orgData = {
                  id: clearMatch.id,
                  name: clearMatch.name,
                  primary_domain: clearMatch.primary_domain,
                  linkedin_url: clearMatch.linkedin_url,
                  logo_url: clearMatch.logo_url,
                  industry: clearMatch.industry,
                  estimated_num_employees: clearMatch.estimated_num_employees,
                  city: clearMatch.city,
                  country: clearMatch.country,
                  short_description: clearMatch.short_description,
                };
                finalStatus = 'ok';
                candidates = null;
              }
            } else {
              // Multiple candidates, needs review
              finalStatus = 'needs_review';
            }
          } else {
            errorMessage = searchResult.error || 'No matching organizations found';
            finalStatus = 'error';
          }
        } else {
          errorMessage = 'No company name available for search';
          finalStatus = 'error';
        }
      }
    } 
    // Strategy 2: Search by company name if no corporate email
    else if (companyName) {
      console.log(`No corporate domain, searching by company name: ${companyName}`);
      const searchResult = await searchByName(companyName, apolloApiKey);
      
      if (searchResult.success && searchResult.candidates) {
        candidates = searchResult.candidates;
        
        // Check for clear match (high similarity or single result)
        const clearMatch = candidates.length === 1 
          ? candidates[0] 
          : candidates.find(c => nameSimilarity(c.name, companyName) >= 0.85);
        
        if (clearMatch) {
          console.log(`Clear match found: ${clearMatch.name}`);
          // Try to enrich the clear match
          if (clearMatch.primary_domain) {
            const matchEnrich = await enrichByDomain(clearMatch.primary_domain, apolloApiKey);
            if (matchEnrich.success && matchEnrich.org) {
              orgData = matchEnrich.org;
              finalStatus = 'ok';
              candidates = null;
            }
          } else {
            // Use candidate data directly
            orgData = {
              id: clearMatch.id,
              name: clearMatch.name,
              primary_domain: clearMatch.primary_domain,
              linkedin_url: clearMatch.linkedin_url,
              logo_url: clearMatch.logo_url,
              industry: clearMatch.industry,
              estimated_num_employees: clearMatch.estimated_num_employees,
              city: clearMatch.city,
              country: clearMatch.country,
              short_description: clearMatch.short_description,
            };
            finalStatus = 'ok';
            candidates = null;
          }
        } else {
          // Multiple candidates, needs manual review
          console.log(`Multiple candidates found (${candidates.length}), needs review`);
          finalStatus = 'needs_review';
        }
      } else {
        errorMessage = searchResult.error || 'No matching organizations found';
        finalStatus = 'error';
      }
    } else {
      errorMessage = 'No email domain or company name available for enrichment';
      finalStatus = 'error';
    }

    // If successful, try to get decision makers
    let peopleData: any[] | null = null;
    if (finalStatus === 'ok' && orgData) {
      console.log(`Fetching decision makers for org: ${orgData.id}`);
      peopleData = await searchPeople(orgData.id, apolloApiKey);
      if (peopleData.length > 0) {
        console.log(`Found ${peopleData.length} decision makers`);
      }
    }

    // Update the lead with results
    const updateData: any = {
      apollo_status: finalStatus,
      apollo_error: errorMessage,
      email_domain: emailDomain,
    };

    if (orgData) {
      updateData.apollo_org_id = orgData.id;
      updateData.apollo_org_data = orgData;
      updateData.apollo_last_enriched_at = new Date().toISOString();
      updateData.apollo_candidates = null;
    }

    if (peopleData && peopleData.length > 0) {
      updateData.apollo_people_data = peopleData;
    }

    if (candidates) {
      updateData.apollo_candidates = candidates;
    }

    await supabase
      .from(tableConfig.table)
      .update(updateData)
      .eq("id", lead_id);

    console.log(`Enrichment complete with status: ${finalStatus}`);

    // Return response
    return new Response(
      JSON.stringify({
        success: finalStatus !== 'error',
        status: finalStatus,
        message: errorMessage || (finalStatus === 'needs_review' ? 'Multiple candidates found, please select one' : undefined),
        org_data: orgData,
        people_data: peopleData,
        candidates: candidates,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Enrichment error:", error);
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
