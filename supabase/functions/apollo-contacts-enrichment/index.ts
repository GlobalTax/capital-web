
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { ContactsEnrichmentRequest } from './types.ts'
import { fetchContactsFromApollo } from './apolloApiClient.ts'
import { processContactsData } from './contactsProcessor.ts'
import { 
  getOrganizationId, 
  getCompanyRecord, 
  saveContactsToDatabase, 
  updateCompanyContactCounts 
} from './databaseOperations.ts'
import { 
  logOperationStart, 
  logOperationSuccess, 
  logOperationError 
} from './loggingService.ts'

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

    const { company_domain, apollo_org_id }: ContactsEnrichmentRequest = await req.json()

    if (!company_domain) {
      throw new Error('Company domain is required')
    }

    console.log(`Starting Apollo contacts enrichment for: ${company_domain}`)

    // Log start of operation
    const startTime = Date.now()
    await logOperationStart(supabaseClient, company_domain, apollo_org_id)

    // Get Apollo API Key
    const apolloApiKey = Deno.env.get('APOLLO_API_KEY')
    if (!apolloApiKey) {
      throw new Error('Apollo API key not configured')
    }

    // Get organization ID
    const organizationId = await getOrganizationId(supabaseClient, company_domain, apollo_org_id)

    // Search for people at the organization
    const contactsData = await fetchContactsFromApollo(apolloApiKey, organizationId)
    console.log(`Found ${contactsData.people?.length || 0} contacts for ${company_domain}`)

    if (!contactsData.people || contactsData.people.length === 0) {
      console.log('No contacts found for this organization')
      return new Response(JSON.stringify({
        success: true,
        data: [],
        message: 'No contacts found for this organization'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Get company record and process contacts data
    const companyRecord = await getCompanyRecord(supabaseClient, company_domain)
    const contactsToInsert = processContactsData(contactsData, companyRecord, company_domain)

    // Save contacts to database
    const savedContacts = await saveContactsToDatabase(supabaseClient, contactsToInsert)

    // Update company with contact counts
    const decisionMakersCount = contactsToInsert.filter(c => c.is_decision_maker).length
    await updateCompanyContactCounts(supabaseClient, company_domain, contactsToInsert.length, decisionMakersCount)

    // Log successful operation
    const executionTime = Date.now() - startTime
    await logOperationSuccess(supabaseClient, company_domain, contactsToInsert.length, decisionMakersCount, organizationId, executionTime)

    console.log(`✅ Successfully enriched ${contactsToInsert.length} contacts for ${company_domain}`)
    console.log(`   Decision makers: ${decisionMakersCount}`)

    return new Response(JSON.stringify({
      success: true,
      data: savedContacts,
      contacts_found: contactsToInsert.length,
      decision_makers: decisionMakersCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Apollo contacts enrichment error:', error)

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
