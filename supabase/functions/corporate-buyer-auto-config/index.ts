// =============================================
// CORPORATE BUYER AUTO-CONFIG
// Batch auto-configuration of buyer criteria
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// Standard sectors for consistent matching
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

interface AutoConfigRequest {
  buyer_ids: string[];
  fields_to_generate?: ('sector_focus' | 'geography_focus' | 'search_keywords')[];
  overwrite_existing?: boolean;
}

interface AutoConfigResult {
  buyer_id: string;
  buyer_name: string;
  status: 'configured' | 'skipped' | 'error';
  generated_fields?: {
    sector_focus?: string[];
    geography_focus?: string[];
    search_keywords?: string[];
    buyer_type?: string;
  };
  error_message?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 200 });
  }

  try {
    const body = await req.json() as AutoConfigRequest;
    const { 
      buyer_ids, 
      fields_to_generate = ['sector_focus', 'geography_focus', 'search_keywords'],
      overwrite_existing = false 
    } = body;

    if (!buyer_ids || buyer_ids.length === 0) {
      return new Response(
        JSON.stringify({ error: "buyer_ids array is required" }),
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

    // Fetch all buyers
    const { data: buyers, error: fetchError } = await supabase
      .from("corporate_buyers")
      .select("id, name, description, country_base, cities, website, investment_thesis, sector_focus, geography_focus, search_keywords, buyer_type")
      .in("id", buyer_ids);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!buyers || buyers.length === 0) {
      return new Response(
        JSON.stringify({ error: "No buyers found with provided IDs" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: AutoConfigResult[] = [];
    let configured = 0;
    let skipped = 0;
    let errors = 0;

    for (const buyer of buyers) {
      try {
        // Skip if no description
        if (!buyer.description || buyer.description.length < 50) {
          results.push({
            buyer_id: buyer.id,
            buyer_name: buyer.name,
            status: 'skipped',
            error_message: 'Sin descripción suficiente (min 50 caracteres)'
          });
          skipped++;
          continue;
        }

        // Check if already has criteria and not overwriting
        const hasSectors = buyer.sector_focus && buyer.sector_focus.length > 0;
        const hasGeo = buyer.geography_focus && buyer.geography_focus.length > 0;
        const hasKeywords = buyer.search_keywords && buyer.search_keywords.length > 0;
        
        if (!overwrite_existing && hasSectors && hasGeo && hasKeywords) {
          results.push({
            buyer_id: buyer.id,
            buyer_name: buyer.name,
            status: 'skipped',
            error_message: 'Ya tiene criterios configurados'
          });
          skipped++;
          continue;
        }

        // Generate criteria with AI
        const generated = await generateCriteriaWithAI(buyer, lovableApiKey, fields_to_generate, overwrite_existing);
        
        if (generated) {
          // Build update object
          const updateData: Record<string, unknown> = {};
          
          if (fields_to_generate.includes('sector_focus') && generated.sector_focus?.length && 
              (overwrite_existing || !hasSectors)) {
            updateData.sector_focus = generated.sector_focus;
          }
          
          if (fields_to_generate.includes('geography_focus') && generated.geography_focus?.length && 
              (overwrite_existing || !hasGeo)) {
            updateData.geography_focus = generated.geography_focus;
          }
          
          if (fields_to_generate.includes('search_keywords') && generated.search_keywords?.length && 
              (overwrite_existing || !hasKeywords)) {
            updateData.search_keywords = generated.search_keywords;
          }

          // Update buyer type if not set
          if (generated.buyer_type && !buyer.buyer_type) {
            updateData.buyer_type = generated.buyer_type;
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

          results.push({
            buyer_id: buyer.id,
            buyer_name: buyer.name,
            status: 'configured',
            generated_fields: generated
          });
          configured++;
        } else {
          results.push({
            buyer_id: buyer.id,
            buyer_name: buyer.name,
            status: 'error',
            error_message: 'AI no pudo generar criterios'
          });
          errors++;
        }

        // Rate limit delay (1.5s between requests)
        if (buyers.indexOf(buyer) < buyers.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }

      } catch (error) {
        console.error(`Error processing buyer ${buyer.name}:`, error);
        results.push({
          buyer_id: buyer.id,
          buyer_name: buyer.name,
          status: 'error',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        errors++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_processed: buyers.length,
        configured,
        skipped,
        errors,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in corporate-buyer-auto-config:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function generateCriteriaWithAI(
  buyer: any,
  apiKey: string,
  fields: string[],
  _overwrite: boolean
): Promise<{
  sector_focus?: string[];
  geography_focus?: string[];
  search_keywords?: string[];
  buyer_type?: string;
} | null> {
  const prompt = `Eres un analista M&A experto. Analiza este comprador corporativo y extrae sus criterios de búsqueda de adquisiciones.

PERFIL DEL COMPRADOR:
- Nombre: ${buyer.name}
- Descripción: ${buyer.description}
- País base: ${buyer.country_base || 'No especificado'}
- Ciudades: ${buyer.cities?.join(', ') || 'No especificadas'}
- Website: ${buyer.website || 'No disponible'}
- Tesis actual: ${buyer.investment_thesis || 'No especificada'}

SECTORES ESTÁNDAR (usa SOLO estos, max 4):
${STANDARD_SECTORS.join(', ')}

GEOGRAFÍAS ESTÁNDAR (usa SOLO estas, max 4):
${STANDARD_GEOGRAPHIES.join(', ')}

INSTRUCCIONES:
1. Analiza la descripción para identificar sectores de interés
2. Infiere la geografía objetivo (si tiene país base, inclúyelo)
3. Extrae 3-6 keywords relevantes para búsqueda M&A
4. Sugiere el tipo de comprador si no está claro

Responde SOLO con JSON válido:
{
  "sector_focus": ["Sector1", "Sector2"],
  "geography_focus": ["España", "Europa"],
  "search_keywords": ["keyword1", "keyword2", "keyword3"],
  "buyer_type": "corporate|family_office|pe_fund|strategic_buyer|holding"
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
      console.error(`AI API error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate sectors are from standard list
      if (parsed.sector_focus) {
        parsed.sector_focus = parsed.sector_focus.filter((s: string) => 
          STANDARD_SECTORS.some(std => std.toLowerCase() === s.toLowerCase())
        );
      }
      
      // Validate geographies
      if (parsed.geography_focus) {
        parsed.geography_focus = parsed.geography_focus.filter((g: string) =>
          STANDARD_GEOGRAPHIES.some(std => std.toLowerCase() === g.toLowerCase())
        );
        
        // Add country_base if not included
        if (buyer.country_base && !parsed.geography_focus.some((g: string) => 
          g.toLowerCase() === buyer.country_base.toLowerCase()
        )) {
          parsed.geography_focus.unshift(buyer.country_base);
        }
      }

      return parsed;
    }

    return null;
  } catch (error) {
    console.error("Error calling AI:", error);
    return null;
  }
}
