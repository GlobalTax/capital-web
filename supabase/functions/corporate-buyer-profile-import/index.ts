// =============================================
// CORPORATE BUYER PROFILE IMPORT EDGE FUNCTION
// Extracts company data from LinkedIn or Apollo URLs
// =============================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// Standard sectors for mapping
const STANDARD_SECTORS = [
  'Agricultura',
  'Alimentación y Bebidas',
  'Asesorías Profesionales',
  'Automoción',
  'Construcción',
  'Educación',
  'Energía y Renovables',
  'Farmacéutico',
  'Industrial y Manufacturero',
  'Inmobiliario',
  'Logística y Transporte',
  'Medios y Entretenimiento',
  'Químico',
  'Retail y Consumo',
  'Salud y Biotecnología',
  'Seguridad',
  'Servicios Financieros',
  'Tecnología',
  'Telecomunicaciones',
  'Textil y Moda',
  'Turismo y Hostelería',
  'Otros'
];

// Sector mapping keywords
const SECTOR_KEYWORDS: Record<string, string[]> = {
  'Tecnología': ['software', 'tech', 'saas', 'ai', 'cloud', 'digital', 'it services', 'cybersecurity', 'data'],
  'Servicios Financieros': ['finance', 'banking', 'insurance', 'fintech', 'investment', 'asset management', 'wealth'],
  'Salud y Biotecnología': ['health', 'medical', 'pharma', 'biotech', 'hospital', 'clinic', 'healthcare'],
  'Industrial y Manufacturero': ['manufacturing', 'industrial', 'production', 'factory', 'machinery'],
  'Retail y Consumo': ['retail', 'consumer', 'ecommerce', 'fmcg', 'consumer goods'],
  'Logística y Transporte': ['logistics', 'transport', 'shipping', 'freight', 'supply chain', 'warehousing'],
  'Construcción': ['construction', 'building', 'real estate development', 'infrastructure'],
  'Energía y Renovables': ['energy', 'renewable', 'solar', 'wind', 'utilities', 'power'],
  'Alimentación y Bebidas': ['food', 'beverage', 'f&b', 'restaurant', 'catering'],
  'Educación': ['education', 'training', 'e-learning', 'edtech', 'university', 'school'],
  'Turismo y Hostelería': ['hospitality', 'hotel', 'tourism', 'travel', 'leisure'],
  'Asesorías Profesionales': ['consulting', 'advisory', 'professional services', 'legal', 'accounting'],
  'Medios y Entretenimiento': ['media', 'entertainment', 'marketing', 'advertising', 'content'],
  'Inmobiliario': ['real estate', 'property', 'reit', 'commercial property'],
  'Automoción': ['automotive', 'auto', 'car', 'vehicle', 'mobility'],
  'Farmacéutico': ['pharmaceutical', 'drug', 'medicine'],
  'Telecomunicaciones': ['telecom', 'telecommunications', 'mobile', 'wireless'],
  'Seguridad': ['security', 'safety', 'surveillance'],
  'Químico': ['chemical', 'chemicals', 'specialty chemicals'],
  'Textil y Moda': ['fashion', 'textile', 'apparel', 'clothing'],
  'Agricultura': ['agriculture', 'farming', 'agribusiness', 'agri'],
};

// Infer sectors from description
function inferSectors(description: string, industry?: string): string[] {
  const text = `${description} ${industry || ''}`.toLowerCase();
  const matchedSectors: string[] = [];

  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        if (!matchedSectors.includes(sector)) {
          matchedSectors.push(sector);
        }
        break;
      }
    }
  }

  // Limit to top 3 most relevant sectors
  return matchedSectors.slice(0, 3);
}

// Infer buyer type from description and name
function inferBuyerType(name: string, description: string): string | null {
  const text = `${name} ${description}`.toLowerCase();
  
  if (text.includes('family office') || text.includes('patrimonio familiar')) {
    return 'family_office';
  }
  if (text.includes('private equity') || text.includes('pe fund') || text.includes('growth equity') || text.includes('buyout')) {
    return 'pe_fund';
  }
  if (text.includes('holding') || text.includes('grupo empresarial') || text.includes('conglomerate')) {
    return 'holding';
  }
  if (text.includes('strategic') || text.includes('estratégico') || text.includes('competitor')) {
    return 'strategic_buyer';
  }
  // Default to corporate
  return 'corporate';
}

// Extract company slug from LinkedIn URL
function extractLinkedInCompanySlug(url: string): string | null {
  const match = url.match(/linkedin\.com\/company\/([^\/\?]+)/i);
  return match ? match[1] : null;
}

// Enrich company from Apollo API
async function enrichFromApollo(domain: string): Promise<any> {
  const apolloApiKey = Deno.env.get('APOLLO_API_KEY');
  if (!apolloApiKey) {
    console.log('APOLLO_API_KEY not configured, skipping Apollo enrichment');
    return null;
  }

  try {
    const response = await fetch('https://api.apollo.io/v1/organizations/enrich', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      body: JSON.stringify({
        api_key: apolloApiKey,
        domain: domain,
      }),
    });

    if (!response.ok) {
      console.log('Apollo enrichment failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.organization || null;
  } catch (error) {
    console.error('Apollo enrichment error:', error);
    return null;
  }
}

// Scrape LinkedIn using Firecrawl
async function scrapeLinkedIn(url: string): Promise<any> {
  const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
  if (!firecrawlApiKey) {
    console.log('FIRECRAWL_API_KEY not configured, skipping LinkedIn scrape');
    return null;
  }

  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
        formats: ['markdown'],
        onlyMainContent: true,
      }),
    });

    if (!response.ok) {
      console.log('Firecrawl scrape failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Firecrawl scrape error:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, urlType } = await req.json();

    if (!url || !urlType) {
      return new Response(
        JSON.stringify({ success: false, error: 'URL y tipo son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${urlType} URL:`, url);

    let profile: any = {};

    if (urlType === 'apollo') {
      // Extract domain from Apollo URL or use URL directly
      const domainMatch = url.match(/domain[=\/]([^&\/]+)/i);
      const domain = domainMatch ? domainMatch[1] : null;

      if (domain) {
        const apolloData = await enrichFromApollo(domain);
        if (apolloData) {
          profile = {
            name: apolloData.name || '',
            website: apolloData.website_url || `https://${domain}`,
            description: apolloData.short_description || apolloData.seo_description || '',
            country_base: apolloData.country || null,
            cities: apolloData.city ? [apolloData.city] : null,
            sector_focus: inferSectors(
              apolloData.short_description || '',
              apolloData.industry
            ),
            buyer_type: inferBuyerType(
              apolloData.name || '',
              apolloData.short_description || ''
            ),
            source_url: url,
          };
        }
      }

      // If no domain found, try scraping the Apollo page
      if (!profile.name && !domain) {
        // Extract company name from Apollo URL path
        const nameMatch = url.match(/organizations\/([^\/\?]+)/i) || url.match(/companies\/([^\/\?]+)/i);
        if (nameMatch) {
          const companySlug = nameMatch[1].replace(/-/g, ' ');
          profile.name = companySlug.split(' ').map((w: string) => 
            w.charAt(0).toUpperCase() + w.slice(1)
          ).join(' ');
          profile.source_url = url;
        }
      }
    } else if (urlType === 'linkedin') {
      // Extract company slug from LinkedIn URL
      const companySlug = extractLinkedInCompanySlug(url);

      if (companySlug) {
        // Try scraping LinkedIn page first
        const scrapeResult = await scrapeLinkedIn(url);
        
        if (scrapeResult?.data?.markdown) {
          // Parse basic info from markdown
          const markdown = scrapeResult.data.markdown;
          const metadata = scrapeResult.data.metadata || {};
          
          // Extract name from title or slug
          let name = metadata.title?.split(' | ')[0] || 
                     companySlug.replace(/-/g, ' ').split(' ')
                       .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
                       .join(' ');
          
          // Clean up name
          name = name.replace(/LinkedIn$/, '').trim();
          
          // Try to extract description from markdown
          const descMatch = markdown.match(/(?:Descripción|About|Acerca de)[:\n]*([\s\S]*?)(?:\n\n|Sector|Industria|Website)/i);
          const description = descMatch ? descMatch[1].trim().slice(0, 500) : '';

          profile = {
            name,
            website: metadata.sourceURL || null,
            description,
            sector_focus: inferSectors(description, ''),
            buyer_type: inferBuyerType(name, description),
            source_url: url,
          };

          // Try Apollo enrichment with company name for more data
          if (profile.name) {
            // Create a domain guess from company name
            const domainGuess = `${companySlug.replace(/-/g, '')}.com`;
            const apolloData = await enrichFromApollo(domainGuess);
            
            if (apolloData) {
              // Merge Apollo data with scraped data
              profile.website = profile.website || apolloData.website_url;
              profile.description = profile.description || apolloData.short_description;
              profile.country_base = apolloData.country || null;
              profile.cities = apolloData.city ? [apolloData.city] : null;
              
              // Update sectors if we got better data
              if (apolloData.industry) {
                profile.sector_focus = inferSectors(
                  profile.description || '',
                  apolloData.industry
                );
              }
            }
          }
        } else {
          // Fallback: just use the slug
          const name = companySlug.replace(/-/g, ' ').split(' ')
            .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          
          profile = {
            name,
            source_url: url,
            buyer_type: 'corporate',
          };
        }
      }
    }

    // Check if we got any useful data
    if (!profile.name) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'No se pudo extraer información del perfil. Verifica la URL.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Extracted profile:', profile);

    return new Response(
      JSON.stringify({ success: true, profile }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Profile import error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Error interno del servidor.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
