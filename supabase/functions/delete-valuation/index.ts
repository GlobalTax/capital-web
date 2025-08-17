import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Parse request body
    const { valuationId } = await req.json()

    if (!valuationId) {
      return new Response(
        JSON.stringify({ success: false, message: 'valuationId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Attempting to soft delete valuation:', valuationId)

    // Set the auth context for RLS
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''))
    
    if (userError || !userData.user) {
      console.error('Authentication error:', userError)
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid authentication token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Set the auth context
    await supabase.auth.setSession({
      access_token: authHeader.replace('Bearer ', ''),
      refresh_token: ''
    })

    // First, verify the valuation exists and belongs to the user (RLS will handle this)
    const { data: existingValuation, error: fetchError } = await supabase
      .from('company_valuations')
      .select('id, contact_name, company_name, is_deleted')
      .eq('id', valuationId)
      .eq('is_deleted', false)
      .maybeSingle()

    if (fetchError) {
      console.error('Error fetching valuation:', fetchError)
      return new Response(
        JSON.stringify({ success: false, message: 'Error verifying valuation ownership' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (!existingValuation) {
      console.log('Valuation not found or already deleted:', valuationId)
      return new Response(
        JSON.stringify({ success: false, message: 'Valuation not found or already deleted' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Perform soft delete by setting is_deleted = true
    // The trigger will automatically set deleted_at timestamp
    const { error: updateError } = await supabase
      .from('company_valuations')
      .update({ 
        is_deleted: true,
        // Note: deleted_at will be set automatically by the trigger
      })
      .eq('id', valuationId)

    if (updateError) {
      console.error('Error performing soft delete:', updateError)
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to delete valuation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Log successful soft delete for audit trail
    console.log(`Valuation soft deleted successfully: ${valuationId} (${existingValuation.company_name}) by user: ${userData.user.id}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Valuation deleted successfully',
        valuationId: valuationId 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Unexpected error in delete-valuation function:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})