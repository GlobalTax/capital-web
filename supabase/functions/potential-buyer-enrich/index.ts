import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

interface EnrichmentResult {
  success: boolean;
  data?: {
    name: string;
    logo_url: string | null;
    website: string | null;
    description: string | null;
    sector_focus: string[];
    revenue_range: string | null;
    source: string;
  };
  error?: string;
}

// Detect input type
function detectInputType(query: string): { type: 'url' | 'domain' | 'name'; value: string } {
  const trimmed = query.trim();
  
  // Check if it's a full URL
  if (trimmed.match(/^https?:\/\//i)) {
    const url = new URL(trimmed);
    return { type: 'url', value: url.hostname.replace(/^www\./, '') };
  }
  
  // Check if it's a domain
  if (trimmed.match(/^(?:www\.)?[a-z0-9\-]+\.[a-z]{2,}$/i)) {
    return { type: 'domain', value: trimmed.replace(/^www\./, '') };
  }
  
  // Otherwise treat as company name
  return { type: 'name', value: trimmed };
}

// Try to get logo using Clearbit
async function getLogoUrl(domain: string): Promise<string | null> {
  try {
    const testUrl = `https://logo.clearbit.com/${domain}`;
    const response = await fetch(testUrl, { method: 'HEAD' });
    if (response.ok) {
      return testUrl;
    }
  } catch (e) {
    console.log('[potential-buyer-enrich] Logo not found for:', domain);
  }
  return null;
}

// Try to find domain from company name
async function findDomainFromName(companyName: string): Promise<string | null> {
  const cleanName = companyName
    .toLowerCase()
    .replace(/[.,\-_]/g, '')
    .replace(/\s+(sl|sa|slu|sau|sll|scoop|sociedad\s+limitada|sociedad\s+anonima)$/i, '')
    .trim()
    .replace(/\s+/g, '');
  
  const possibleDomains = [
    `${cleanName}.es`,
    `${cleanName}.com`,
    `${cleanName}.eu`,
    `${cleanName}.net`,
  ];
  
  for (const domain of possibleDomains) {
    const logoUrl = await getLogoUrl(domain);
    if (logoUrl) {
      return domain;
    }
  }
  
  return null;
}

// Scrape website using Firecrawl
async function scrapeWebsite(url: string, firecrawlKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 2000,
      }),
    });
    
    const data = await response.json();
    if (data.success && data.data?.markdown) {
      // Limit content to avoid token issues
      return data.data.markdown.substring(0, 8000);
    }
  } catch (e) {
    console.error('[potential-buyer-enrich] Firecrawl error:', e);
  }
  return null;
}

// Use AI to analyze content and generate description
async function analyzeWithAI(
  companyName: string,
  websiteContent: string | null,
  lovableKey: string
): Promise<{ description: string; sector_focus: string[]; revenue_range: string | null }> {
  const systemPrompt = `Eres un analista de M&A especializado en el mercado español. Analiza la información proporcionada sobre una empresa y genera:
1. Una descripción profesional y concisa (2-3 frases máximo) destacando su actividad principal, productos/servicios y mercados.
2. Los sectores de actividad de la empresa (máximo 3 sectores, usar terminología estándar M&A).
3. Si es posible inferir el rango de facturación basado en el contenido (empleados, oficinas, etc.), indícalo.

Responde SOLO con un JSON válido con este formato:
{
  "description": "Descripción profesional de la empresa...",
  "sector_focus": ["Sector 1", "Sector 2"],
  "revenue_range": "1M-5M" // o null si no se puede inferir. Opciones: 0-1M, 1M-5M, 5M-10M, 10M-50M, 50M+
}`;

  const userContent = websiteContent 
    ? `Empresa: ${companyName}\n\nContenido del sitio web:\n${websiteContent}`
    : `Empresa: ${companyName}\n\nNo hay contenido web disponible. Genera una descripción genérica basada en el nombre.`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userContent },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.error('[potential-buyer-enrich] AI error:', response.status);
      return { description: '', sector_focus: [], revenue_range: null };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        description: parsed.description || '',
        sector_focus: Array.isArray(parsed.sector_focus) ? parsed.sector_focus : [],
        revenue_range: parsed.revenue_range || null,
      };
    }
  } catch (e) {
    console.error('[potential-buyer-enrich] AI parsing error:', e);
  }
  
  return { description: '', sector_focus: [], revenue_range: null };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'Se requiere un nombre de empresa, dominio o URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    const lovableKey = Deno.env.get('LOVABLE_API_KEY');

    if (!lovableKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY no configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('[potential-buyer-enrich] Processing query:', query);

    // Step 1: Detect input type
    const { type, value } = detectInputType(query);
    console.log('[potential-buyer-enrich] Input type:', type, 'value:', value);

    let domain: string | null = null;
    let companyName = query.trim();
    let logoUrl: string | null = null;
    let websiteUrl: string | null = null;

    // Step 2: Determine domain and get logo
    if (type === 'url' || type === 'domain') {
      domain = value;
      logoUrl = await getLogoUrl(domain);
      websiteUrl = `https://www.${domain}`;
      // Use domain as fallback name, capitalize first letter
      companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } else {
      // Try to find domain from company name
      domain = await findDomainFromName(value);
      if (domain) {
        logoUrl = await getLogoUrl(domain);
        websiteUrl = `https://www.${domain}`;
      }
    }

    console.log('[potential-buyer-enrich] Domain:', domain, 'Logo:', logoUrl);

    // Step 3: Scrape website if we have domain and Firecrawl key
    let websiteContent: string | null = null;
    if (websiteUrl && firecrawlKey) {
      console.log('[potential-buyer-enrich] Scraping website:', websiteUrl);
      websiteContent = await scrapeWebsite(websiteUrl, firecrawlKey);
      
      // Try to extract company name from content if we only had domain
      if (websiteContent && (type === 'url' || type === 'domain')) {
        const titleMatch = websiteContent.match(/^#\s*(.+?)(?:\n|$)/);
        if (titleMatch && titleMatch[1].length > 3 && titleMatch[1].length < 100) {
          companyName = titleMatch[1].trim();
        }
      }
    }

    // Step 4: Use AI to analyze and generate description
    console.log('[potential-buyer-enrich] Analyzing with AI...');
    const aiResult = await analyzeWithAI(companyName, websiteContent, lovableKey);

    // Build source string
    const sources: string[] = [];
    if (logoUrl) sources.push('clearbit');
    if (websiteContent) sources.push('firecrawl');
    sources.push('ai');

    const result: EnrichmentResult = {
      success: true,
      data: {
        name: companyName,
        logo_url: logoUrl,
        website: websiteUrl,
        description: aiResult.description,
        sector_focus: aiResult.sector_focus,
        revenue_range: aiResult.revenue_range,
        source: sources.join('+'),
      },
    };

    console.log('[potential-buyer-enrich] Result:', result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[potential-buyer-enrich] Error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
