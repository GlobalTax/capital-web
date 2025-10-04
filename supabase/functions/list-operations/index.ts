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

    console.log('📋 List operations request:', { 
      searchTerm, 
      sector, 
      sortBy, 
      limit, 
      offset, 
      displayLocation,
      timestamp: new Date().toISOString()
    });

    // Base query with better error context
    let query = supabase
      .from('company_operations')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Apply filters with validation
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const sanitizedSearch = searchTerm.trim().substring(0, 100);
      query = query.or(`company_name.ilike.%${sanitizedSearch}%,description.ilike.%${sanitizedSearch}%`);
      console.log('🔍 Search filter applied:', sanitizedSearch);
    }

    if (sector && typeof sector === 'string') {
      query = query.eq('sector', sector);
      console.log('🏢 Sector filter applied:', sector);
    }

    if (displayLocation && typeof displayLocation === 'string') {
      query = query.contains('display_locations', [displayLocation]);
      console.log('📍 Location filter applied:', displayLocation);
    }

    // Apply sorting with validation
    const validSortFields = ['created_at', 'year', 'valuation_amount', 'company_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = ['created_at', 'year', 'valuation_amount'].includes(sortField) ? 'desc' : 'asc';
    
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
    console.log('📊 Sorting:', { sortField, sortOrder });

    // Apply pagination with bounds check
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);
    query = query.range(safeOffset, safeOffset + safeLimit - 1);

    // Execute main query with timeout
    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch operations',
          details: error.message,
          data: [],
          count: 0,
          sectors: []
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get unique sectors for filter options (only if not already filtered)
    let sectors: string[] = [];
    if (!sector) {
      const { data: sectorsData, error: sectorsError } = await supabase
        .from('company_operations')
        .select('sector')
        .eq('is_active', true)
        .not('sector', 'is', null);

      if (sectorsError) {
        console.warn('⚠️ Sectors query error (non-critical):', sectorsError.message);
      } else {
        sectors = [...new Set(sectorsData?.map(item => item.sector).filter(Boolean) || [])].sort();
      }
    }

    console.log(`✅ Retrieved ${data?.length || 0} operations out of ${count || 0} total`);

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
    console.error('❌ CRITICAL ERROR in list-operations function:', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        data: [],
        count: 0,
        sectors: []
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});