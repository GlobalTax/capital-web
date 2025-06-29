
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ApolloEnrichmentRequest {
  company_domain: string;
}

interface ApolloCompanyData {
  name: string;
  domain: string;
  employee_count?: number;
  industry?: string;
  revenue_range?: string;
  location?: string;
  founded_year?: number;
  technologies?: string[];
  apollo_id?: string;
  is_target_account?: boolean;
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

    // Simulate Apollo API call - Replace with actual Apollo API integration
    const apolloData = await mockApolloEnrichment(company_domain)

    if (!apolloData) {
      throw new Error('No data found for this company')
    }

    // Determine if it's a target account based on criteria
    const isTargetAccount = determineTargetAccount(apolloData)

    // Upsert company data
    const { data: companyData, error: companyError } = await supabaseClient
      .from('apollo_companies')
      .upsert({
        company_domain,
        company_name: apolloData.name,
        employee_count: apolloData.employee_count,
        industry: apolloData.industry,
        revenue_range: apolloData.revenue_range,
        location: apolloData.location,
        founded_year: apolloData.founded_year,
        technologies: apolloData.technologies,
        apollo_id: apolloData.apollo_id,
        is_target_account: isTargetAccount,
        last_enriched: new Date().toISOString()
      }, {
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
        enriched_data: apolloData,
        is_target_account: isTargetAccount
      },
      execution_time_ms: executionTime
    })

    // If it's a target account with high potential, trigger notifications
    if (isTargetAccount && apolloData.employee_count && apolloData.employee_count > 100) {
      console.log(`High-value target account detected: ${apolloData.name}`)
      
      // Could integrate with Slack notifications here
      EdgeRuntime.waitUntil(
        notifyHighValueProspect(apolloData)
      )
    }

    return new Response(JSON.stringify({
      success: true,
      data: companyData,
      is_target_account: isTargetAccount
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

    await supabaseClient.from('integration_logs').insert({
      integration_type: 'apollo',
      operation: 'enrich_company',
      status: 'error',
      error_message: error.message,
      data_payload: { error: error.message }
    })

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

async function mockApolloEnrichment(domain: string): Promise<ApolloCompanyData | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

  // Mock enrichment data - Replace with actual Apollo API calls
  const mockData: Record<string, ApolloCompanyData> = {
    'tecnologia.com': {
      name: 'Tecnología Avanzada S.L.',
      domain: 'tecnologia.com',
      employee_count: 150,
      industry: 'Technology',
      revenue_range: '€10M - €50M',
      location: 'Madrid, España',
      founded_year: 2015,
      technologies: ['React', 'Node.js', 'AWS', 'PostgreSQL', 'Docker'],
      apollo_id: 'apollo_12345',
      is_target_account: true
    },
    'startup.com': {
      name: 'Startup Innovadora',
      domain: 'startup.com',
      employee_count: 25,
      industry: 'FinTech',
      revenue_range: '€1M - €5M',
      location: 'Barcelona, España',
      founded_year: 2020,
      technologies: ['Vue.js', 'Python', 'GCP', 'MongoDB'],
      apollo_id: 'apollo_67890'
    }
  }

  // Return mock data or generate generic data
  return mockData[domain] || {
    name: `Empresa ${domain}`,
    domain: domain,
    employee_count: Math.floor(Math.random() * 500) + 10,
    industry: ['Technology', 'Finance', 'Healthcare', 'Manufacturing'][Math.floor(Math.random() * 4)],
    revenue_range: ['€1M - €5M', '€5M - €10M', '€10M - €50M'][Math.floor(Math.random() * 3)],
    location: ['Madrid, España', 'Barcelona, España', 'Valencia, España'][Math.floor(Math.random() * 3)],
    founded_year: 2000 + Math.floor(Math.random() * 24),
    technologies: ['JavaScript', 'Python', 'Java', 'AWS', 'Azure'],
    apollo_id: `apollo_${Math.random().toString(36).substr(2, 9)}`
  }
}

function determineTargetAccount(data: ApolloCompanyData): boolean {
  let score = 0

  // Industry scoring
  const targetIndustries = ['Technology', 'FinTech', 'SaaS', 'Healthcare']
  if (data.industry && targetIndustries.includes(data.industry)) {
    score += 30
  }

  // Employee count scoring
  if (data.employee_count) {
    if (data.employee_count >= 100) score += 40
    else if (data.employee_count >= 50) score += 25
    else if (data.employee_count >= 20) score += 15
  }

  // Revenue range scoring
  if (data.revenue_range) {
    if (data.revenue_range.includes('50M')) score += 30
    else if (data.revenue_range.includes('10M')) score += 20
    else if (data.revenue_range.includes('5M')) score += 10
  }

  // Technology stack scoring
  if (data.technologies) {
    const modernTech = ['React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL']
    const techMatches = data.technologies.filter(tech => modernTech.includes(tech)).length
    score += techMatches * 5
  }

  return score >= 60 // Target account if score >= 60
}

async function notifyHighValueProspect(data: ApolloCompanyData) {
  // This would integrate with Slack API or other notification systems
  console.log(`🔥 HIGH VALUE PROSPECT ALERT: ${data.name}`)
  console.log(`   Industry: ${data.industry}`)
  console.log(`   Employees: ${data.employee_count}`)
  console.log(`   Revenue: ${data.revenue_range}`)
  console.log(`   Should be added to hot prospects sequence!`)
  
  // TODO: Integrate with Slack/Teams notifications
  // TODO: Auto-add to email sequences if conditions met
}
