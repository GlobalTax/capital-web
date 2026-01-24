import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface FundToScan {
  id: string;
  name: string;
  website: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let body: { fund_type?: 'sf' | 'cr'; limit?: number } = {};
    try {
      body = await req.json();
    } catch {
      // Default values if no body
    }

    const fundType = body.fund_type || 'cr';
    const limit = body.limit || 50;

    console.log(`Starting batch news scan for ${fundType} funds, limit: ${limit}`);

    // Get funds to scan - prioritize those with websites and not recently scanned
    let query;
    if (fundType === 'sf') {
      query = supabase
        .from('sf_funds')
        .select('id, name, website')
        .not('website', 'is', null)
        .order('last_news_scan_at', { ascending: true, nullsFirst: true })
        .limit(limit);
    } else {
      query = supabase
        .from('cr_funds')
        .select('id, name, website')
        .eq('is_deleted', false)
        .not('website', 'is', null)
        .order('last_news_scan_at', { ascending: true, nullsFirst: true })
        .limit(limit);
    }

    const { data: funds, error: fundsError } = await query;

    if (fundsError) {
      throw new Error(`Failed to fetch funds: ${fundsError.message}`);
    }

    if (!funds || funds.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No funds to scan', scanned: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${funds.length} funds to scan`);

    const results: { fundId: string; fundName: string; success: boolean; newsCount?: number; error?: string }[] = [];
    let totalNewsFound = 0;

    for (const fund of funds as FundToScan[]) {
      try {
        console.log(`Scanning news for: ${fund.name}`);
        
        // Call the existing fund-search-news function
        const { data: searchResult, error: searchError } = await supabase.functions.invoke('fund-search-news', {
          body: { fund_id: fund.id, fund_type: fundType },
        });

        if (searchError) {
          results.push({
            fundId: fund.id,
            fundName: fund.name,
            success: false,
            error: searchError.message,
          });
        } else {
          const newsCount = searchResult?.data?.saved_count || 0;
          totalNewsFound += newsCount;
          results.push({
            fundId: fund.id,
            fundName: fund.name,
            success: true,
            newsCount,
          });
        }

        // Rate limiting - wait between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.push({
          fundId: fund.id,
          fundName: fund.name,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const errorCount = results.filter(r => !r.success).length;

    console.log(`Batch scan complete. Success: ${successCount}, Errors: ${errorCount}, Total news: ${totalNewsFound}`);

    return new Response(
      JSON.stringify({
        success: true,
        scanned: funds.length,
        successCount,
        errorCount,
        totalNewsFound,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Batch news scan error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
