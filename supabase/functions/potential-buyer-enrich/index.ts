import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { callAI, parseAIJson, aiErrorResponse } from "../_shared/ai-helper.ts";

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
    revenue: number | null;
    ebitda: number | null;
    employees: number | null;
    source: string;
  };
  error?: string;
}

function detectInputType(query: string): { type: 'url' | 'domain' | 'name'; value: string } {
  const trimmed = query.trim();
  if (trimmed.match(/^https?:\/\//i)) {
    const url = new URL(trimmed);
    return { type: 'url', value: url.hostname.replace(/^www\./, '') };
  }
  if (trimmed.match(/^(?:www\.)?[a-z0-9\-]+\.[a-z]{2,}$/i)) {
    return { type: 'domain', value: trimmed.replace(/^www\./, '') };
  }
  return { type: 'name', value: trimmed };
}

async function getLogoUrl(domain: string): Promise<string | null> {
  try {
    const testUrl = `https://logo.clearbit.com/${domain}`;
    const response = await fetch(testUrl, { method: 'HEAD' });
    if (response.ok) return testUrl;
  } catch (e) { /* ignore */ }
  return null;
}

async function findDomainFromName(companyName: string): Promise<string | null> {
  const cleanName = companyName.toLowerCase().replace(/[.,\-_]/g, '').replace(/\s+(sl|sa|slu|sau|sll|scoop|sociedad\s+limitada|sociedad\s+anonima)$/i, '').trim().replace(/\s+/g, '');
  for (const ext of ['.es', '.com', '.eu', '.net']) {
    const logoUrl = await getLogoUrl(`${cleanName}${ext}`);
    if (logoUrl) return `${cleanName}${ext}`;
  }
  return null;
}

async function scrapeWebsite(url: string, firecrawlKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${firecrawlKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, waitFor: 2000 }),
    });
    const data = await response.json();
    if (data.success && data.data?.markdown) return data.data.markdown.substring(0, 8000);
  } catch (e) { console.error('[potential-buyer-enrich] Firecrawl error:', e); }
  return null;
}

async function analyzeWithAI(companyName: string, websiteContent: string | null): Promise<{ description: string; sector_focus: string[]; revenue_range: string | null; revenue: number | null; ebitda: number | null; employees: number | null }> {
  const systemPrompt = `Eres un analista de M&A especializado en el mercado español. Analiza la información y genera:
1. Descripción profesional (2-3 frases)
2. Sectores de actividad (máximo 3)
3. Rango de facturación si es inferible
4. Cifras numéricas si hay

Responde SOLO con JSON válido:
{
  "description": "...",
  "sector_focus": ["Sector 1", "Sector 2"],
  "revenue_range": "1M-5M" o null,
  "revenue": 1500000 o null,
  "ebitda": 250000 o null,
  "employees": 45 o null
}`;

  const userContent = websiteContent 
    ? `Empresa: ${companyName}\n\nContenido del sitio web:\n${websiteContent}`
    : `Empresa: ${companyName}\n\nNo hay contenido web disponible. Genera una descripción genérica basada en el nombre.`;

  try {
    const response = await callAI(
      [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
      { functionName: 'potential-buyer-enrich', temperature: 0.3 }
    );
    const parsed = parseAIJson<any>(response.content);
    return {
      description: parsed.description || '',
      sector_focus: Array.isArray(parsed.sector_focus) ? parsed.sector_focus : [],
      revenue_range: parsed.revenue_range || null,
      revenue: typeof parsed.revenue === 'number' ? parsed.revenue : null,
      ebitda: typeof parsed.ebitda === 'number' ? parsed.ebitda : null,
      employees: typeof parsed.employees === 'number' ? parsed.employees : null,
    };
  } catch (e) { console.error('[potential-buyer-enrich] AI error:', e); }
  return { description: '', sector_focus: [], revenue_range: null, revenue: null, ebitda: null, employees: null };
}

async function analyzeImageWithVision(imageBase64: string): Promise<{ name: string | null; website: string | null; description: string | null; sector_focus: string[]; revenue_range: string | null; revenue: number | null; ebitda: number | null; employees: number | null }> {
  const systemPrompt = `Eres un analista de M&A experto. Analiza esta imagen y EXTRAE:
1. Nombre de la empresa (OBLIGATORIO)
2. Dominio web si visible
3. Sector de actividad (máx 3)
4. Descripción breve si inferible
5. Rango de facturación si hay datos financieros
6. Cifras numéricas exactas de facturación, EBITDA y empleados si visibles

Responde SOLO con JSON:
{ "name": "...", "website": null, "description": null, "sector_focus": [], "revenue_range": null, "revenue": null, "ebitda": null, "employees": null }`;

  let imageUrl = imageBase64;
  if (!imageBase64.startsWith('data:')) {
    imageUrl = `data:image/jpeg;base64,${imageBase64}`;
  }

  try {
    const response = await callAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: [
          { type: 'text', text: 'Analiza esta imagen y extrae la información de la empresa:' },
          { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
        ] },
      ],
      { functionName: 'potential-buyer-enrich-vision', preferOpenAI: true, maxTokens: 1000, temperature: 0.2 }
    );

    const parsed = parseAIJson<any>(response.content);
    return {
      name: parsed.name || null,
      website: parsed.website || null,
      description: parsed.description || null,
      sector_focus: Array.isArray(parsed.sector_focus) ? parsed.sector_focus : [],
      revenue_range: parsed.revenue_range || null,
      revenue: typeof parsed.revenue === 'number' ? parsed.revenue : null,
      ebitda: typeof parsed.ebitda === 'number' ? parsed.ebitda : null,
      employees: typeof parsed.employees === 'number' ? parsed.employees : null,
    };
  } catch (e) { console.error('[potential-buyer-enrich] Vision error:', e); }
  return { name: null, website: null, description: null, sector_focus: [], revenue_range: null, revenue: null, ebitda: null, employees: null };
}

function extractDomain(website: string | null): string | null {
  if (!website) return null;
  try {
    let url = website;
    if (!url.match(/^https?:\/\//)) url = 'https://' + url;
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    const match = website.match(/(?:www\.)?([a-z0-9\-]+\.[a-z]{2,})/i);
    return match ? match[1] : null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let body;
    try { body = await req.json(); } catch {
      return new Response(JSON.stringify({ success: false, error: 'Cuerpo de solicitud inválido' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { mode = 'text', query, imageBase64 } = body;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    // ============ IMAGE MODE ============
    if (mode === 'image') {
      if (!imageBase64) {
        return new Response(JSON.stringify({ success: false, error: 'Se requiere una imagen en base64' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      const visionResult = await analyzeImageWithVision(imageBase64);
      
      if (!visionResult.name) {
        return new Response(JSON.stringify({ success: false, error: 'No se pudo detectar una empresa en la imagen' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      let logoUrl: string | null = null;
      let domain = extractDomain(visionResult.website);
      
      if (domain) { logoUrl = await getLogoUrl(domain); }
      else { domain = await findDomainFromName(visionResult.name); if (domain) logoUrl = await getLogoUrl(domain); }

      let description = visionResult.description;
      let sectorFocus = visionResult.sector_focus;
      let revenueRange = visionResult.revenue_range;
      let revenue = visionResult.revenue;
      let ebitda = visionResult.ebitda;
      let employees = visionResult.employees;

      if (!description && domain && firecrawlKey) {
        const websiteContent = await scrapeWebsite(`https://www.${domain}`, firecrawlKey);
        if (websiteContent) {
          const aiResult = await analyzeWithAI(visionResult.name, websiteContent);
          description = aiResult.description || description;
          sectorFocus = aiResult.sector_focus.length > 0 ? aiResult.sector_focus : sectorFocus;
          revenueRange = aiResult.revenue_range || revenueRange;
          revenue = aiResult.revenue ?? revenue;
          ebitda = aiResult.ebitda ?? ebitda;
          employees = aiResult.employees ?? employees;
        }
      }

      const sources: string[] = ['vision'];
      if (logoUrl) sources.push('clearbit');
      if (description && description !== visionResult.description) sources.push('firecrawl+ai');

      return new Response(JSON.stringify({
        success: true,
        data: { name: visionResult.name, logo_url: logoUrl, website: visionResult.website || (domain ? `https://www.${domain}` : null), description, sector_focus: sectorFocus, revenue_range: revenueRange, revenue, ebitda, employees, source: sources.join('+') },
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ============ TEXT MODE ============
    if (!query || typeof query !== 'string' || query.trim().length < 2) {
      return new Response(JSON.stringify({ success: false, error: 'Se requiere un nombre de empresa, dominio o URL' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { type, value } = detectInputType(query);
    let domain: string | null = null;
    let companyName = query.trim();
    let logoUrl: string | null = null;
    let websiteUrl: string | null = null;

    if (type === 'url' || type === 'domain') {
      domain = value;
      logoUrl = await getLogoUrl(domain);
      websiteUrl = `https://www.${domain}`;
      companyName = domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1);
    } else {
      domain = await findDomainFromName(value);
      if (domain) { logoUrl = await getLogoUrl(domain); websiteUrl = `https://www.${domain}`; }
    }

    let websiteContent: string | null = null;
    if (websiteUrl && firecrawlKey) {
      websiteContent = await scrapeWebsite(websiteUrl, firecrawlKey);
      if (websiteContent && (type === 'url' || type === 'domain')) {
        const titleMatch = websiteContent.match(/^#\s*(.+?)(?:\n|$)/);
        if (titleMatch && titleMatch[1].length > 3 && titleMatch[1].length < 100) {
          companyName = titleMatch[1].trim();
        }
      }
    }

    const aiResult = await analyzeWithAI(companyName, websiteContent);

    const sources: string[] = [];
    if (logoUrl) sources.push('clearbit');
    if (websiteContent) sources.push('firecrawl');
    sources.push('ai');

    return new Response(JSON.stringify({
      success: true,
      data: { name: companyName, logo_url: logoUrl, website: websiteUrl, description: aiResult.description, sector_focus: aiResult.sector_focus, revenue_range: aiResult.revenue_range, revenue: aiResult.revenue, ebitda: aiResult.ebitda, employees: aiResult.employees, source: sources.join('+') },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[potential-buyer-enrich] Error:', error);
    return aiErrorResponse(error, corsHeaders);
  }
});
