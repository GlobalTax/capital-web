
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ContactsEnrichmentRequest {
  company_domain: string;
  apollo_org_id?: string;
}

interface ApolloContactsResponse {
  people?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    linkedin_url: string;
    title: string;
    email: string;
    phone_numbers: Array<{
      raw_number: string;
      sanitized_number: string;
      type: string;
    }>;
    organization_id: string;
    organization: {
      id: string;
      name: string;
      website_url: string;
      primary_domain: string;
    };
    seniority: string;
    departments: string[];
    functions: string[];
    employment_history: Array<any>;
    extrapolated_email_confidence: number;
    headline: string;
    photo_url: string;
    twitter_url: string;
    github_url: string;
    facebook_url: string;
    city: string;
    state: string;
    country: string;
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

    const { company_domain, apollo_org_id }: ContactsEnrichmentRequest = await req.json()

    if (!company_domain) {
      throw new Error('Company domain is required')
    }

    console.log(`Starting Apollo contacts enrichment for: ${company_domain}`)

    // Log start of operation
    const startTime = Date.now()
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'apollo',
      operation: 'enrich_contacts',
      company_domain,
      status: 'pending',
      data_payload: { domain: company_domain, apollo_org_id }
    })

    // Get Apollo API Key
    const apolloApiKey = Deno.env.get('APOLLO_API_KEY')
    if (!apolloApiKey) {
      throw new Error('Apollo API key not configured')
    }

    // Get company data if we don't have apollo_org_id
    let organizationId = apollo_org_id
    if (!organizationId) {
      const { data: companyData } = await supabaseClient
        .from('apollo_companies')
        .select('apollo_id')
        .eq('company_domain', company_domain)
        .single()
      
      organizationId = companyData?.apollo_id
    }

    if (!organizationId) {
      throw new Error('Apollo organization ID not found. Please enrich company first.')
    }

    // Search for people at the organization
    const apolloResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': apolloApiKey
      },
      body: JSON.stringify({
        q_organization_ids: [organizationId],
        page: 1,
        per_page: 25,
        person_seniorities: ['senior', 'director', 'vp', 'c_suite', 'founder', 'owner'], // Focus on decision makers
        person_locations: [],
        include_emails: true
      })
    })

    if (!apolloResponse.ok) {
      const errorText = await apolloResponse.text()
      console.error('Apollo Contacts API Error:', errorText)
      throw new Error(`Apollo Contacts API error: ${apolloResponse.status} - ${errorText}`)
    }

    const contactsData: ApolloContactsResponse = await apolloResponse.json()
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

    // Get company ID from our database
    const { data: companyRecord } = await supabaseClient
      .from('apollo_companies')
      .select('id')
      .eq('company_domain', company_domain)
      .single()

    const contactsToInsert = contactsData.people.map(person => ({
      apollo_person_id: person.id,
      company_id: companyRecord?.id,
      company_domain,
      first_name: person.first_name,
      last_name: person.last_name,
      full_name: person.name,
      email: person.email,
      phone: person.phone_numbers?.[0]?.sanitized_number,
      linkedin_url: person.linkedin_url,
      title: person.title,
      seniority: person.seniority,
      department: person.departments?.[0],
      is_decision_maker: isDecisionMaker(person.seniority, person.title),
      contact_score: calculateContactScore(person),
      apollo_data: person,
      last_enriched: new Date().toISOString()
    }))

    // Upsert contacts
    const { data: savedContacts, error: contactsError } = await supabaseClient
      .from('apollo_contacts')
      .upsert(contactsToInsert, {
        onConflict: 'apollo_person_id',
        ignoreDuplicates: false
      })
      .select()

    if (contactsError) {
      throw contactsError
    }

    // Update company with contact counts
    const decisionMakersCount = contactsToInsert.filter(c => c.is_decision_maker).length
    await supabaseClient
      .from('apollo_companies')
      .update({
        contacts_count: contactsToInsert.length,
        decision_makers_count: decisionMakersCount
      })
      .eq('company_domain', company_domain)

    // Log successful operation
    const executionTime = Date.now() - startTime
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'apollo',
      operation: 'enrich_contacts',
      company_domain,
      status: 'success',
      data_payload: { 
        domain: company_domain,
        contacts_found: contactsToInsert.length,
        decision_makers: decisionMakersCount,
        apollo_org_id: organizationId
      },
      execution_time_ms: executionTime
    })

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

    await supabaseClient.from('integration_logs').insert({
      integration_type: 'apollo',
      operation: 'enrich_contacts',
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

function isDecisionMaker(seniority: string, title: string): boolean {
  const decisionMakerSeniorities = ['c_suite', 'founder', 'owner', 'vp', 'director']
  const decisionMakerTitles = ['ceo', 'cto', 'cfo', 'cmo', 'founder', 'owner', 'president', 'director', 'vp', 'vice president']
  
  if (seniority && decisionMakerSeniorities.includes(seniority.toLowerCase())) {
    return true
  }
  
  if (title) {
    const lowerTitle = title.toLowerCase()
    return decisionMakerTitles.some(dmTitle => lowerTitle.includes(dmTitle))
  }
  
  return false
}

function calculateContactScore(person: any): number {
  let score = 0
  
  // Seniority scoring
  const seniorityScores: Record<string, number> = {
    'c_suite': 100,
    'founder': 100,
    'owner': 100,
    'vp': 80,
    'director': 70,
    'senior': 50,
    'manager': 30,
    'individual': 10
  }
  
  if (person.seniority && seniorityScores[person.seniority]) {
    score += seniorityScores[person.seniority]
  }
  
  // Email availability
  if (person.email && person.extrapolated_email_confidence > 0.7) {
    score += 20
  }
  
  // LinkedIn presence
  if (person.linkedin_url) {
    score += 10
  }
  
  // Phone availability  
  if (person.phone_numbers && person.phone_numbers.length > 0) {
    score += 15
  }
  
  return Math.min(score, 100) // Cap at 100
}
