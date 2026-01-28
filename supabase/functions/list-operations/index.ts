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
      location,
      companySize,
      dealType,
      projectStatus,
      sortBy = 'created_at', 
      limit = 20, 
      offset = 0, 
      displayLocation,
      valuationMin,
      valuationMax,
      createdAfter,
      locale = 'es' // NUEVO: idioma solicitado (es, en, ca)
    } = await req.json();

    console.log('🌍 Locale requested:', locale);

    console.log('📋 List operations request:', { 
      searchTerm, 
      sector,
      location,
      companySize,
      dealType,
      projectStatus,
      sortBy, 
      limit, 
      offset, 
      displayLocation,
      valuationMin,
      valuationMax,
      createdAfter,
      locale,
      timestamp: new Date().toISOString()
    });

    // Base query with better error context
    let query = supabase
      .from('company_operations')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .eq('is_deleted', false);

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

    // Geographic location filter (real location, separate from display_locations)
    if (location && typeof location === 'string') {
      query = query.eq('geographic_location', location);
      console.log('📍 Geographic location filter applied:', location);
    }

    // Company size filter
    if (companySize && typeof companySize === 'string') {
      query = query.eq('company_size_employees', companySize);
      console.log('👥 Company size filter applied:', companySize);
    }

    // Deal type filter
    if (dealType && typeof dealType === 'string') {
      query = query.eq('deal_type', dealType);
      console.log('🤝 Deal type filter applied:', dealType);
    }

    // Valuation range filters
    if (valuationMin && typeof valuationMin === 'number') {
      query = query.gte('valuation_amount', valuationMin);
      console.log('💰 Valuation min filter applied:', valuationMin);
    }
    if (valuationMax && typeof valuationMax === 'number') {
      query = query.lte('valuation_amount', valuationMax);
      console.log('💰 Valuation max filter applied:', valuationMax);
    }

    // Publication date filter
    if (createdAfter && typeof createdAfter === 'string') {
      query = query.gte('created_at', createdAfter);
      console.log('📅 Created after filter applied:', createdAfter);
    }

    // Project status filter
    if (projectStatus && typeof projectStatus === 'string') {
      query = query.eq('project_status', projectStatus);
      console.log('📊 Project status filter applied:', projectStatus);
    }

    // Apply sorting with validation
    const validSortFields = ['created_at', 'year', 'valuation_amount', 'company_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = ['created_at', 'year', 'valuation_amount'].includes(sortField) ? 'desc' : 'asc';
    
    // Featured operations first (primary sort), then user's sort criteria (secondary)
    query = query.order('is_featured', { ascending: false, nullsFirst: false });
    query = query.order(sortField, { ascending: sortOrder === 'asc' });
    console.log('📊 Sorting:', { featuredFirst: true, sortField, sortOrder });

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

    // Get unique sectors for filter options with translations
    let sectors: { key: string; label: string }[] = [];
    let locations: string[] = [];
    let companySizes: string[] = [];
    let dealTypes: string[] = [];
    let projectStatuses: string[] = [];
    
    // Fetch sectors from sectors table with translations
    const { data: sectorsData, error: sectorsError } = await supabase
      .from('sectors')
      .select('name_es, name_en, slug')
      .eq('is_active', true)
      .order('display_order');

    if (sectorsError) {
      console.warn('⚠️ Sectors query error (non-critical):', sectorsError.message);
    } else if (sectorsData) {
      // Resolve sector name by locale with fallback to ES
      sectors = sectorsData.map(s => ({
        key: s.slug,
        label: (locale === 'en' && s.name_en) ? s.name_en : s.name_es
      }));
      console.log(`📊 Resolved ${sectors.length} sectors for locale: ${locale}`);
    }

    // Get unique geographic locations
    const { data: locationsData, error: locationsError } = await supabase
      .from('company_operations')
      .select('geographic_location')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .not('geographic_location', 'is', null);

    if (locationsError) {
      console.warn('⚠️ Locations query error (non-critical):', locationsError.message);
    } else if (locationsData) {
      locations = [...new Set(locationsData.map(op => op.geographic_location).filter(Boolean))].sort();
    }

    // Get unique company sizes
    const { data: sizesData, error: sizesError } = await supabase
      .from('company_operations')
      .select('company_size_employees')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .not('company_size_employees', 'is', null);

    if (sizesError) {
      console.warn('⚠️ Company sizes query error (non-critical):', sizesError.message);
    } else if (sizesData) {
      companySizes = [...new Set(sizesData.map(op => op.company_size_employees).filter(Boolean))].sort();
    }

    // Get unique deal types
    const { data: typesData, error: typesError } = await supabase
      .from('company_operations')
      .select('deal_type')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .not('deal_type', 'is', null);

    if (typesError) {
      console.warn('⚠️ Deal types query error (non-critical):', typesError.message);
    } else if (typesData) {
      dealTypes = [...new Set(typesData.map(op => op.deal_type).filter(Boolean))].sort();
    }

    // Get unique project statuses
    const { data: statusesData, error: statusesError } = await supabase
      .from('company_operations')
      .select('project_status')
      .eq('is_active', true)
      .eq('is_deleted', false)
      .not('project_status', 'is', null);

    if (statusesError) {
      console.warn('⚠️ Project statuses query error (non-critical):', statusesError.message);
    } else if (statusesData) {
      projectStatuses = [...new Set(statusesData.map(op => op.project_status).filter(Boolean))].sort();
    }

    console.log(`✅ Retrieved ${data?.length || 0} operations out of ${count || 0} total`);

    // Resolve operation descriptions and sector by locale with fallback to ES
    const resolvedData = (data || []).map(op => {
      // Find sector translation from sectors table
      const sectorMatch = sectorsData?.find(s => s.name_es === op.sector);
      const resolvedSector = (locale === 'en' && sectorMatch?.name_en)
        ? sectorMatch.name_en
        : op.sector;

      return {
        ...op,
        // Resolve sector by locale
        resolved_sector: resolvedSector,
        // Resolve description by locale
        resolved_description: locale === 'en' && op.description_en 
          ? op.description_en 
          : locale === 'ca' && op.description_ca
            ? op.description_ca
            : op.description,
        resolved_short_description: locale === 'en' && op.short_description_en 
          ? op.short_description_en 
          : locale === 'ca' && op.short_description_ca
            ? op.short_description_ca
            : op.short_description
      };
    });

    return new Response(
      JSON.stringify({
        data: resolvedData,
        count: count || 0,
        sectors: sectors,
        locations: locations,
        companySizes: companySizes,
        dealTypes: dealTypes,
        projectStatuses: projectStatuses,
        locale: locale
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