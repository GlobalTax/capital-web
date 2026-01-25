// =============================================
// CORPORATE BUYERS IMPORT EDGE FUNCTION
// Imports corporate buyers with their contacts
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface BuyerContact {
  name: string;
  title: string | null;
  email: string | null;
  linkedin_url: string | null;
  phone: string | null;
}

interface BuyerImport {
  name: string;
  country_base: string;
  sectors: string[];
  description: string;
  investment_thesis: string | null;
  keywords: string[];
  website: string | null;
  geography_focus: string[];
  revenue_range: string | null;
  ebitda_range: string | null;
  contact: BuyerContact | null;
}

// Parse range like "€ 10 millon(es) - € 200 millon(es)" to { min, max }
function parseRange(rangeStr: string | null): { min: number | null; max: number | null } {
  if (!rangeStr || rangeStr === '_' || rangeStr === '-') {
    return { min: null, max: null };
  }

  // Clean the string and extract numbers
  const cleaned = rangeStr
    .replace(/€/g, '')
    .replace(/millon\(es\)/gi, '')
    .replace(/millones/gi, '')
    .replace(/millon/gi, '')
    .replace(/M/gi, '')
    .trim();

  const parts = cleaned.split('-').map(p => p.trim());
  
  if (parts.length === 2) {
    const min = parseFloat(parts[0].replace(/[^\d.]/g, '')) || null;
    const max = parseFloat(parts[1].replace(/[^\d.]/g, '')) || null;
    
    // Convert to full numbers (millions)
    return {
      min: min ? min * 1000000 : null,
      max: max ? max * 1000000 : null,
    };
  }

  return { min: null, max: null };
}

// Infer buyer type from description
function inferBuyerType(description: string, name: string): string {
  const text = `${description} ${name}`.toLowerCase();
  
  if (text.includes('family office') || text.includes('familiar')) {
    return 'family_office';
  }
  if (text.includes('private equity') || text.includes('pe fund') || text.includes('fondo')) {
    return 'pe_fund';
  }
  if (text.includes('holding') || text.includes('grupo') || text.includes('group')) {
    return 'holding';
  }
  if (text.includes('estratégico') || text.includes('strategic')) {
    return 'strategic_buyer';
  }
  
  return 'corporate';
}

// Infer contact role from title
function inferContactRole(title: string | null): string {
  if (!title) return 'other';
  
  const t = title.toLowerCase();
  
  if (t.includes('m&a') || t.includes('desarrollo') || t.includes('development') || t.includes('overnames') || t.includes('corporate dev')) {
    return 'm_and_a';
  }
  if (t.includes('ceo') || t.includes('cfo') || t.includes('cso') || t.includes('cco') || t.includes('cdo') || t.includes('president') || t.includes('managing director') || t.includes('md')) {
    return 'cxo';
  }
  if (t.includes('owner') || t.includes('dueño') || t.includes('propietario')) {
    return 'owner';
  }
  if (t.includes('director')) {
    return 'director';
  }
  if (t.includes('partner') || t.includes('socio')) {
    return 'partner';
  }
  if (t.includes('business dev') || t.includes('bd ')) {
    return 'business_dev';
  }
  
  return 'other';
}

// Clean website URL
function cleanWebsite(url: string | null): string | null {
  if (!url || url === '_' || url === '-') return null;
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

// Clean phone number
function cleanPhone(phone: string | null): string | null {
  if (!phone || phone === '_' || phone === '-' || phone.includes('#ERROR')) {
    return null;
  }
  return phone.toString().trim();
}

// Parse sectors from string
function parseSectors(sectorStr: string): string[] {
  if (!sectorStr || sectorStr === '_') return [];
  
  return sectorStr
    .split(/[\n,]/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

// Parse keywords from string
function parseKeywords(keywordStr: string | null): string[] {
  if (!keywordStr || keywordStr === '_') return [];
  
  return keywordStr
    .split(/[,\n]/)
    .map(k => k.trim())
    .filter(k => k.length > 0);
}

// Parse geography from string
function parseGeography(geoStr: string | null): string[] {
  if (!geoStr || geoStr === '_') return [];
  
  return geoStr
    .split(/[\n,]/)
    .map(g => g.trim())
    .filter(g => g.length > 0);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { buyers } = body as { buyers: BuyerImport[] };

    if (!buyers || !Array.isArray(buyers)) {
      return new Response(
        JSON.stringify({ error: 'Missing buyers array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Corporate Import] Processing ${buyers.length} buyers...`);

    const results = {
      buyersCreated: 0,
      contactsCreated: 0,
      errors: [] as string[],
    };

    for (const buyer of buyers) {
      try {
        // Parse ranges
        const revenueRange = parseRange(buyer.revenue_range);
        const ebitdaRange = parseRange(buyer.ebitda_range);

        // Prepare buyer data
        const buyerData = {
          name: buyer.name,
          website: cleanWebsite(buyer.website),
          country_base: buyer.country_base,
          buyer_type: inferBuyerType(buyer.description, buyer.name),
          description: buyer.description || null,
          investment_thesis: buyer.investment_thesis || null,
          search_keywords: parseKeywords(buyer.keywords?.join(', ') || ''),
          sector_focus: parseSectors(buyer.sectors?.join('\n') || ''),
          geography_focus: parseGeography(buyer.geography_focus?.join('\n') || ''),
          revenue_min: revenueRange.min,
          revenue_max: revenueRange.max,
          ebitda_min: ebitdaRange.min,
          ebitda_max: ebitdaRange.max,
          is_active: true,
        };

        // Insert buyer
        const { data: insertedBuyer, error: buyerError } = await supabase
          .from('corporate_buyers')
          .insert(buyerData)
          .select('id')
          .single();

        if (buyerError) {
          console.error(`[Corporate Import] Error inserting ${buyer.name}:`, buyerError);
          results.errors.push(`${buyer.name}: ${buyerError.message}`);
          continue;
        }

        results.buyersCreated++;
        console.log(`[Corporate Import] Created buyer: ${buyer.name}`);

        // Insert contact if exists
        if (buyer.contact && buyer.contact.name) {
          const contactData = {
            buyer_id: insertedBuyer.id,
            full_name: buyer.contact.name,
            title: buyer.contact.title || null,
            role: inferContactRole(buyer.contact.title),
            email: buyer.contact.email || null,
            linkedin_url: buyer.contact.linkedin_url || null,
            phone: cleanPhone(buyer.contact.phone),
            is_primary_contact: true,
          };

          const { error: contactError } = await supabase
            .from('corporate_contacts')
            .insert(contactData);

          if (contactError) {
            console.error(`[Corporate Import] Error inserting contact for ${buyer.name}:`, contactError);
            results.errors.push(`Contact for ${buyer.name}: ${contactError.message}`);
          } else {
            results.contactsCreated++;
            console.log(`[Corporate Import] Created contact: ${buyer.contact.name}`);
          }
        }
      } catch (err) {
        console.error(`[Corporate Import] Unexpected error for ${buyer.name}:`, err);
        results.errors.push(`${buyer.name}: ${err.message}`);
      }
    }

    console.log(`[Corporate Import] Completed: ${results.buyersCreated} buyers, ${results.contactsCreated} contacts`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Corporate Import] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
