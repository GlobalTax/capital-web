import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    console.log('Starting financial data extraction...')

    // Get all operations with descriptions
    const { data: operations, error } = await supabase
      .from('company_operations')
      .select('id, description, revenue_amount, ebitda_amount')
      .is('revenue_amount', null)

    if (error) {
      console.error('Error fetching operations:', error)
      throw error
    }

    console.log(`Found ${operations?.length || 0} operations to process`)

    let updatedCount = 0
    const updates = []

    for (const operation of operations || []) {
      const extracted = extractFinancialData(operation.description)
      
      if (extracted.revenue || extracted.ebitda) {
        updates.push({
          id: operation.id,
          revenue_amount: extracted.revenue,
          ebitda_amount: extracted.ebitda
        })
        
        console.log(`Extracted for ${operation.id}: Revenue: ${extracted.revenue}, EBITDA: ${extracted.ebitda}`)
      }
    }

    // Batch update all records
    for (const update of updates) {
      const { error: updateError } = await supabase
        .from('company_operations')
        .update({
          revenue_amount: update.revenue_amount,
          ebitda_amount: update.ebitda_amount
        })
        .eq('id', update.id)

      if (!updateError) {
        updatedCount++
      } else {
        console.error(`Error updating ${update.id}:`, updateError)
      }
    }

    console.log(`Successfully updated ${updatedCount} operations`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Extracted financial data for ${updatedCount} operations`,
        updatedCount,
        totalProcessed: operations?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Error in extract-financial-data:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Error interno del servidor.'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})

function extractFinancialData(description: string): { revenue?: number, ebitda?: number } {
  const result: { revenue?: number, ebitda?: number } = {}
  
  // Patterns to match financial data
  const revenuePattern = /Facturación:\s*([>]?)([0-9,]+(?:\.[0-9]+)?)\s*M€/i
  const ebitdaPattern = /EBITDA:\s*([>]?)([0-9,]+(?:\.[0-9]+)?)\s*M€/i
  
  // Extract revenue
  const revenueMatch = description.match(revenuePattern)
  if (revenueMatch) {
    const value = parseFloat(revenueMatch[2].replace(',', '.'))
    if (!isNaN(value)) {
      result.revenue = value * 1000000 // Convert to euros
    }
  }
  
  // Extract EBITDA
  const ebitdaMatch = description.match(ebitdaPattern)
  if (ebitdaMatch) {
    const value = parseFloat(ebitdaMatch[2].replace(',', '.'))
    if (!isNaN(value)) {
      result.ebitda = value * 1000000 // Convert to euros
    }
  }
  
  return result
}