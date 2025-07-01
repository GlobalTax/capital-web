
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApolloEnrichmentRequest {
  company_domain: string;
}

interface ApolloAPIResponse {
  organizations?: Array<{
    id: string;
    name: string;
    website_url: string;
    primary_domain: string;
    industry: string;
    keywords: string[];
    estimated_num_employees: number;
    founded_year: number;
    phone: string;
    linkedin_url: string;
    facebook_url: string;
    twitter_url: string;
    primary_phone: {
      number: string;
    };
    languages: string[];
    alexa_ranking: number;
    phone: string;
    linkedin_url: string;
    publicly_traded_symbol: string;
    publicly_traded_exchange: string;
    logo_url: string;
    crunchbase_url: string;
    primary_phone: {
      number: string;
    };
    owned_by_organization_id: string;
    suborganizations: Array<any>;
    num_suborganizations: number;
    seo_description: string;
    short_description: string;
    annual_revenue: number;
    total_funding: number;
    latest_funding_round_date: string;
    latest_funding_stage: string;
    funding_events: Array<any>;
    technology_names: string[];
    current_technologies: Array<{
      uid: string;
      name: string;
      category: string;
    }>;
    account_id: string;
    organization_raw_address: string;
    organization_city: string;
    organization_state: string;
    organization_country: string;
    organization_street_address: string;
    hubspot_id: string;
    salesforce_id: string;
    crm_owner_id: string;
    crm_record_url: string;
    num_contacts: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { company_domain }: ApolloEnrichmentRequest = await req.json()

    if (!company_domain) {
      throw new Error('Company domain is required')
    }

    console.log(`Starting Apollo enrichment for: ${company_domain}`)

    // Log start of operation
    const startTime = Date.now()
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'apollo',
      operation: 'enrich_company',
      company_domain,
      status: 'pending',
      data_payload: { domain: company_domain }
    })

    // Get Apollo API Key
    const apolloApiKey = Deno.env.get('APOLLO_API_KEY')
    if (!apolloApiKey) {
      throw new Error('Apollo API key not configured')
    }

    // Call Apollo API
    const apolloResponse = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey
      },
      body: JSON.stringify({
        q_organization_domains: company_domain,
        page: 1,
        per_page: 1
      })
    })

    if (!apolloResponse.ok) {
      const errorText = await apolloResponse.text()
      console.error('Apollo API Error:', errorText)
      throw new Error(`Apollo API error: ${apolloResponse.status} - ${errorText}`)
    }

    const apolloData: ApolloAPIResponse = await apolloResponse.json()
    console.log('Apollo API Response:', JSON.stringify(apolloData, null, 2))

    if (!apolloData.organizations || apolloData.organizations.length === 0) {
      throw new Error('No company data found in Apollo')
    }

    const orgData = apolloData.organizations[0]

    // Transform Apollo data to our format
    const companyData = {
      company_domain,
      company_name: orgData.name,
      employee_count: orgData.estimated_num_employees,
      industry: orgData.industry,
      revenue_range: orgData.annual_revenue ? `$${(orgData.annual_revenue / 1000000).toFixed(1)}M` : null,
      location: [orgData.organization_city, orgData.organization_state, orgData.organization_country]
        .filter(Boolean).join(', '),
      founded_year: orgData.founded_year,
      technologies: orgData.technology_names || [],
      apollo_id: orgData.id,
      is_target_account: determineTargetAccount(orgData),
      last_enriched: new Date().toISOString(),
      contacts_count: orgData.num_contacts || 0
    }

    // Upsert company data
    const { data: savedCompany, error: companyError } = await supabaseClient
      .from('apollo_companies')
      .upsert(companyData, {
        onConflict: 'company_domain'
      })
      .select()
      .single()

    if (companyError) {
      throw companyError
    }

    // Log successful operation
    const executionTime = Date.now() - startTime
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'apollo',
      operation: 'enrich_company',
      company_domain,
      status: 'success',
      data_payload: { 
        domain: company_domain,
        enriched_data: companyData,
        is_target_account: companyData.is_target_account,
        apollo_org_id: orgData.id
      },
      execution_time_ms: executionTime
    })

    // If it's a target account with high potential, log for notifications
    if (companyData.is_target_account && orgData.estimated_num_employees && orgData.estimated_num_employees > 100) {
      console.log(`🔥 HIGH VALUE TARGET ACCOUNT: ${orgData.name}`)
      console.log(`   Industry: ${orgData.industry}`)
      console.log(`   Employees: ${orgData.estimated_num_employees}`)
      console.log(`   Revenue: ${companyData.revenue_range}`)
      console.log(`   Technologies: ${orgData.technology_names?.join(', ')}`)
    }

    return new Response(JSON.stringify({
      success: true,
      data: savedCompany,
      is_target_account: companyData.is_target_account,
      apollo_org_id: orgData.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Apollo enrichment error:', error)

    // Log error
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    await supabaseClient.from('integration_logs').insert({
      integration_type: 'apollo',
      operation: 'enrich_company',
      company_domain: '',
      status: 'error',
      error_message: errorMessage,
      data_payload: { error: errorMessage }
    })

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

function determineTargetAccount(orgData: any): boolean {
  let score = 0

  // Industry scoring
  const targetIndustries = ['Technology', 'Software', 'FinTech', 'SaaS', 'Healthcare', 'Financial Services']
  if (orgData.industry && targetIndustries.some(industry => 
    orgData.industry.toLowerCase().includes(industry.toLowerCase())
  )) {
    score += 30
  }

  // Employee count scoring
  if (orgData.estimated_num_employees) {
    if (orgData.estimated_num_employees >= 100) score += 40
    else if (orgData.estimated_num_employees >= 50) score += 25
    else if (orgData.estimated_num_employees >= 20) score += 15
  }

  // Revenue scoring
  if (orgData.annual_revenue) {
    if (orgData.annual_revenue >= 50000000) score += 30 // $50M+
    else if (orgData.annual_revenue >= 10000000) score += 20 // $10M+
    else if (orgData.annual_revenue >= 5000000) score += 10 // $5M+
  }

  // Technology stack scoring
  if (orgData.technology_names && orgData.technology_names.length > 0) {
    const modernTech = ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB', 'Salesforce', 'HubSpot']
    const techMatches = orgData.technology_names.filter((tech: string) => 
      modernTech.some(modern => tech.toLowerCase().includes(modern.toLowerCase()))
    ).length
    score += techMatches * 5
  }

  // Funding indicators
  if (orgData.total_funding && orgData.total_funding > 1000000) {
    score += 20 // Has received significant funding
  }

  return score >= 60 // Target account if score >= 60
}
