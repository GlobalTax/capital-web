import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { buyer_ids, fields_to_generate = ['sector_focus', 'geography_focus', 'search_keywords'], overwrite_existing = false } = await req.json();
    if (!buyer_ids?.length) return new Response(JSON.stringify({ error: "buyer_ids required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: buyers } = await supabase.from("corporate_buyers").select("*").in("id", buyer_ids);
    if (!buyers?.length) return new Response(JSON.stringify({ error: "No buyers found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const results = [];
    let configured = 0, skipped = 0, errors = 0;

    for (const buyer of buyers) {
      try {
        if (!buyer.description || buyer.description.length < 50) {
          results.push({ buyer_id: buyer.id, buyer_name: buyer.name, status: 'skipped', error_message: 'Sin descripción' });
          skipped++; continue;
        }

        const hasSectors = buyer.sector_focus?.length > 0;
        const hasGeo = buyer.geography_focus?.length > 0;
        const hasKeywords = buyer.search_keywords?.length > 0;
        if (!overwrite_existing && hasSectors && hasGeo && hasKeywords) {
          results.push({ buyer_id: buyer.id, buyer_name: buyer.name, status: 'skipped', error_message: 'Ya tiene criterios' });
          skipped++; continue;
        }

        const response = await callAI(
          [
            { role: "system", content: "Analista M&A. Responde JSON." },
            { role: "user", content: `Comprador: ${buyer.name}\nDescripción: ${buyer.description}\nSectores permitidos: ${STANDARD_SECTORS.join(', ')}\nGeografías: ${STANDARD_GEOGRAPHIES.join(', ')}\n\nExtrae criterios. JSON: {"sector_focus":[], "geography_focus":[], "search_keywords":[], "buyer_type":"corporate|family_office|pe_fund|strategic_buyer|holding"}` }
          ],
          { functionName: 'corporate-buyer-auto-config', temperature: 0.3, jsonMode: true }
        );

        const generated = parseAIJson<any>(response.content);
        if (generated) {
          if (generated.sector_focus) generated.sector_focus = generated.sector_focus.filter((s: string) => STANDARD_SECTORS.some(std => std.toLowerCase() === s.toLowerCase()));
          if (generated.geography_focus) {
            generated.geography_focus = generated.geography_focus.filter((g: string) => STANDARD_GEOGRAPHIES.some(std => std.toLowerCase() === g.toLowerCase()));
            if (buyer.country_base && !generated.geography_focus.some((g: string) => g.toLowerCase() === buyer.country_base.toLowerCase())) generated.geography_focus.unshift(buyer.country_base);
          }

          const updateData: any = {};
          if (fields_to_generate.includes('sector_focus') && generated.sector_focus?.length && (overwrite_existing || !hasSectors)) updateData.sector_focus = generated.sector_focus;
          if (fields_to_generate.includes('geography_focus') && generated.geography_focus?.length && (overwrite_existing || !hasGeo)) updateData.geography_focus = generated.geography_focus;
          if (fields_to_generate.includes('search_keywords') && generated.search_keywords?.length && (overwrite_existing || !hasKeywords)) updateData.search_keywords = generated.search_keywords;
          if (generated.buyer_type && !buyer.buyer_type) updateData.buyer_type = generated.buyer_type;

          if (Object.keys(updateData).length > 0) {
            await supabase.from("corporate_buyers").update(updateData).eq("id", buyer.id);
          }

          results.push({ buyer_id: buyer.id, buyer_name: buyer.name, status: 'configured', generated_fields: generated });
          configured++;
        } else {
          results.push({ buyer_id: buyer.id, buyer_name: buyer.name, status: 'error', error_message: 'AI falló' });
          errors++;
        }
        if (buyers.indexOf(buyer) < buyers.length - 1) await new Promise(r => setTimeout(r, 1500));
      } catch (e: any) {
        results.push({ buyer_id: buyer.id, buyer_name: buyer.name, status: 'error', error_message: e.message });
        errors++;
      }
    }

    return new Response(JSON.stringify({ success: true, total_processed: buyers.length, configured, skipped, errors, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Error:", error);
    return aiErrorResponse(error, corsHeaders);
  }
});
