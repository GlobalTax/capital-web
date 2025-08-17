import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClaimRequest {
  token: string;
}

interface ClaimResponse {
  success: boolean;
  message: string;
  valuationId?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, message: 'Method not allowed' }),
      { 
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Initialize Supabase client with auth context
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: req.headers.get('Authorization')! } }
    });

    // Get authenticated user (JWT already validated by Supabase)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.log('❌ User not authenticated:', authError?.message);
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body: ClaimRequest = await req.json();
    
    if (!body.token || typeof body.token !== 'string' || body.token.trim() === '') {
      console.log('❌ Invalid token provided:', body.token);
      return new Response(
        JSON.stringify({ success: false, message: 'Valid token is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = body.token.trim();
    console.log('🔍 Attempting to claim valuation with token:', token, 'for user:', user.id);

    // Find the valuation with the given token and null user_id
    const { data: valuation, error: findError } = await supabase
      .from('company_valuations')
      .select('id, user_id, contact_name, company_name, email, valuation_status')
      .eq('unique_token', token)
      .single();

    if (findError || !valuation) {
      console.log('❌ Valuation not found with token:', token, findError?.message);
      return new Response(
        JSON.stringify({ success: false, message: 'Valuation not found' }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Check if valuation is already claimed
    if (valuation.user_id !== null) {
      if (valuation.user_id === user.id) {
        console.log('ℹ️ User already owns this valuation:', valuation.id);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'You already own this valuation',
            valuationId: valuation.id
          }),
          { 
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } else {
        console.log('❌ Valuation already claimed by another user:', valuation.id);
        return new Response(
          JSON.stringify({ success: false, message: 'Valuation already claimed by another user' }),
          { 
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
    }

    // Claim the valuation by setting user_id
    const { error: updateError } = await supabase
      .from('company_valuations')
      .update({ 
        user_id: user.id,
        last_activity_at: new Date().toISOString()
      })
      .eq('unique_token', token)
      .eq('user_id', null); // Extra safety check

    if (updateError) {
      console.log('❌ Failed to claim valuation:', updateError.message);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to claim valuation' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Successfully claimed valuation:', valuation.id, 'for user:', user.id);
    console.log('📊 Claimed valuation details:', {
      id: valuation.id,
      company: valuation.company_name,
      contact: valuation.contact_name,
      email: valuation.email,
      status: valuation.valuation_status
    });

    const response: ClaimResponse = {
      success: true,
      message: 'Valuation successfully claimed',
      valuationId: valuation.id
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Unexpected error in claim-valuation:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});