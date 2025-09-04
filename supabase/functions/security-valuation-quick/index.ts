import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SecurityValuationRequest {
  cif?: string;
  email: string;
  contact_name: string;
  company_name: string;
  website?: string;
  phone?: string;
  security_subtype: string;
  revenue_band: string;
  ebitda_band: string;
  calculation_result: {
    ev_low: number;
    ev_base: number;
    ev_high: number;
    ebitda_multiple_low: number;
    ebitda_multiple_base: number;
    ebitda_multiple_high: number;
  };
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const requestData: SecurityValuationRequest = await req.json();
    
    console.log('Processing security valuation request for:', requestData.company_name);

    // Get client IP
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // 1. Insert lead into lead_security table
    const { data: leadData, error: leadError } = await supabase
      .from('lead_security')
      .insert({
        cif: requestData.cif || null,
        email: requestData.email,
        contact_name: requestData.contact_name,
        company_name: requestData.company_name,
        website: requestData.website || null,
        phone: requestData.phone || null,
        security_subtype: requestData.security_subtype,
        revenue_band: requestData.revenue_band,
        ebitda_band: requestData.ebitda_band,
        status: 'new',
        ip_address: clientIP,
        user_agent: requestData.user_agent || null,
        referrer: requestData.referrer || null
      })
      .select()
      .single();

    if (leadError) {
      console.error('Error inserting lead:', leadError);
      return new Response(JSON.stringify({ error: 'Error creating lead', details: leadError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Lead created successfully:', leadData.id);

    // 2. Create initial valuation record
    const scorecardData = {
      subtype: requestData.security_subtype,
      revenue_band: requestData.revenue_band,
      ebitda_band: requestData.ebitda_band,
      calculation_method: 'sector_multiples',
      factors_considered: [
        'sector_specific_multiples',
        'revenue_size_adjustment',
        'ebitda_margin_analysis',
        'subtype_premium_discount'
      ]
    };

    const assumptionsData = {
      methodology: 'EV/EBITDA Multiples',
      data_source: 'Sector Security Benchmarks 2024',
      confidence_level: 'Medium',
      limitations: [
        'Based on sector averages',
        'No company-specific adjustments',
        'Requires validation with detailed analysis'
      ]
    };

    const { data: valuationData, error: valuationError } = await supabase
      .from('lead_valuation_initial')
      .insert({
        lead_security_id: leadData.id,
        ev_low: requestData.calculation_result.ev_low,
        ev_base: requestData.calculation_result.ev_base,
        ev_high: requestData.calculation_result.ev_high,
        ebitda_multiple_low: requestData.calculation_result.ebitda_multiple_low,
        ebitda_multiple_base: requestData.calculation_result.ebitda_multiple_base,
        ebitda_multiple_high: requestData.calculation_result.ebitda_multiple_high,
        calculation_method: 'quick_sector_multiples',
        assumptions: assumptionsData,
        scorecard_data: scorecardData
      })
      .select()
      .single();

    if (valuationError) {
      console.error('Error inserting valuation:', valuationError);
      return new Response(JSON.stringify({ error: 'Error creating valuation', details: valuationError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Initial valuation created successfully:', valuationData.id);

    // 3. Log for admin notification (could trigger workflow later)
    console.log(`🎯 NEW SECURITY LEAD: ${requestData.company_name} (${requestData.security_subtype}) - EV Range: €${requestData.calculation_result.ev_low.toLocaleString()} - €${requestData.calculation_result.ev_high.toLocaleString()}`);

    return new Response(JSON.stringify({
      success: true,
      lead_id: leadData.id,
      valuation_id: valuationData.id,
      message: 'Security valuation processed successfully'
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in security-valuation-quick function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
};

serve(handler);