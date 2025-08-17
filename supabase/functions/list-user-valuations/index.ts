import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ValuationSummary {
  id: string;
  created_at: string;
  company_name: string;
  valuation_status: string;
  final_valuation: number | null;
  current_step: number;
  completion_percentage: number;
}

interface ListRequest {
  limit?: number;
  cursor?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface ListResponse {
  data: ValuationSummary[];
  nextCursor?: string;
  totalCount?: number;
  hasMore: boolean;
}

interface CursorData {
  created_at: string;
  id: string;
}

function encodeCursor(data: CursorData): string {
  return btoa(JSON.stringify(data));
}

function decodeCursor(cursor: string): CursorData | null {
  try {
    return JSON.parse(atob(cursor));
  } catch {
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get JWT token from Authorization header
    const authorization = req.headers.get('Authorization');
    if (!authorization) {
      console.error('Missing Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authorization header required' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client with anon key to apply RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authorization,
        },
      },
    });

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Authenticated user:', user.id);

    // Parse request body
    let params: ListRequest = {};
    if (req.method === 'POST') {
      params = await req.json();
    } else if (req.method === 'GET') {
      const url = new URL(req.url);
      params = {
        limit: url.searchParams.get('limit') ? parseInt(url.searchParams.get('limit')!) : undefined,
        cursor: url.searchParams.get('cursor') || undefined,
        status: url.searchParams.get('status') || undefined,
        dateFrom: url.searchParams.get('dateFrom') || undefined,
        dateTo: url.searchParams.get('dateTo') || undefined,
        search: url.searchParams.get('search') || undefined,
      };
    }

    // Validate and set defaults
    const limit = Math.min(params.limit || 20, 100);
    const cursor = params.cursor;
    const status = params.status;
    const dateFrom = params.dateFrom;
    const dateTo = params.dateTo;
    const search = params.search;

    console.log('Request params:', { limit, cursor, status, dateFrom, dateTo, search });

    // Build query
    let query = supabase
      .from('company_valuations')
      .select(`
        id,
        created_at,
        company_name,
        valuation_status,
        final_valuation,
        current_step,
        completion_percentage
      `)
      .order('created_at', { ascending: false })
      .order('id', { ascending: false })
      .limit(limit + 1); // Get one extra to check if there are more

    // Apply filters
    if (status) {
      query = query.eq('valuation_status', status);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    if (search && search.trim()) {
      query = query.ilike('company_name', `%${search.trim()}%`);
    }

    // Apply cursor pagination
    if (cursor) {
      const cursorData = decodeCursor(cursor);
      if (cursorData) {
        query = query.or(
          `created_at.lt.${cursorData.created_at},and(created_at.eq.${cursorData.created_at},id.lt.${cursorData.id})`
        );
      } else {
        console.warn('Invalid cursor format, ignoring cursor');
      }
    }

    // Execute query
    const { data: valuations, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch valuations' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Process results
    const hasMore = valuations.length > limit;
    const data = hasMore ? valuations.slice(0, limit) : valuations;
    
    let nextCursor: string | undefined;
    if (hasMore && data.length > 0) {
      const lastItem = data[data.length - 1];
      nextCursor = encodeCursor({
        created_at: lastItem.created_at,
        id: lastItem.id
      });
    }

    // Get total count (optional, for first page only to avoid performance impact)
    let totalCount: number | undefined;
    if (!cursor) {
      let countQuery = supabase
        .from('company_valuations')
        .select('*', { count: 'exact', head: true });

      // Apply same filters for count
      if (status) countQuery = countQuery.eq('valuation_status', status);
      if (dateFrom) countQuery = countQuery.gte('created_at', dateFrom);
      if (dateTo) countQuery = countQuery.lte('created_at', dateTo);
      if (search && search.trim()) {
        countQuery = countQuery.ilike('company_name', `%${search.trim()}%`);
      }

      const { count, error: countError } = await countQuery;
      if (!countError) {
        totalCount = count;
      }
    }

    const response: ListResponse = {
      data: data as ValuationSummary[],
      nextCursor,
      totalCount,
      hasMore
    };

    console.log(`Returning ${data.length} valuations, hasMore: ${hasMore}, totalCount: ${totalCount}`);

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});