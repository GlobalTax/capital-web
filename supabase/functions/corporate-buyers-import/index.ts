// =============================================
// CORPORATE BUYERS IMPORT EDGE FUNCTION
// Imports corporate buyers with their contacts
// SECURED: Requires authenticated admin user
// =============================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://webcapittal.lovable.app',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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
  source_url: string | null;
  contact: BuyerContact | null;
}

// Parse range like "€ 10 millon(es) - € 200 millon(es)" to { min, max }
function parseRange(rangeStr: string | null): { min: number | null; max: number | null } {
  if (!rangeStr || rangeStr === '_' || rangeStr === '-') {
    return { min: null, max: null };
  }

  const cleaned = rangeStr
    .replace(/€/g, '')
    .replace(/millon\(es\)/gi, '')
    .replace(/millones/gi, '')
    .replace(/millon/gi, '')
    .replace(/M/gi, '')
    .trim();

  const parts = cleaned.split('-').map(p => p.trim());
  
  if (parts.length === 2) {
    const minNum = parseFloat(parts[0].replace(/[^\d.]/g, ''));
    const maxNum = parseFloat(parts[1].replace(/[^\d.]/g, ''));
    
    const min = isNaN(minNum) ? null : minNum;
    const max = isNaN(maxNum) ? null : maxNum;
    
    return {
      min: min !== null ? min * 1000000 : null,
      max: max !== null ? max * 1000000 : null,
    };
  }

  return { min: null, max: null };
}

function inferBuyerType(description: string, name: string): string {
  const text = `${description} ${name}`.toLowerCase();
  
  if (text.includes('family office') || text.includes('familiar')) return 'family_office';
  if (text.includes('private equity') || text.includes('pe fund') || text.includes('fondo')) return 'pe_fund';
  if (text.includes('holding') || text.includes('grupo') || text.includes('group')) return 'holding';
  if (text.includes('estratégico') || text.includes('strategic')) return 'strategic_buyer';
  
  return 'corporate';
}

function inferContactRole(title: string | null): string {
  if (!title) return 'other';
  const t = title.toLowerCase();
  
  if (t.includes('m&a') || t.includes('desarrollo') || t.includes('development') || t.includes('overnames') || t.includes('corporate dev')) return 'm_and_a';
  if (t.includes('ceo') || t.includes('cfo') || t.includes('cso') || t.includes('cco') || t.includes('cdo') || t.includes('president') || t.includes('managing director') || t.includes('md')) return 'cxo';
  if (t.includes('owner') || t.includes('dueño') || t.includes('propietario')) return 'owner';
  if (t.includes('director')) return 'director';
  if (t.includes('partner') || t.includes('socio')) return 'partner';
  if (t.includes('business dev') || t.includes('bd ')) return 'business_dev';
  
  return 'other';
}

function cleanWebsite(url: string | null): string | null {
  if (!url || url === '_' || url === '-') return null;
  if (!url.startsWith('http://') && !url.startsWith('https://')) return `https://${url}`;
  return url;
}

function cleanPhone(phone: string | null): string | null {
  if (!phone || phone === '_' || phone === '-' || phone.includes('#ERROR')) return null;
  return phone.toString().trim();
}

function parseSectors(sectorStr: string): string[] {
  if (!sectorStr || sectorStr === '_') return [];
  return sectorStr.split(/[\n,]/).map(s => s.trim()).filter(s => s.length > 0);
}

function parseKeywords(keywordStr: string | null): string[] {
  if (!keywordStr || keywordStr === '_') return [];
  return keywordStr.split(/[,\n]/).map(k => k.trim()).filter(k => k.length > 0);
}

function parseGeography(geoStr: string | null): string[] {
  if (!geoStr || geoStr === '_') return [];
  return geoStr.split(/[\n,]/).map(g => g.trim()).filter(g => g.length > 0);
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // ========================================
    // 1. AUTHENTICATION: Validate JWT
    // ========================================
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.warn('[Corporate Import] Request without Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Missing authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);

    if (claimsError || !claimsData?.claims) {
      console.warn('[Corporate Import] Invalid JWT token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub as string;
    const userEmail = claimsData.claims.email as string;

    // ========================================
    // 2. AUTHORIZATION: Verify admin role
    // ========================================
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: adminUser, error: adminError } = await adminClient
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (adminError || !adminUser) {
      console.warn(`[Corporate Import] User ${userEmail} (${userId}) is not an admin`);
      return new Response(
        JSON.stringify({ error: 'Forbidden - Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userRole = adminUser.role;
    console.log(`[Corporate Import] Authenticated admin: ${userEmail} (role: ${userRole})`);

    // ========================================
    // 3. Parse request body
    // ========================================
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { buyers, mode } = body as { buyers: BuyerImport[]; mode?: 'append' | 'replace' };

    // ========================================
    // 4. Handle replace mode (super_admin only)
    // ========================================
    if (mode === 'replace') {
      if (userRole !== 'super_admin') {
        console.warn(`[Corporate Import] User ${userEmail} attempted replace mode with role: ${userRole}`);
        return new Response(
          JSON.stringify({ error: 'Forbidden - Only super admins can use replace mode' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`[Corporate Import] Replace mode by super_admin ${userEmail} - clearing existing data...`);
      await adminClient.from('corporate_contacts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await adminClient.from('corporate_buyers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      console.log('[Corporate Import] Existing data cleared');
    }

    if (!buyers || !Array.isArray(buyers)) {
      return new Response(
        JSON.stringify({ error: 'Missing buyers array' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[Corporate Import] Processing ${buyers.length} buyers by ${userEmail}...`);

    const results = {
      buyersCreated: 0,
      buyersUpdated: 0,
      contactsCreated: 0,
      contactsUpdated: 0,
      errors: [] as string[],
    };

    for (const buyer of buyers) {
      try {
        const revenueRange = parseRange(buyer.revenue_range);
        const ebitdaRange = parseRange(buyer.ebitda_range);

        const buyerData = {
          name: buyer.name.trim(),
          website: cleanWebsite(buyer.website),
          country_base: buyer.country_base || null,
          buyer_type: inferBuyerType(buyer.description || '', buyer.name),
          description: buyer.description || null,
          investment_thesis: buyer.investment_thesis || null,
          search_keywords: parseKeywords(buyer.keywords?.join ? buyer.keywords.join(',') : buyer.keywords as unknown as string),
          sector_focus: typeof buyer.sectors === 'string' ? parseSectors(buyer.sectors as string) : (buyer.sectors || []),
          geography_focus: typeof buyer.geography_focus === 'string' ? parseGeography(buyer.geography_focus as string) : (buyer.geography_focus || []),
          revenue_min: revenueRange.min,
          revenue_max: revenueRange.max,
          ebitda_min: ebitdaRange.min,
          ebitda_max: ebitdaRange.max,
          source_url: buyer.source_url || null,
          is_active: true,
          is_deleted: false,
          updated_at: new Date().toISOString(),
        };

        const { data: existingBuyer } = await adminClient
          .from('corporate_buyers')
          .select('id')
          .eq('name', buyer.name.trim())
          .eq('is_deleted', false)
          .maybeSingle();

        let buyerId: string;

        if (existingBuyer) {
          const { error: updateError } = await adminClient
            .from('corporate_buyers')
            .update(buyerData)
            .eq('id', existingBuyer.id);

          if (updateError) {
            console.error(`[Corporate Import] Error updating ${buyer.name}:`, updateError);
            results.errors.push(`${buyer.name}: ${updateError.message}`);
            continue;
          }

          buyerId = existingBuyer.id;
          results.buyersUpdated++;
        } else {
          const { data: insertedBuyer, error: buyerError } = await adminClient
            .from('corporate_buyers')
            .insert(buyerData)
            .select('id')
            .single();

          if (buyerError) {
            console.error(`[Corporate Import] Error inserting ${buyer.name}:`, buyerError);
            results.errors.push(`${buyer.name}: ${buyerError.message}`);
            continue;
          }

          buyerId = insertedBuyer.id;
          results.buyersCreated++;
        }

        // Handle contact
        if (buyer.contact && buyer.contact.name) {
          const contactData = {
            buyer_id: buyerId,
            full_name: buyer.contact.name,
            title: buyer.contact.title || null,
            role: inferContactRole(buyer.contact.title),
            email: buyer.contact.email || null,
            linkedin_url: buyer.contact.linkedin_url || null,
            phone: cleanPhone(buyer.contact.phone),
            is_primary_contact: true,
            updated_at: new Date().toISOString(),
          };

          const { data: existingContact } = await adminClient
            .from('corporate_contacts')
            .select('id')
            .eq('buyer_id', buyerId)
            .eq('is_deleted', false)
            .or(`email.eq.${buyer.contact.email},full_name.eq.${buyer.contact.name}`)
            .maybeSingle();

          if (existingContact) {
            const { error: updateContactError } = await adminClient
              .from('corporate_contacts')
              .update(contactData)
              .eq('id', existingContact.id);

            if (updateContactError) {
              results.errors.push(`Contact update for ${buyer.name}: ${updateContactError.message}`);
            } else {
              results.contactsUpdated++;
            }
          } else {
            const { error: contactError } = await adminClient
              .from('corporate_contacts')
              .insert(contactData);

            if (contactError) {
              results.errors.push(`Contact for ${buyer.name}: ${contactError.message}`);
            } else {
              results.contactsCreated++;
            }
          }
        }
      } catch (err) {
        console.error(`[Corporate Import] Unexpected error for ${buyer.name}:`, err);
        results.errors.push(`${buyer.name}: ${err.message}`);
      }
    }

    console.log(`[Corporate Import] Completed by ${userEmail}: ${results.buyersCreated} created, ${results.buyersUpdated} updated`);

    return new Response(
      JSON.stringify({ success: true, ...results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[Corporate Import] Fatal error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
