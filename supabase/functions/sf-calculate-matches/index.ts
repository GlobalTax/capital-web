import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchResult {
  fund_id: string;
  match_score: number;
  match_reasons: {
    geography: number;
    sector: number;
    size: number;
    evidence: number;
    excluded?: boolean;
    exclusion_reason?: string;
    details: string[];
  };
}

interface Fund {
  id: string;
  name: string;
  status: string;
  geography_focus: string[] | null;
  sector_focus: string[] | null;
  sector_exclusions: string[] | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  revenue_min: number | null;
  revenue_max: number | null;
}

interface Operation {
  id: string;
  geographic_location: string | null;
  sector: string | null;
  subsector: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
}

interface Acquisition {
  country: string | null;
  sector: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { entityType, entityId, recalculateAll } = await req.json();

    // Get all active search funds
    const { data: funds, error: fundsError } = await supabase
      .from("sf_funds")
      .select("*");

    if (fundsError) throw fundsError;

    // Get acquisitions for evidence scoring
    const { data: acquisitions, error: acqError } = await supabase
      .from("sf_acquisitions")
      .select("fund_id, country, sector");

    if (acqError) throw acqError;

    // Group acquisitions by fund
    const acquisitionsByFund = new Map<string, Acquisition[]>();
    acquisitions?.forEach((acq) => {
      const list = acquisitionsByFund.get(acq.fund_id) || [];
      list.push({ country: acq.country, sector: acq.sector });
      acquisitionsByFund.set(acq.fund_id, list);
    });

    let operations: Operation[] = [];

    if (recalculateAll) {
      // Get all operations
      const { data, error } = await supabase
        .from("company_operations")
        .select("id, geographic_location, sector, subsector, revenue_amount, ebitda_amount")
        .eq("status", "active");
      
      if (error) throw error;
      operations = data || [];
    } else if (entityType === "operation" && entityId) {
      // Get specific operation
      const { data, error } = await supabase
        .from("company_operations")
        .select("id, geographic_location, sector, subsector, revenue_amount, ebitda_amount")
        .eq("id", entityId)
        .single();
      
      if (error) throw error;
      if (data) operations = [data];
    }

    const results: any[] = [];

    for (const operation of operations) {
      for (const fund of funds as Fund[]) {
        const match = calculateMatch(fund, operation, acquisitionsByFund.get(fund.id) || []);
        
        if (match.match_score > 0) {
          // Upsert match
          const { error: upsertError } = await supabase
            .from("sf_matches")
            .upsert({
              fund_id: fund.id,
              crm_entity_type: "operation",
              crm_entity_id: operation.id,
              match_score: match.match_score,
              match_reasons: match.match_reasons,
              last_scored_at: new Date().toISOString(),
            }, {
              onConflict: "fund_id,crm_entity_type,crm_entity_id",
            });

          if (upsertError) {
            console.error("Upsert error:", upsertError);
          } else {
            results.push(match);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        matches_calculated: results.length,
        operations_processed: operations.length 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateMatch(
  fund: Fund,
  operation: Operation,
  fundAcquisitions: Acquisition[]
): MatchResult {
  const reasons: MatchResult["match_reasons"] = {
    geography: 0,
    sector: 0,
    size: 0,
    evidence: 0,
    details: [],
  };

  // Check exclusions first
  if (fund.sector_exclusions && fund.sector_exclusions.length > 0) {
    const opSectors = [operation.sector, operation.subsector].filter(Boolean).map(s => s?.toLowerCase());
    const excluded = fund.sector_exclusions.some(ex => 
      opSectors.some(s => s?.includes(ex.toLowerCase()))
    );
    
    if (excluded) {
      return {
        fund_id: fund.id,
        match_score: 0,
        match_reasons: {
          ...reasons,
          excluded: true,
          exclusion_reason: `Sector excluido: ${operation.sector}`,
        },
      };
    }
  }

  // 1. Geography fit (0-30 points)
  if (fund.geography_focus && fund.geography_focus.length > 0 && operation.geographic_location) {
    const geoMatch = fund.geography_focus.some(g => 
      operation.geographic_location?.toLowerCase().includes(g.toLowerCase()) ||
      g.toLowerCase().includes(operation.geographic_location?.toLowerCase() || "")
    );
    
    if (geoMatch) {
      reasons.geography = 30;
      reasons.details.push(`Geografía: ${operation.geographic_location} coincide con foco del fund`);
    } else {
      reasons.geography = 5;
      reasons.details.push(`Geografía: ${operation.geographic_location} no es foco principal`);
    }
  } else {
    reasons.geography = 15; // Neutral if no geo focus defined
  }

  // 2. Sector fit (0-25 points)
  if (fund.sector_focus && fund.sector_focus.length > 0) {
    const opSectors = [operation.sector, operation.subsector].filter(Boolean);
    const sectorMatch = fund.sector_focus.some(s => 
      opSectors.some(os => 
        os?.toLowerCase().includes(s.toLowerCase()) ||
        s.toLowerCase().includes(os?.toLowerCase() || "")
      )
    );
    
    if (sectorMatch) {
      reasons.sector = 25;
      reasons.details.push(`Sector: ${operation.sector} coincide con foco del fund`);
    } else {
      reasons.sector = 5;
      reasons.details.push(`Sector: ${operation.sector} no es foco principal`);
    }
  } else {
    reasons.sector = 12; // Neutral
  }

  // 3. Size fit (0-25 points)
  let sizePoints = 0;
  let sizeMatches = 0;

  // Check EBITDA range
  if (operation.ebitda_amount !== null) {
    const ebitda = operation.ebitda_amount;
    const minOk = fund.ebitda_min === null || ebitda >= fund.ebitda_min;
    const maxOk = fund.ebitda_max === null || ebitda <= fund.ebitda_max;
    
    if (minOk && maxOk) {
      sizeMatches++;
      reasons.details.push(`EBITDA: ${formatNumber(ebitda)}€ dentro del rango del fund`);
    }
  }

  // Check Revenue range
  if (operation.revenue_amount !== null) {
    const revenue = operation.revenue_amount;
    const minOk = fund.revenue_min === null || revenue >= fund.revenue_min;
    const maxOk = fund.revenue_max === null || revenue <= fund.revenue_max;
    
    if (minOk && maxOk) {
      sizeMatches++;
      reasons.details.push(`Revenue: ${formatNumber(revenue)}€ dentro del rango del fund`);
    }
  }

  if (sizeMatches === 2) {
    reasons.size = 25;
  } else if (sizeMatches === 1) {
    reasons.size = 15;
  } else {
    reasons.size = 5;
  }

  // 4. Evidence fit (0-20 points) - based on previous acquisitions
  if (fundAcquisitions.length > 0) {
    const countryMatch = fundAcquisitions.some(a => 
      a.country?.toLowerCase() === operation.geographic_location?.toLowerCase()
    );
    const sectorMatch = fundAcquisitions.some(a => 
      a.sector?.toLowerCase() === operation.sector?.toLowerCase()
    );

    if (countryMatch && sectorMatch) {
      reasons.evidence = 20;
      reasons.details.push("El fund tiene adquisiciones previas en mismo país y sector");
    } else if (countryMatch || sectorMatch) {
      reasons.evidence = 10;
      reasons.details.push("El fund tiene adquisiciones previas similares");
    } else {
      reasons.evidence = 3;
    }
  } else {
    reasons.evidence = 5; // No track record yet
  }

  // Calculate total score
  let totalScore = reasons.geography + reasons.sector + reasons.size + reasons.evidence;

  // Apply status penalty for non-searching funds
  if (fund.status !== "searching") {
    totalScore = Math.max(0, totalScore - 30);
    reasons.details.push(`Penalización: Fund no está en búsqueda activa (status: ${fund.status})`);
  }

  return {
    fund_id: fund.id,
    match_score: Math.min(100, totalScore),
    match_reasons: reasons,
  };
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toString();
}
