import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PE_SECTORS = [
  'business_services', 'industrial_services', 'manufacturing', 'construction_engineering',
  'energy_utilities', 'technology_software', 'healthcare', 'consumer_services',
  'consumer_products', 'distribution_logistics', 'transportation', 'education_training',
  'financial_services', 'real_estate_services', 'environmental_services', 'media_marketing',
  'agriculture_food', 'hospitality_leisure', 'other'
];

const SYSTEM_PROMPT = `Eres un analista especializado en clasificación sectorial para Search Funds y Private Equity.
Clasifica empresas en UNO de estos sectores: ${PE_SECTORS.join(', ')}

REGLAS:
1. Software aplicado a CUALQUIER sector → technology_software
2. Servicios técnicos recurrentes B2B → business_services o industrial_services
3. NUNCA inventar sectores fuera de la lista

Responde en JSON: {"sector_pe": "...", "confidence": 0.85, "keywords": [...], "reasoning": "..."}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, description, existing_sector, additional_info } = await req.json();

    if (!company_name) {
      return new Response(JSON.stringify({ error: 'company_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let userMessage = `Clasifica esta empresa:\nNombre: ${company_name}`;
    if (description) userMessage += `\nDescripción: ${description}`;
    if (existing_sector) userMessage += `\nSector actual (referencia): ${existing_sector}`;
    if (additional_info) userMessage += `\nInformación adicional: ${additional_info}`;

    const response = await callAI(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      { functionName: 'classify-sector-pe', preferOpenAI: true, temperature: 0.3, maxTokens: 300, jsonMode: true }
    );

    const classification = parseAIJson<any>(response.content);

    if (!PE_SECTORS.includes(classification.sector_pe)) {
      classification.sector_pe = 'other';
      classification.confidence = 0.5;
    }

    return new Response(JSON.stringify({
      success: true, company_name,
      sector_pe: classification.sector_pe,
      confidence: classification.confidence || 0.7,
      keywords: classification.keywords || [],
      reasoning: classification.reasoning || '',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error in classify-sector-pe:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
