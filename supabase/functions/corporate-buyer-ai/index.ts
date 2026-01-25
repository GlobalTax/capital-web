import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  sectorsMatch,
  geographyMatches,
  calculateSemanticScore,
  expandSectorsForQuery
} from "./sector-aliases.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CorporateBuyer {
  id: string;
  name: string;
  description: string | null;
  investment_thesis: string | null;
  sector_focus: string[] | null;
  sector_exclusions: string[] | null;
  geography_focus: string[] | null;
  revenue_min: number | null;
  revenue_max: number | null;
  ebitda_min: number | null;
  ebitda_max: number | null;
  buyer_type: string | null;
  website: string | null;
  search_keywords: string[] | null;
}

interface Empresa {
  id: string;
  nombre: string;
  sector: string | null;
  ubicacion: string | null;
  facturacion: number | null;
  revenue: number | null;
  ebitda: number | null;
  descripcion: string | null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { buyer_id, action } = await req.json();

    if (!buyer_id || !action) {
      return new Response(
        JSON.stringify({ error: "buyer_id and action are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!lovableApiKey) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch buyer data
    const { data: buyer, error: buyerError } = await supabase
      .from("corporate_buyers")
      .select("*")
      .eq("id", buyer_id)
      .single();

    if (buyerError || !buyer) {
      return new Response(
        JSON.stringify({ error: "Buyer not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let result;

    switch (action) {
      case "suggest_targets":
        result = await suggestTargets(supabase, buyer as CorporateBuyer, lovableApiKey);
        break;
      case "improve_description":
        result = await improveDescription(buyer as CorporateBuyer, lovableApiKey);
        break;
      case "generate_thesis":
        result = await generateThesis(buyer as CorporateBuyer, lovableApiKey);
        break;
      case "match_operations":
        result = await matchOperations(supabase, buyer as CorporateBuyer, lovableApiKey);
        break;
      case "auto_configure":
        result = await autoConfigureCriteria(supabase, buyer as CorporateBuyer, lovableApiKey);
        break;
      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in corporate-buyer-ai:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ========================================
// SUGGEST TARGETS - Find matching empresas
// ========================================
async function suggestTargets(
  supabase: ReturnType<typeof createClient>,
  buyer: CorporateBuyer,
  apiKey: string
) {
  // Check if buyer has enough criteria for matching
  const hasSectors = buyer.sector_focus && buyer.sector_focus.length > 0;
  const hasGeo = buyer.geography_focus && buyer.geography_focus.length > 0;
  const hasFinancials = buyer.revenue_min || buyer.revenue_max;
  
  // Build base query - NO artificial limit
  let query = supabase
    .from("empresas")
    .select("id, nombre, sector, ubicacion, facturacion, revenue, ebitda, descripcion")
    .not("nombre", "is", null);

  // Pre-filter by financial range at database level if available
  if (buyer.revenue_min) {
    query = query.or(`facturacion.gte.${buyer.revenue_min},revenue.gte.${buyer.revenue_min}`);
  }

  // Limit to reasonable number after pre-filtering
  query = query.limit(500);

  const { data: empresas, error } = await query;

  if (error) {
    console.error("Error fetching empresas:", error);
    return { matches: [], total_candidates_analyzed: 0, error: error.message };
  }

  if (!empresas || empresas.length === 0) {
    return { 
      matches: [], 
      total_candidates_analyzed: 0, 
      message: "No hay empresas en la base de datos",
      diagnostics: {
        has_sector_criteria: hasSectors,
        has_geo_criteria: hasGeo,
        has_financial_criteria: hasFinancials
      }
    };
  }

  console.log(`Analyzing ${empresas.length} empresas for buyer ${buyer.name}`);

  // Calculate fit scores with improved matching
  const scoredEmpresas = empresas.map((empresa: Empresa) => {
    let score = 0;
    const reasons: string[] = [];
    const risks: string[] = [];
    
    const empresaRevenue = empresa.facturacion || empresa.revenue;

    // Sector match with aliases (35 pts)
    if (hasSectors && empresa.sector) {
      if (sectorsMatch(buyer.sector_focus!, empresa.sector)) {
        score += 35;
        reasons.push(`Sector ${empresa.sector} coincide con foco del comprador`);
      }
    } else if (!hasSectors && empresa.sector) {
      // If no sector criteria, give partial points for having sector data
      score += 10;
      reasons.push(`Sector: ${empresa.sector}`);
    }

    // Geography match with aliases (25 pts)
    if (hasGeo && empresa.ubicacion) {
      if (geographyMatches(buyer.geography_focus!, empresa.ubicacion)) {
        score += 25;
        reasons.push(`Ubicación ${empresa.ubicacion} en geografía objetivo`);
      }
    } else if (!hasGeo && empresa.ubicacion) {
      // Partial points for having location data
      score += 5;
    }

    // Revenue range match (25 pts)
    if (empresaRevenue) {
      const minOk = !buyer.revenue_min || empresaRevenue >= buyer.revenue_min;
      const maxOk = !buyer.revenue_max || empresaRevenue <= buyer.revenue_max;
      if (minOk && maxOk) {
        score += 25;
        reasons.push(`Facturación €${(empresaRevenue / 1000000).toFixed(1)}M en rango`);
      } else {
        risks.push("Facturación fuera de rango objetivo");
      }
    } else {
      risks.push("Sin datos de facturación");
    }

    // EBITDA check (15 pts)
    if (empresa.ebitda) {
      const minOk = !buyer.ebitda_min || empresa.ebitda >= buyer.ebitda_min;
      const maxOk = !buyer.ebitda_max || empresa.ebitda <= buyer.ebitda_max;
      if (minOk && maxOk) {
        score += 15;
        reasons.push(`EBITDA €${(empresa.ebitda / 1000000).toFixed(1)}M compatible`);
      }
    } else {
      risks.push("Sin datos de EBITDA");
    }

    // Semantic matching with keywords (up to 50 extra pts)
    const semanticResult = calculateSemanticScore(
      buyer.search_keywords,
      buyer.investment_thesis,
      empresa.descripcion
    );
    
    if (semanticResult.score > 0) {
      score += semanticResult.score;
      if (semanticResult.matchedTerms.length > 0) {
        reasons.push(`Keywords: ${semanticResult.matchedTerms.join(', ')}`);
      }
    }

    return {
      empresa_id: empresa.id,
      nombre: empresa.nombre,
      sector: empresa.sector,
      ubicacion: empresa.ubicacion,
      revenue: empresaRevenue,
      ebitda: empresa.ebitda,
      descripcion: empresa.descripcion,
      fit_score: Math.min(score, 100),
      fit_reasons: reasons,
      risks
    };
  });

  // Filter and sort by score - lowered threshold for better results
  const qualifiedMatches = scoredEmpresas
    .filter(e => e.fit_score >= 20)
    .sort((a, b) => b.fit_score - a.fit_score)
    .slice(0, 20);

  // Use AI to refine the top matches with semantic analysis
  if (qualifiedMatches.length > 0) {
    try {
      const refinedMatches = await refineMatchesWithAI(
        buyer,
        qualifiedMatches.slice(0, 15),
        apiKey
      );
      return {
        matches: refinedMatches,
        total_candidates_analyzed: empresas.length,
        buyer_criteria: {
          sectors: buyer.sector_focus,
          geography: buyer.geography_focus,
          revenue_range: `€${buyer.revenue_min ? (buyer.revenue_min/1000000).toFixed(0) : '?'}M - €${buyer.revenue_max ? (buyer.revenue_max/1000000).toFixed(0) : '?'}M`
        },
        diagnostics: {
          has_sector_criteria: hasSectors,
          has_geo_criteria: hasGeo,
          has_financial_criteria: hasFinancials,
          pre_filter_count: empresas.length,
          qualified_count: qualifiedMatches.length
        }
      };
    } catch (aiError) {
      console.error("AI refinement failed, returning basic matches:", aiError);
    }
  }

  return {
    matches: qualifiedMatches,
    total_candidates_analyzed: empresas.length,
    diagnostics: {
      has_sector_criteria: hasSectors,
      has_geo_criteria: hasGeo,
      has_financial_criteria: hasFinancials
    },
    message: qualifiedMatches.length === 0 
      ? `No se encontraron empresas que coincidan. ${!hasSectors ? 'Configura sectores de interés para mejores resultados.' : ''}`
      : undefined
  };
}

async function refineMatchesWithAI(
  buyer: CorporateBuyer,
  matches: any[],
  apiKey: string
) {
  const prompt = `Eres un analista M&A experto. Analiza el encaje entre este comprador corporativo y las empresas candidatas.

COMPRADOR: ${buyer.name}
- Tipo: ${buyer.buyer_type || 'No especificado'}
- Sectores objetivo: ${buyer.sector_focus?.join(', ') || 'No especificado'}
- Geografía: ${buyer.geography_focus?.join(', ') || 'No especificada'}
- Tesis de inversión: ${buyer.investment_thesis || 'No especificada'}
- Descripción: ${buyer.description || 'Sin descripción'}
- Keywords: ${buyer.search_keywords?.join(', ') || 'No especificados'}

EMPRESAS CANDIDATAS:
${matches.map((m, i) => `${i+1}. ${m.nombre} - Sector: ${m.sector || 'N/A'}, Ubicación: ${m.ubicacion || 'N/A'}, Revenue: €${m.revenue ? (m.revenue/1000000).toFixed(1) + 'M' : 'N/A'}, Descripción: ${m.descripcion?.substring(0, 200) || 'Sin descripción'}`).join('\n')}

Para cada empresa, devuelve un JSON array con objetos que contengan:
- empresa_id: el id original
- ai_score: puntuación de 0-100 basada en encaje estratégico
- ai_reasoning: explicación breve (max 50 palabras) del encaje
- strategic_fit: "alto", "medio" o "bajo"

Responde SOLO con el JSON array, sin texto adicional.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Eres un analista M&A experto. Responde siempre en JSON válido." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "[]";
  
  // Parse AI response
  try {
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiScores = JSON.parse(jsonMatch[0]);
      
      // Merge AI scores with original matches
      return matches.map(match => {
        const aiData = aiScores.find((a: any) => a.empresa_id === match.empresa_id);
        return {
          ...match,
          ai_score: aiData?.ai_score || match.fit_score,
          ai_reasoning: aiData?.ai_reasoning || null,
          strategic_fit: aiData?.strategic_fit || "medio",
          combined_score: Math.round(
            (match.fit_score * 0.4) + ((aiData?.ai_score || match.fit_score) * 0.6)
          )
        };
      }).sort((a, b) => b.combined_score - a.combined_score);
    }
  } catch (parseError) {
    console.error("Failed to parse AI response:", parseError);
  }
  
  return matches;
}

// ========================================
// IMPROVE DESCRIPTION
// ========================================
async function improveDescription(buyer: CorporateBuyer, apiKey: string) {
  const STANDARD_SECTORS = [
    'Agricultura', 'Alimentación y Bebidas', 'Asesorías Profesionales', 'Automoción',
    'Construcción', 'Educación', 'Energía y Renovables', 'Farmacéutico',
    'Industrial y Manufacturero', 'Inmobiliario', 'Logística y Transporte',
    'Medios y Entretenimiento', 'Químico', 'Retail y Consumo', 'Salud y Biotecnología',
    'Seguridad', 'Servicios Financieros', 'Tecnología', 'Telecomunicaciones',
    'Textil y Moda', 'Turismo y Hostelería', 'Otros'
  ];

  const prompt = `Eres un consultor M&A senior especializado en el mercado español. Mejora la siguiente descripción de comprador corporativo para que sea más clara, profesional y útil para identificar oportunidades de M&A.

COMPRADOR: ${buyer.name}
TIPO: ${buyer.buyer_type || 'No especificado'}
DESCRIPCIÓN ACTUAL: ${buyer.description || 'Sin descripción'}
TESIS DE INVERSIÓN: ${buyer.investment_thesis || 'No especificada'}
SECTORES: ${buyer.sector_focus?.join(', ') || 'No especificados'}
GEOGRAFÍA: ${buyer.geography_focus?.join(', ') || 'No especificada'}
WEB: ${buyer.website || 'No disponible'}

Genera una descripción mejorada en castellano (máximo 400 palabras) estructurada así:
1. **Resumen ejecutivo**: Quiénes son y qué buscan
2. **Experiencia y track record**: Capacidades demostradas
3. **Enfoque de inversión**: Tipo de empresas objetivo
4. **Valor añadido**: Qué aportan a las empresas adquiridas

También sugiere 3-5 keywords de búsqueda relevantes.

IMPORTANTE: Basándote en la descripción y tesis, selecciona los sectores más relevantes ÚNICAMENTE de esta lista:
${STANDARD_SECTORS.join(', ')}

Responde en JSON con este formato:
{
  "improved_description": "texto de la descripción mejorada",
  "key_highlights": ["punto clave 1", "punto clave 2", "punto clave 3"],
  "suggested_keywords": ["keyword1", "keyword2", "keyword3"],
  "suggested_sectors": ["Sector1", "Sector2"]
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Eres un consultor M&A experto. Responde siempre en JSON válido en castellano." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse AI response:", e);
  }
  
  return {
    improved_description: content,
    key_highlights: [],
    suggested_keywords: [],
    suggested_sectors: []
  };
}

// ========================================
// GENERATE THESIS
// ========================================
async function generateThesis(buyer: CorporateBuyer, apiKey: string) {
  // Determinar el nivel de información disponible
  const hasDescription = buyer.description && buyer.description.length > 50;
  const hasSectors = buyer.sector_focus && buyer.sector_focus.length > 0;
  const hasFinancials = buyer.revenue_min || buyer.revenue_max || buyer.ebitda_min || buyer.ebitda_max;
  const hasGeography = buyer.geography_focus && buyer.geography_focus.length > 0;
  const hasKeywords = buyer.search_keywords && buyer.search_keywords.length > 0;
  
  // Calcular nivel de contexto para ajustar el prompt
  const contextLevel = [hasDescription, hasSectors, hasFinancials, hasGeography, hasKeywords].filter(Boolean).length;
  
  let contextGuidance = '';
  if (contextLevel < 2) {
    contextGuidance = `
NOTA IMPORTANTE: Este comprador tiene poca información disponible. Debes:
1. Inferir una tesis de inversión lógica basada en el tipo de comprador (${buyer.buyer_type || 'corporativo'})
2. Proponer sectores y geografías típicas para este tipo de inversor
3. Sugerir rangos financieros estándar del mercado
4. Ser creativo pero profesional en las suposiciones`;
  }

  const prompt = `Eres un estratega de M&A con 20 años de experiencia en el mercado ibérico. Genera una tesis de inversión profesional y estructurada para este comprador corporativo.

PERFIL DEL COMPRADOR:
- Nombre: ${buyer.name}
- Tipo: ${buyer.buyer_type || 'Corporativo'}
- Web: ${buyer.website || 'No disponible'}
- Sectores objetivo: ${buyer.sector_focus?.join(', ') || 'No especificados'}
- Keywords de búsqueda: ${buyer.search_keywords?.join(', ') || 'No especificados'}
- Exclusiones: ${buyer.sector_exclusions?.join(', ') || 'Ninguna especificada'}
- Geografía: ${buyer.geography_focus?.join(', ') || 'No especificada'}
- Rango facturación: €${buyer.revenue_min ? (buyer.revenue_min/1000000).toFixed(0) : '?'}M - €${buyer.revenue_max ? (buyer.revenue_max/1000000).toFixed(0) : '?'}M
- Rango EBITDA: €${buyer.ebitda_min ? (buyer.ebitda_min/1000000).toFixed(1) : '?'}M - €${buyer.ebitda_max ? (buyer.ebitda_max/1000000).toFixed(1) : '?'}M
- Descripción actual: ${buyer.description || 'Sin descripción detallada'}
- Tesis actual: ${buyer.investment_thesis || 'Sin tesis definida'}
${contextGuidance}

Genera una tesis de inversión completa en castellano con:
1. Objetivo estratégico (qué quieren lograr - sé específico basándote en el tipo de comprador)
2. Perfil de empresa ideal (características específicas del target perfecto)
3. Criterios de exclusión (qué no buscan - mínimo 3)
4. Sinergias buscadas (operativas, comerciales, tecnológicas - mínimo 3)
5. Proceso de evaluación (cómo valorarán las oportunidades paso a paso)

El texto de investment_thesis_text debe ser un párrafo completo y profesional de 150-200 palabras que pueda usarse directamente en documentos de M&A.

Responde en JSON:
{
  "thesis": {
    "strategic_objective": "texto del objetivo estratégico",
    "ideal_target_profile": "descripción detallada del perfil ideal",
    "exclusion_criteria": ["criterio 1", "criterio 2", "criterio 3"],
    "synergies_sought": ["sinergia 1", "sinergia 2", "sinergia 3"],
    "evaluation_process": "descripción del proceso de evaluación"
  },
  "summary": "Resumen ejecutivo de 2-3 frases",
  "investment_thesis_text": "Texto completo de la tesis de inversión para usar directamente"
}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: "Eres un estratega M&A senior. Responde en JSON válido en castellano." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error("Failed to parse AI response:", e);
  }
  
  return {
    thesis: {
      strategic_objective: content,
      ideal_target_profile: "",
      exclusion_criteria: [],
      synergies_sought: [],
      evaluation_process: ""
    },
    summary: "",
    investment_thesis_text: content
  };
}

// ========================================
// MATCH OPERATIONS - Improved with aliases
// ========================================
async function matchOperations(
  supabase: ReturnType<typeof createClient>,
  buyer: CorporateBuyer,
  apiKey: string
) {
  // Check if buyer has enough criteria
  const hasSectors = buyer.sector_focus && buyer.sector_focus.length > 0;
  const hasGeo = buyer.geography_focus && buyer.geography_focus.length > 0;

  // 1. Fetch ALL active sell-side operations (no artificial limit)
  const { data: sellOperations, error: sellError } = await supabase
    .from("company_operations")
    .select("id, company_name, sector, subsector, geographic_location, display_locations, revenue_amount, ebitda_amount, description, short_description, status, project_status")
    .eq("is_active", true)
    .eq("is_deleted", false);

  if (sellError) {
    console.error("Error fetching sell operations:", sellError);
  }

  // 2. Fetch buy-side mandates
  const { data: mandates, error: mandatesError } = await supabase
    .from("buy_side_mandates")
    .select("*")
    .eq("is_active", true);

  if (mandatesError) {
    console.error("Error fetching mandates:", mandatesError);
  }

  console.log(`Matching ${sellOperations?.length || 0} operations and ${mandates?.length || 0} mandates for buyer ${buyer.name}`);

  const allMatches: any[] = [];

  // 3. Score sell-side operations with improved matching
  if (sellOperations && sellOperations.length > 0) {
    const scoredSellOps = sellOperations.map((op: any) => {
      let score = 0;
      const reasons: string[] = [];

      // Sector match with aliases (35 pts)
      if (hasSectors && op.sector) {
        if (sectorsMatch(buyer.sector_focus!, op.sector)) {
          score += 35;
          reasons.push(`Sector ${op.sector} coincide`);
        } else if (op.subsector && sectorsMatch(buyer.sector_focus!, op.subsector)) {
          score += 25;
          reasons.push(`Subsector ${op.subsector} coincide`);
        }
      } else if (!hasSectors && op.sector) {
        // Partial score if no criteria but operation has sector
        score += 10;
        reasons.push(`Sector: ${op.sector}`);
      }

      // Geography match with aliases (25 pts)
      const opLocations = op.display_locations || [];
      const opGeo = op.geographic_location || '';
      const allLocations = [...opLocations, opGeo].filter(Boolean);
      
      if (hasGeo && allLocations.length > 0) {
        const geoMatch = allLocations.some((loc: string) => 
          geographyMatches(buyer.geography_focus!, loc)
        );
        if (geoMatch) {
          score += 25;
          reasons.push("Geografía compatible");
        }
      } else if (!hasGeo) {
        score += 5;
      }

      // Revenue range match (25 pts)
      if (op.revenue_amount) {
        const minOk = !buyer.revenue_min || op.revenue_amount >= buyer.revenue_min;
        const maxOk = !buyer.revenue_max || op.revenue_amount <= buyer.revenue_max;
        if (minOk && maxOk) {
          score += 25;
          reasons.push(`Facturación €${(op.revenue_amount / 1000000).toFixed(1)}M`);
        }
      }

      // EBITDA range match (15 pts)
      if (op.ebitda_amount) {
        const minOk = !buyer.ebitda_min || op.ebitda_amount >= buyer.ebitda_min;
        const maxOk = !buyer.ebitda_max || op.ebitda_amount <= buyer.ebitda_max;
        if (minOk && maxOk) {
          score += 15;
          reasons.push(`EBITDA €${(op.ebitda_amount / 1000000).toFixed(1)}M`);
        }
      }

      // Semantic matching with description (up to 30 extra pts)
      const opDescription = op.short_description || op.description;
      if (opDescription) {
        const semanticResult = calculateSemanticScore(
          buyer.search_keywords,
          buyer.investment_thesis,
          opDescription
        );
        if (semanticResult.score > 0) {
          score += Math.min(semanticResult.score, 30);
          if (semanticResult.matchedTerms.length > 0) {
            reasons.push(`Keywords: ${semanticResult.matchedTerms.slice(0, 2).join(', ')}`);
          }
        }
      }

      return {
        operation_id: op.id,
        title: op.company_name,
        type: "sell" as const,
        sector: op.sector,
        subsector: op.subsector,
        geographic_scope: opLocations.length > 0 ? opLocations.join(", ") : opGeo,
        revenue_amount: op.revenue_amount,
        revenue_range: op.revenue_amount
          ? `€${(op.revenue_amount / 1000000).toFixed(1)}M`
          : 'No especificado',
        description: op.short_description || op.description?.substring(0, 150),
        status: op.project_status || op.status,
        fit_score: Math.min(score, 100),
        fit_reasons: reasons
      };
    });

    allMatches.push(...scoredSellOps);
  }

  // 4. Score buy-side mandates with improved matching
  if (mandates && mandates.length > 0) {
    const scoredMandates = mandates.map((mandate: any) => {
      let score = 0;
      const reasons: string[] = [];

      // Sector match with aliases (40 pts)
      if (hasSectors && mandate.sector) {
        if (sectorsMatch(buyer.sector_focus!, mandate.sector)) {
          score += 40;
          reasons.push(`Sector ${mandate.sector} coincide`);
        }
      }

      // Geography match with aliases (30 pts)
      if (hasGeo && mandate.geographic_scope) {
        if (geographyMatches(buyer.geography_focus!, mandate.geographic_scope)) {
          score += 30;
          reasons.push(`Geografía ${mandate.geographic_scope} coincide`);
        }
      }

      // Revenue range overlap (20 pts)
      const revenueOverlap = checkRangeOverlap(
        buyer.revenue_min, buyer.revenue_max,
        mandate.revenue_min, mandate.revenue_max
      );
      if (revenueOverlap) {
        score += 20;
        reasons.push("Rango de facturación compatible");
      }

      // EBITDA range overlap (10 pts)
      const ebitdaOverlap = checkRangeOverlap(
        buyer.ebitda_min, buyer.ebitda_max,
        mandate.ebitda_min, mandate.ebitda_max
      );
      if (ebitdaOverlap) {
        score += 10;
        reasons.push("Rango de EBITDA compatible");
      }

      return {
        operation_id: mandate.id,
        mandate_id: mandate.id,
        title: mandate.title,
        type: "mandate" as const,
        sector: mandate.sector,
        subsector: mandate.subsector,
        geographic_scope: mandate.geographic_scope,
        revenue_range: mandate.revenue_min && mandate.revenue_max
          ? `€${(mandate.revenue_min / 1000000).toFixed(0)}M - €${(mandate.revenue_max / 1000000).toFixed(0)}M`
          : 'No especificado',
        description: mandate.description,
        fit_score: Math.min(score, 100),
        fit_reasons: reasons
      };
    });

    allMatches.push(...scoredMandates);
  }

  // 5. Filter and sort all matches - lowered threshold
  const qualifiedMatches = allMatches
    .filter(m => m.fit_score >= 20)
    .sort((a, b) => b.fit_score - a.fit_score);

  if (qualifiedMatches.length === 0) {
    return {
      matches: [],
      total_operations_analyzed: (sellOperations?.length || 0) + (mandates?.length || 0),
      sell_opportunities: sellOperations?.length || 0,
      buy_mandates: mandates?.length || 0,
      message: "No hay operaciones que coincidan con los criterios del comprador",
      suggestion: !hasSectors 
        ? "Configura sectores de interés para mejores resultados" 
        : "Revisa los criterios de sector, geografía o rangos financieros",
      diagnostics: {
        has_sector_criteria: hasSectors,
        has_geo_criteria: hasGeo
      }
    };
  }

  return {
    matches: qualifiedMatches,
    total_operations_analyzed: (sellOperations?.length || 0) + (mandates?.length || 0),
    sell_opportunities: sellOperations?.length || 0,
    buy_mandates: mandates?.length || 0,
    buyer_criteria: {
      sectors: buyer.sector_focus,
      geography: buyer.geography_focus
    },
    diagnostics: {
      has_sector_criteria: hasSectors,
      has_geo_criteria: hasGeo
    }
  };
}

function checkRangeOverlap(
  min1: number | null, max1: number | null,
  min2: number | null, max2: number | null
): boolean {
  if (!min1 && !max1) return true;
  if (!min2 && !max2) return true;

  const effectiveMin1 = min1 || 0;
  const effectiveMax1 = max1 || Infinity;
  const effectiveMin2 = min2 || 0;
  const effectiveMax2 = max2 || Infinity;

  return effectiveMin1 <= effectiveMax2 && effectiveMin2 <= effectiveMax1;
}

// ========================================
// AUTO-CONFIGURE CRITERIA (Single buyer)
// ========================================
const STANDARD_SECTORS = [
  'Agricultura', 'Alimentación y Bebidas', 'Asesorías Profesionales', 'Automoción',
  'Construcción', 'Educación', 'Energía y Renovables', 'Farmacéutico',
  'Industrial y Manufacturero', 'Inmobiliario', 'Logística y Transporte',
  'Medios y Entretenimiento', 'Químico', 'Retail y Consumo', 'Salud y Biotecnología',
  'Seguridad', 'Servicios Financieros', 'Tecnología', 'Telecomunicaciones',
  'Textil y Moda', 'Turismo y Hostelería', 'Otros'
];

const STANDARD_GEOGRAPHIES = [
  'España', 'Portugal', 'LATAM', 'Europa', 'Global', 'DACH', 
  'Francia', 'Italia', 'UK', 'USA', 'Iberia', 'Mediterráneo'
];

async function autoConfigureCriteria(
  supabase: ReturnType<typeof createClient>,
  buyer: CorporateBuyer,
  apiKey: string
) {
  // Validate buyer has description
  if (!buyer.description || buyer.description.length < 50) {
    return {
      success: false,
      message: 'El comprador necesita una descripción (min 50 caracteres) para auto-configurar'
    };
  }

  // Check what needs to be generated
  const needsSectors = !buyer.sector_focus || buyer.sector_focus.length === 0;
  const needsGeo = !buyer.geography_focus || buyer.geography_focus.length === 0;
  const needsKeywords = !buyer.search_keywords || buyer.search_keywords.length === 0;

  if (!needsSectors && !needsGeo && !needsKeywords) {
    return {
      success: true,
      message: 'El comprador ya tiene todos los criterios configurados',
      already_configured: true
    };
  }

  const prompt = `Eres un analista M&A experto. Analiza este comprador corporativo y extrae sus criterios de búsqueda de adquisiciones.

PERFIL DEL COMPRADOR:
- Nombre: ${buyer.name}
- Descripción: ${buyer.description}
- País base: ${(buyer as any).country_base || 'No especificado'}
- Website: ${buyer.website || 'No disponible'}
- Tesis actual: ${buyer.investment_thesis || 'No especificada'}
- Tipo: ${buyer.buyer_type || 'No especificado'}

SECTORES ESTÁNDAR (usa SOLO estos, max 4):
${STANDARD_SECTORS.join(', ')}

GEOGRAFÍAS ESTÁNDAR (usa SOLO estas, max 4):
${STANDARD_GEOGRAPHIES.join(', ')}

INSTRUCCIONES:
1. Analiza la descripción para identificar sectores de interés
2. Infiere la geografía objetivo
3. Extrae 3-6 keywords relevantes para búsqueda M&A
4. Sugiere el tipo de comprador si no está claro

Responde SOLO con JSON válido:
{
  "sector_focus": ["Sector1", "Sector2"],
  "geography_focus": ["España", "Europa"],
  "search_keywords": ["keyword1", "keyword2", "keyword3"],
  "buyer_type_suggestion": "corporate|family_office|pe_fund|strategic_buyer|holding"
}`;

  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: "Eres un analista M&A experto. Responde siempre en JSON válido." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, message: 'No se pudo generar criterios' };
    }

    const generated = JSON.parse(jsonMatch[0]);

    // Validate sectors
    if (generated.sector_focus) {
      generated.sector_focus = generated.sector_focus.filter((s: string) =>
        STANDARD_SECTORS.some(std => std.toLowerCase() === s.toLowerCase())
      );
    }

    // Validate geographies
    if (generated.geography_focus) {
      generated.geography_focus = generated.geography_focus.filter((g: string) =>
        STANDARD_GEOGRAPHIES.some(std => std.toLowerCase() === g.toLowerCase())
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {};
    
    if (needsSectors && generated.sector_focus?.length) {
      updateData.sector_focus = generated.sector_focus;
    }
    
    if (needsGeo && generated.geography_focus?.length) {
      updateData.geography_focus = generated.geography_focus;
    }
    
    if (needsKeywords && generated.search_keywords?.length) {
      updateData.search_keywords = generated.search_keywords;
    }

    // Update buyer type if not set
    if (!buyer.buyer_type && generated.buyer_type_suggestion) {
      const validTypes = ['corporate', 'family_office', 'pe_fund', 'strategic_buyer', 'holding'];
      if (validTypes.includes(generated.buyer_type_suggestion)) {
        updateData.buyer_type = generated.buyer_type_suggestion;
      }
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("corporate_buyers")
        .update(updateData)
        .eq("id", buyer.id);

      if (updateError) {
        throw new Error(updateError.message);
      }
    }

    return {
      success: true,
      message: 'Criterios generados y guardados',
      generated: {
        sector_focus: updateData.sector_focus || null,
        geography_focus: updateData.geography_focus || null,
        search_keywords: updateData.search_keywords || null,
        buyer_type: updateData.buyer_type || null
      },
      fields_updated: Object.keys(updateData)
    };

  } catch (error) {
    console.error("Error in autoConfigureCriteria:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido'
    };
  }
}
