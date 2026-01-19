import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PE_SECTORS = [
  'business_services',
  'industrial_services', 
  'manufacturing',
  'construction_engineering',
  'energy_utilities',
  'technology_software',
  'healthcare',
  'consumer_services',
  'consumer_products',
  'distribution_logistics',
  'transportation',
  'education_training',
  'financial_services',
  'real_estate_services',
  'environmental_services',
  'media_marketing',
  'agriculture_food',
  'hospitality_leisure',
  'other'
];

const SYSTEM_PROMPT = `Eres un analista especializado en clasificación sectorial para Search Funds y Private Equity.

Tu objetivo es clasificar empresas en UNO de los siguientes sectores estándar:

SECTORES PERMITIDOS (usar SOLO estos IDs exactos):
- business_services: Servicios empresariales, consultoría, outsourcing, BPO, staffing, facility management
- industrial_services: Servicios industriales, mantenimiento, reparación, servicios técnicos de campo
- manufacturing: Manufactura, producción, fabricación, ensamblaje
- construction_engineering: Construcción, ingeniería civil, infraestructuras, arquitectura
- energy_utilities: Energía, utilities, renovables, solar, eólica, petróleo, gas
- technology_software: Software, SaaS, IT, tecnología, plataformas digitales, analytics, cloud, IA
- healthcare: Salud, médico, farmacéutico, biotecnología, hospitales, clínicas
- consumer_services: Servicios al consumidor, servicios personales, servicios del hogar, B2C
- consumer_products: Productos de consumo, retail, FMCG, moda, belleza
- distribution_logistics: Distribución, logística, almacenamiento, cadena de suministro, mayorista
- transportation: Transporte, envío, flete, flotas, camiones, entregas
- education_training: Educación, formación, e-learning, academias, colegios
- financial_services: Finanzas, banca, seguros, fintech, pagos, préstamos
- real_estate_services: Servicios inmobiliarios, gestión de propiedades, corretaje
- environmental_services: Servicios medioambientales, residuos, reciclaje, sostenibilidad
- media_marketing: Medios, marketing, publicidad, agencias, relaciones públicas
- agriculture_food: Agricultura, alimentación, ganadería, agroindustria, bebidas
- hospitality_leisure: Hostelería, hoteles, restaurantes, ocio, entretenimiento, turismo
- other: Solo si no encaja en ningún otro sector

REGLAS CRÍTICAS:
1. Software aplicado a CUALQUIER sector → technology_software
2. Servicios técnicos recurrentes B2B → business_services o industrial_services
3. Si hay duda → elige el sector más transversal
4. NUNCA dejar el sector vacío
5. NUNCA asignar múltiples sectores
6. NUNCA inventar sectores fuera de la lista

Responde SIEMPRE en formato JSON válido:
{
  "sector_pe": "technology_software",
  "confidence": 0.85,
  "keywords": ["SaaS", "analytics", "software"],
  "reasoning": "Breve explicación de 1 frase"
}`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { company_name, description, existing_sector, additional_info } = await req.json();

    if (!company_name) {
      return new Response(
        JSON.stringify({ error: 'company_name is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Build context for classification
    let userMessage = `Clasifica esta empresa:

Nombre: ${company_name}`;

    if (description) {
      userMessage += `\nDescripción: ${description}`;
    }
    
    if (existing_sector) {
      userMessage += `\nSector actual (referencia): ${existing_sector}`;
    }
    
    if (additional_info) {
      userMessage += `\nInformación adicional: ${additional_info}`;
    }

    userMessage += `\n\nResponde solo con el JSON de clasificación.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3,
        max_tokens: 300,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    let classification;
    try {
      classification = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Invalid JSON response from OpenAI');
    }

    // Validate sector is in allowed list
    if (!PE_SECTORS.includes(classification.sector_pe)) {
      console.warn(`Invalid sector "${classification.sector_pe}", defaulting to "other"`);
      classification.sector_pe = 'other';
      classification.confidence = 0.5;
    }

    return new Response(
      JSON.stringify({
        success: true,
        company_name,
        sector_pe: classification.sector_pe,
        confidence: classification.confidence || 0.7,
        keywords: classification.keywords || [],
        reasoning: classification.reasoning || '',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in classify-sector-pe:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
