
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface LinkedInSyncRequest {
  company_domain: string;
}

interface LinkedInCompanyData {
  company_name: string;
  company_domain: string;
  recent_hires: number;
  growth_signals: string[];
  decision_makers: any[];
  company_updates: string[];
  funding_signals: any;
  optimal_outreach_timing: string;
  confidence_score: number;
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

    const { company_domain }: LinkedInSyncRequest = await req.json()

    if (!company_domain) {
      throw new Error('Company domain is required')
    }

    console.log(`Starting LinkedIn intelligence sync for: ${company_domain}`)

    // Log start of operation
    const startTime = Date.now()
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'linkedin',
      operation: 'sync_intelligence',
      company_domain,
      status: 'pending',
      data_payload: { domain: company_domain }
    })

    // Get LinkedIn intelligence data
    const linkedinData = await getLinkedInIntelligence(company_domain)

    if (!linkedinData) {
      throw new Error('No LinkedIn data found for this company')
    }

    // Calculate optimal outreach timing based on signals
    const optimalTiming = calculateOptimalTiming(linkedinData)
    linkedinData.optimal_outreach_timing = optimalTiming.timing
    linkedinData.confidence_score = optimalTiming.confidence

    // Upsert LinkedIn intelligence data
    const { data: intelligenceData, error: intelligenceError } = await supabaseClient
      .from('linkedin_intelligence')
      .upsert({
        company_domain,
        company_name: linkedinData.company_name,
        recent_hires: linkedinData.recent_hires,
        growth_signals: linkedinData.growth_signals,
        decision_makers: linkedinData.decision_makers,
        company_updates: linkedinData.company_updates,
        funding_signals: linkedinData.funding_signals,
        optimal_outreach_timing: linkedinData.optimal_outreach_timing,
        confidence_score: linkedinData.confidence_score,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'company_domain'
      })
      .select()
      .single()

    if (intelligenceError) {
      throw intelligenceError
    }

    // Log successful operation
    const executionTime = Date.now() - startTime
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'linkedin',
      operation: 'sync_intelligence',
      company_domain,
      status: 'success',
      data_payload: {
        domain: company_domain,
        signals_found: linkedinData.growth_signals.length,
        confidence_score: linkedinData.confidence_score
      },
      execution_time_ms: executionTime
    })

    // If high-confidence timing detected, create alert
    if (linkedinData.confidence_score > 75) {
      console.log(`High-confidence outreach timing detected for ${linkedinData.company_name}`)
      EdgeRuntime.waitUntil(
        createOutreachAlert(intelligenceData)
      )
    }

    return new Response(JSON.stringify({
      success: true,
      data: intelligenceData,
      timing_confidence: linkedinData.confidence_score
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('LinkedIn sync error:', error)

    // Log error
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient.from('integration_logs').insert({
      integration_type: 'linkedin',
      operation: 'sync_intelligence',
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

async function getLinkedInIntelligence(domain: string): Promise<LinkedInCompanyData | null> {
  // Simulate LinkedIn Sales Navigator API call or ethical web scraping
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000))

  // Mock LinkedIn intelligence data
  const mockIntelligence: Record<string, LinkedInCompanyData> = {
    'tecnologia.com': {
      company_name: 'Tecnología Avanzada S.L.',
      company_domain: 'tecnologia.com',
      recent_hires: 12,
      growth_signals: ['New CFO hired', 'Series B funding', 'Rapid expansion', 'New office opened'],
      decision_makers: [
        { name: 'Maria González', position: 'CEO', linkedin_url: 'linkedin.com/in/mariagonzalez' },
        { name: 'Carlos Ruiz', position: 'CFO', linkedin_url: 'linkedin.com/in/carlosruiz' },
        { name: 'Ana López', position: 'CTO', linkedin_url: 'linkedin.com/in/analopez' }
      ],
      company_updates: [
        'Announced €10M Series B funding',
        'Hired 15 new engineers this quarter',
        'Launched new AI product line',
        'Opened Barcelona office'
      ],
      funding_signals: {
        recent_funding: true,
        amount: '€10M',
        round: 'Series B',
        investors: ['VC Fund A', 'Angel Group B']
      },
      optimal_outreach_timing: '',
      confidence_score: 0
    },
    'startup.com': {
      company_name: 'Startup Innovadora',
      company_domain: 'startup.com',
      recent_hires: 5,
      growth_signals: ['New marketing director', 'Product launch'],
      decision_makers: [
        { name: 'Pedro Martín', position: 'CEO', linkedin_url: 'linkedin.com/in/pedromartin' },
        { name: 'Laura Silva', position: 'CMO', linkedin_url: 'linkedin.com/in/laurasilva' }
      ],
      company_updates: [
        'Launched beta version of new product',
        'Hired marketing director',
        'Featured in TechCrunch'
      ],
      funding_signals: {
        seeking_funding: true,
        stage: 'Seed'
      },
      optimal_outreach_timing: '',
      confidence_score: 0
    }
  }

  // Return mock data or generate generic data
  return mockIntelligence[domain] || {
    company_name: `Empresa ${domain}`,
    company_domain: domain,
    recent_hires: Math.floor(Math.random() * 20),
    growth_signals: ['Hiring growth', 'Market expansion'].slice(0, Math.floor(Math.random() * 2) + 1),
    decision_makers: [],
    company_updates: ['Recent company updates'],
    funding_signals: {},
    optimal_outreach_timing: '',
    confidence_score: 0
  }
}

function calculateOptimalTiming(data: LinkedInCompanyData): { timing: string, confidence: number } {
  let confidence = 20 // Base confidence
  let timing = 'Standard timing'

  // Analyze growth signals
  const strongSignals = ['funding', 'new CFO', 'new CEO', 'IPO', 'acquisition']
  const mediumSignals = ['hiring', 'expansion', 'product launch', 'new office']

  const hasStrongSignal = data.growth_signals.some(signal => 
    strongSignals.some(strong => signal.toLowerCase().includes(strong))
  )

  const hasMediumSignal = data.growth_signals.some(signal => 
    mediumSignals.some(medium => signal.toLowerCase().includes(medium))
  )

  if (hasStrongSignal) {
    confidence += 40
    timing = 'High priority - Strike now! Strong growth signals detected'
  } else if (hasMediumSignal) {
    confidence += 25
    timing = 'Good timing - Company showing growth signals'
  }

  // Recent hires signal
  if (data.recent_hires > 10) {
    confidence += 20
    timing += ' - Rapid hiring indicates growth phase'
  } else if (data.recent_hires > 5) {
    confidence += 10
  }

  // Funding signals
  if (data.funding_signals.recent_funding) {
    confidence += 30
    timing = 'Excellent timing - Recent funding round completed'
  } else if (data.funding_signals.seeking_funding) {
    confidence += 15
    timing += ' - Company actively seeking funding'
  }

  // Decision maker availability
  if (data.decision_makers.length > 2) {
    confidence += 10
  }

  return {
    timing,
    confidence: Math.min(confidence, 100)
  }
}

async function createOutreachAlert(data: any) {
  console.log(`🎯 OPTIMAL OUTREACH TIMING ALERT: ${data.company_name}`)
  console.log(`   Timing: ${data.optimal_outreach_timing}`)
  console.log(`   Confidence: ${data.confidence_score}%`)
  console.log(`   Growth Signals: ${data.growth_signals.join(', ')}`)
  
  // TODO: Create alert in lead_alerts table
  // TODO: Integrate with CRM to schedule outreach
  // TODO: Send notification to sales team
}
