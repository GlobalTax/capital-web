import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('📧 Starting operation alerts check...');

    const { data: preferences, error: prefsError } = await supabase
      .from('buyer_preferences')
      .select('*')
      .eq('is_active', true);

    if (prefsError) throw prefsError;

    console.log(`📧 Found ${preferences?.length || 0} active alert preferences`);

    let totalMatches = 0;

    for (const pref of preferences || []) {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      let query = supabase
        .from('company_operations')
        .select('*')
        .eq('is_active', true)
        .gte('created_at', sevenDaysAgo.toISOString());

      if (pref.preferred_sectors && pref.preferred_sectors.length > 0) {
        query = query.in('sector', pref.preferred_sectors);
      }

      if (pref.preferred_locations && pref.preferred_locations.length > 0) {
        query = query.overlaps('display_locations', pref.preferred_locations);
      }

      if (pref.min_valuation) {
        query = query.gte('valuation_amount', pref.min_valuation);
      }

      if (pref.max_valuation) {
        query = query.lte('valuation_amount', pref.max_valuation);
      }

      const { data: matchingOps, error: opsError } = await query;

      if (opsError) {
        console.error(`Error fetching operations for user ${pref.user_id}:`, opsError);
        continue;
      }

      if (matchingOps && matchingOps.length > 0) {
        console.log(`✅ Found ${matchingOps.length} matching operations for ${pref.email}`);
        totalMatches += matchingOps.length;
        
        // TODO: Send email with matching operations
        // Integrate with email service (SendGrid, Resend, etc.)
        console.log(`Would send email to ${pref.email} with ${matchingOps.length} operations`);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        processed: preferences?.length || 0,
        totalMatches: totalMatches
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-operation-alerts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
