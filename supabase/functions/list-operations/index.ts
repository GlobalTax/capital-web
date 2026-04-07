import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
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

    const body = await req.json();
    const { 
      searchTerm, 
      sector,
      sectors: sectorsFilter,
      location,
      dealType,
      sortBy = 'created_at', 
      limit = 20, 
      offset = 0,
      createdAfter,
      locale = 'es'
    } = body;

    console.log('📋 list-operations (ROD) request:', { 
      searchTerm, sector, location, dealType, sortBy, limit, offset, createdAfter, locale,
      timestamp: new Date().toISOString()
    });

    // ── Main query: mandatos + datos_proyecto ──
    // We query datos_proyecto and join with mandatos to check visible_en_rod
    let query = supabase
      .from('datos_proyecto')
      .select(`
        id,
        mandato_id,
        project_name,
        project_number,
        ubicacion,
        sector,
        short_description,
        short_description_en,
        description,
        description_en,
        year,
        revenue_amount,
        ebitda_amount,
        ebitda_margin,
        rango_facturacion_min,
        rango_facturacion_max,
        rango_ebitda_min,
        rango_ebitda_max,
        estado,
        created_at,
        updated_at,
        mandatos!inner (
          id,
          tipo,
          visible_en_rod,
          nombre_proyecto,
          is_favorite
        )
      `, { count: 'exact' })
      .eq('mandatos.visible_en_rod', true);

    // ── Apply filters ──
    if (searchTerm && typeof searchTerm === 'string' && searchTerm.trim()) {
      const s = searchTerm.trim().substring(0, 100);
      query = query.or(`project_name.ilike.%${s}%,description.ilike.%${s}%,short_description.ilike.%${s}%,sector.ilike.%${s}%`);
    }

    if (sector && typeof sector === 'string') {
      query = query.ilike('sector', `%${sector}%`);
    }

    if (location && typeof location === 'string') {
      query = query.eq('ubicacion', location);
    }

    if (dealType && typeof dealType === 'string') {
      // Map frontend values to mandatos.tipo
      const tipoMap: Record<string, string> = { 'sale': 'venta', 'acquisition': 'compra', 'venta': 'venta', 'compra': 'compra', 'sell-side': 'venta', 'buy-side': 'compra' };
      const mappedTipo = tipoMap[dealType] || dealType;
      query = query.eq('mandatos.tipo', mappedTipo);
    }

    if (createdAfter && typeof createdAfter === 'string') {
      query = query.gte('created_at', createdAfter);
    }

    // ── Sorting ──
    const validSortFields = ['created_at', 'revenue_amount', 'project_name'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = sortField !== 'project_name' ? 'desc' : 'asc';
    
    // Featured (is_favorite on mandatos) first, then sort
    query = query.order('mandatos(is_favorite)', { ascending: false, nullsFirst: false });
    query = query.order(sortField, { ascending: sortOrder === 'asc' });

    // ── Pagination ──
    const safeLimit = Math.min(Math.max(1, limit), 100);
    const safeOffset = Math.max(0, offset);
    query = query.range(safeOffset, safeOffset + safeLimit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('❌ Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch operations', details: error.message, data: [], count: 0, sectors: [] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ── Fetch filter options ──
    // Get unique sectors from visible datos_proyecto only
    const { data: availableSectorsData } = await supabase
      .from('datos_proyecto')
      .select('sector, mandatos!inner(visible_en_rod)')
      .eq('mandatos.visible_en_rod', true)
      .not('sector', 'is', null);

    const uniqueSectorNames = [...new Set((availableSectorsData || []).map(d => d.sector).filter(Boolean))].sort();

    // Enrich with translations from sectors table
    const { data: sectorsData } = await supabase
      .from('sectors')
      .select('name_es, name_en, slug')
      .eq('is_active', true)
      .order('display_order');

    // Only include sectors that exist in visible operations
    let sectors: { key: string; label: string }[] = uniqueSectorNames.map(sectorName => {
      const match = sectorsData?.find(s => s.name_es === sectorName);
      return {
        key: match?.slug || sectorName,
        label: (locale === 'en' && match?.name_en) ? match.name_en : sectorName
      };
    });

    // Unique locations from datos_proyecto
    let locations: string[] = [];
    const { data: locationsData } = await supabase
      .from('datos_proyecto')
      .select('ubicacion, mandatos!inner(visible_en_rod)')
      .eq('mandatos.visible_en_rod', true)
      .not('ubicacion', 'is', null);

    if (locationsData) {
      locations = [...new Set(locationsData.map(d => d.ubicacion).filter(Boolean))].sort();
    }

    // Deal types from mandatos
    const dealTypes = ['venta', 'compra'];

    console.log(`✅ Retrieved ${data?.length || 0} operations out of ${count || 0} total (ROD source)`);

    // ── Map response to frontend-compatible shape ──
    const resolvedData = (data || []).map(row => {
      const mandato = row.mandatos as any;
      
      // Find sector translation
      const sectorMatch = sectorsData?.find(s => s.name_es === row.sector);
      const resolvedSector = (locale === 'en' && sectorMatch?.name_en)
        ? sectorMatch.name_en
        : row.sector;

      // Phase mapping
      const phaseMap: Record<string, string> = {
        'en_preparacion': 'En Preparación',
        'go_to_market': 'Go to Market',
        'negociacion_y_cierre': 'Negociación y Cierre'
      };

      return {
        id: mandato?.id || row.mandato_id,
        project_name: row.project_name || mandato?.nombre_proyecto || 'Operación confidencial',
        project_number: row.project_number,
        sector: row.sector,
        resolved_sector: resolvedSector,
        revenue_amount: row.revenue_amount ? Number(row.revenue_amount) : null,
        ebitda_amount: row.ebitda_amount ? Number(row.ebitda_amount) : null,
        ebitda_margin: row.ebitda_margin ? Number(row.ebitda_margin) : null,
        rango_facturacion_min: row.rango_facturacion_min ? Number(row.rango_facturacion_min) : null,
        rango_facturacion_max: row.rango_facturacion_max ? Number(row.rango_facturacion_max) : null,
        rango_ebitda_min: row.rango_ebitda_min ? Number(row.rango_ebitda_min) : null,
        rango_ebitda_max: row.rango_ebitda_max ? Number(row.rango_ebitda_max) : null,
        valuation_currency: 'EUR',
        year: row.year,
        description: row.description,
        short_description: row.short_description,
        resolved_description: (locale === 'en' && row.description_en) ? row.description_en : row.description,
        resolved_short_description: (locale === 'en' && row.short_description_en) ? row.short_description_en : row.short_description,
        geographic_location: row.ubicacion,
        deal_type: mandato?.tipo === 'venta' ? 'sale' : mandato?.tipo === 'compra' ? 'acquisition' : mandato?.tipo,
        is_featured: mandato?.is_favorite || false,
        is_active: true,
        project_status: row.estado,
        project_status_label: phaseMap[row.estado] || row.estado,
        created_at: row.created_at,
        updated_at: row.updated_at,
      };
    });

    return new Response(
      JSON.stringify({
        data: resolvedData,
        count: count || 0,
        sectors,
        locations,
        dealTypes,
        locale
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ CRITICAL ERROR in list-operations:', error.message);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message, data: [], count: 0, sectors: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
