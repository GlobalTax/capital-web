
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { CompanyEnrichmentRequest } from './types.ts'
import { fetchCompanyFromApollo } from './apolloApiClient.ts'
import { saveCompanyToDatabase } from './databaseOperations.ts'
import { logOperationStart, logOperationSuccess, logOperationError } from './loggingService.ts'
import { processCompanyData, logHighValueTarget } from './companyProcessor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { company_domain }: CompanyEnrichmentRequest = await req.json()

    if (!company_domain) {
      throw new Error('Company domain is required')
    }

    console.log(`Starting Apollo enrichment for: ${company_domain}`)

    // Log start of operation
    const startTime = Date.now()
    await logOperationStart(supabaseClient, company_domain)

    // Get Apollo API Key
    const apolloApiKey = Deno.env.get('APOLLO_API_KEY')
    if (!apolloApiKey) {
      throw new Error('Apollo API key not configured')
    }

    // Call Apollo API
    const apolloData = await fetchCompanyFromApollo(apolloApiKey, company_domain)
    console.log('Apollo API Response:', JSON.stringify(apolloData, null, 2))

    if (!apolloData.organizations || apolloData.organizations.length === 0) {
      throw new Error('No company data found in Apollo')
    }

    const orgData = apolloData.organizations[0]

    // Transform Apollo data to our format
    const companyData = processCompanyData(company_domain, orgData)

    // Upsert company data
    const savedCompany = await saveCompanyToDatabase(supabaseClient, companyData)

    // Log successful operation
    const executionTime = Date.now() - startTime
    await logOperationSuccess(supabaseClient, company_domain, companyData, orgData.id, executionTime)

    // Log high value targets
    logHighValueTarget(orgData, companyData)

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
    await logOperationError(supabaseClient, errorMessage)

    return new Response(JSON.stringify({
      success: false,
      error: errorMessage
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
