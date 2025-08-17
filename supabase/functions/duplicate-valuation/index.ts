import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DuplicateRequest {
  valuationId: string;
}

interface DuplicateResponse {
  success: boolean;
  newId?: string;
  token?: string;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Authorization required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with anon key to use RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Parse request body
    const { valuationId }: DuplicateRequest = await req.json();

    if (!valuationId) {
      console.error('Missing valuationId in request');
      return new Response(
        JSON.stringify({ success: false, error: 'valuationId is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Duplicating valuation:', valuationId);

    // Get the original valuation (RLS will ensure user owns it)
    const { data: originalValuation, error: fetchError } = await supabase
      .from('company_valuations')
      .select('*')
      .eq('id', valuationId)
      .single();

    if (fetchError) {
      console.error('Error fetching original valuation:', fetchError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: fetchError.code === 'PGRST116' ? 'Valuation not found or access denied' : 'Failed to fetch valuation'
        }),
        { 
          status: fetchError.code === 'PGRST116' ? 404 : 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (!originalValuation) {
      console.error('Valuation not found or access denied:', valuationId);
      return new Response(
        JSON.stringify({ success: false, error: 'Valuation not found or access denied' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate new unique token using the database function
    const { data: tokenData, error: tokenError } = await supabase
      .rpc('generate_unique_v4_token');

    if (tokenError) {
      console.error('Error generating unique token:', tokenError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to generate unique token' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const newToken = tokenData;

    // Calculate completion percentage based on available data
    const calculateCompletionPercentage = (valuation: any): number => {
      let score = 0;
      const weights = {
        basicInfo: 25, // contact_name, company_name, email, industry, employee_range
        financials: 50, // revenue, ebitda
        additional: 25  // location, competitive_advantage, etc.
      };

      // Basic info (required fields are always present if we got here)
      if (valuation.contact_name && valuation.company_name && valuation.email && 
          valuation.industry && valuation.employee_range) {
        score += weights.basicInfo;
      }

      // Financial data
      if (valuation.revenue && valuation.ebitda) {
        score += weights.financials;
      } else if (valuation.revenue || valuation.ebitda) {
        score += weights.financials / 2;
      }

      // Additional info
      let additionalScore = 0;
      const additionalFields = ['location', 'competitive_advantage', 'years_of_operation', 'growth_rate'];
      const filledAdditional = additionalFields.filter(field => valuation[field]).length;
      additionalScore = (filledAdditional / additionalFields.length) * weights.additional;
      score += additionalScore;

      return Math.min(Math.max(Math.round(score), 10), 75); // Min 10%, max 75% for duplicates
    };

    const completionPercentage = calculateCompletionPercentage(originalValuation);
    const currentStep = completionPercentage >= 50 ? 3 : (completionPercentage >= 25 ? 2 : 1);

    // Prepare the duplicated valuation data
    const duplicatedData = {
      // Copy essential company and contact data
      contact_name: originalValuation.contact_name,
      company_name: originalValuation.company_name,
      email: originalValuation.email,
      phone: originalValuation.phone,
      cif: originalValuation.cif,
      
      // Copy business data
      industry: originalValuation.industry,
      employee_range: originalValuation.employee_range,
      location: originalValuation.location,
      years_of_operation: originalValuation.years_of_operation,
      
      // Copy financial data
      revenue: originalValuation.revenue,
      ebitda: originalValuation.ebitda,
      growth_rate: originalValuation.growth_rate,
      net_profit_margin: originalValuation.net_profit_margin,
      
      // Copy additional business details
      competitive_advantage: originalValuation.competitive_advantage,
      ownership_participation: originalValuation.ownership_participation,
      
      // Copy user association
      user_id: originalValuation.user_id,
      
      // Reset process-related fields
      unique_token: newToken,
      valuation_status: 'in_progress',
      current_step: currentStep,
      completion_percentage: completionPercentage,
      time_spent_seconds: 0,
      
      // Reset valuation results
      final_valuation: null,
      ebitda_multiple_used: null,
      valuation_range_min: null,
      valuation_range_max: null,
      
      // Reset all communication flags and timestamps
      email_sent: false,
      email_sent_at: null,
      email_opened: false,
      email_opened_at: null,
      email_message_id: null,
      
      whatsapp_sent: false,
      whatsapp_sent_at: null,
      whatsapp_opt_in: false,
      
      hubspot_sent: false,
      hubspot_sent_at: null,
      
      // Reset recovery and abandonment tracking
      recovery_link_sent: false,
      recovery_link_sent_at: null,
      abandonment_detected_at: null,
      immediate_alert_sent: false,
      immediate_alert_sent_at: null,
      
      // Reset V4 specific fields
      v4_link_sent: false,
      v4_link_sent_at: null,
      v4_accessed: false,
      v4_accessed_at: null,
      v4_engagement_score: 0,
      v4_scenarios_viewed: [],
      v4_time_spent: 0,
      
      // Reset metadata
      last_activity_at: new Date().toISOString(),
      form_submitted_at: new Date().toISOString(),
      last_modified_field: null,
      
      // Don't copy IP and user agent - will be set by triggers if needed
      ip_address: null,
      user_agent: null,
    };

    // Insert the duplicated valuation
    const { data: newValuation, error: insertError } = await supabase
      .from('company_valuations')
      .insert(duplicatedData)
      .select('id')
      .single();

    if (insertError) {
      console.error('Error creating duplicated valuation:', insertError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create duplicated valuation' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const newId = newValuation.id;

    console.log('Successfully duplicated valuation:', {
      originalId: valuationId,
      newId: newId,
      token: newToken,
      completionPercentage,
      currentStep
    });

    const response: DuplicateResponse = {
      success: true,
      newId: newId,
      token: newToken
    };

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error in duplicate-valuation function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
})