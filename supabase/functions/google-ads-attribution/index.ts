import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleAdsConversionRequest {
  gclid: string;
  conversion_value: number;
  conversion_name: string;
  conversion_type?: string;
  visitor_id?: string;
  company_domain?: string;
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

    const conversionData: GoogleAdsConversionRequest = await req.json()

    if (!conversionData.gclid || !conversionData.conversion_value) {
      throw new Error('GCLID and conversion value are required')
    }

    console.log(`Processing Google Ads conversion: ${conversionData.conversion_name}`)

    // Log start of operation
    const startTime = Date.now()
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'google_ads',
      operation: 'track_conversion',
      company_domain: conversionData.company_domain,
      status: 'pending',
      data_payload: conversionData
    })

    // Store conversion in our database
    const { data: adConversion, error: conversionError } = await supabaseClient
      .from('ad_conversions')
      .insert({
        gclid: conversionData.gclid,
        conversion_type: conversionData.conversion_type || 'form_submission',
        conversion_value: conversionData.conversion_value,
        conversion_name: conversionData.conversion_name,
        visitor_id: conversionData.visitor_id,
        company_domain: conversionData.company_domain
      })
      .select()
      .single()

    if (conversionError) {
      throw conversionError
    }

    // Send conversion to Google Ads API (simulated)
    const googleAdsResult = await sendConversionToGoogleAds(conversionData)

    // Create attribution touchpoint
    if (conversionData.visitor_id) {
      await supabaseClient.from('attribution_touchpoints').insert({
        visitor_id: conversionData.visitor_id,
        company_domain: conversionData.company_domain,
        touchpoint_order: 1, // This would be calculated based on existing touchpoints
        channel: 'Google Ads',
        source: 'google',
        medium: 'cpc',
        attribution_weight: 1.0,
        conversion_value: conversionData.conversion_value,
        timestamp: new Date().toISOString()
      })
    }

    // Log successful operation
    const executionTime = Date.now() - startTime
    await supabaseClient.from('integration_logs').insert({
      integration_type: 'google_ads',
      operation: 'track_conversion',
      company_domain: conversionData.company_domain,
      status: 'success',
      data_payload: {
        ...conversionData,
        google_ads_result: googleAdsResult
      },
      execution_time_ms: executionTime
    })

    return new Response(JSON.stringify({
      success: true,
      data: adConversion,
      google_ads_sent: googleAdsResult.success
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Google Ads conversion error:', error)

    // Log error
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    await supabaseClient.from('integration_logs').insert({
      integration_type: 'google_ads',
      operation: 'track_conversion',
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

async function sendConversionToGoogleAds(conversionData: GoogleAdsConversionRequest) {
  // Simulate Google Ads API call
  await new Promise(resolve => setTimeout(resolve, 500))

  console.log('Sending conversion to Google Ads:')
  console.log(`  GCLID: ${conversionData.gclid}`)
  console.log(`  Value: €${conversionData.conversion_value}`)
  console.log(`  Action: ${conversionData.conversion_name}`)

  // In production, this would be a real Google Ads API call:
  /*
  const googleAdsApi = new GoogleAds({
    customer_id: Deno.env.get('GOOGLE_ADS_CUSTOMER_ID'),
    developer_token: Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN'),
    // ... other config
  })

  const conversionUpload = {
    gclid: conversionData.gclid,
    conversion_action: conversionData.conversion_name,
    conversion_value: conversionData.conversion_value,
    conversion_date_time: new Date().toISOString(),
    currency_code: 'EUR'
  }

  const result = await googleAdsApi.conversions.upload([conversionUpload])
  */

  // Mock successful response
  return {
    success: true,
    conversion_id: `conv_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString()
  }
}
