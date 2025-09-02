import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      searchTerm, 
      sector, 
      sortBy = 'created_at', 
      limit = 20, 
      offset = 0, 
      displayLocation 
    } = await req.json();

    console.log('List operations request:', { searchTerm, sector, sortBy, limit, offset, displayLocation });

    // Base query
    let query = supabase
      .from('company_operations')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters
    if (searchTerm) {
      query = query.or(`company_name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    if (sector) {
      query = query.eq('sector', sector);
    }

    if (displayLocation) {
      query = query.or(`display_locations.cs.{${displayLocation}}`);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'year', 'valuation_amount', 'company_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = ['created_at', 'year', 'valuation_amount'].includes(sortField) ? 'desc' : 'asc';
    
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    // Get unique sectors for filter options
    const { data: sectorsData, error: sectorsError } = await supabase
      .from('company_operations')
      .select('sector')
      .eq('is_active', true)
      .not('sector', 'is', null);

    if (sectorsError) {
      console.error('Sectors query error:', sectorsError);
    }

    const sectors = [...new Set(sectorsData?.map(item => item.sector) || [])].sort();

    console.log(`Retrieved ${data?.length || 0} operations out of ${count || 0} total`);

    return new Response(
      JSON.stringify({
        data: data || [],
        count: count || 0,
        sectors: sectors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in list-operations function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});