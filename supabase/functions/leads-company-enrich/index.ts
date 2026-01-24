/**
 * Leads Company Enrichment Edge Function
 * Enriches acquisition_leads by scraping company websites based on email domain
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { callAI, parseAIJson } from '../_shared/ai-helper.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EnrichmentResult {
  company_description: string | null;
  company_sector: string | null;
  company_size: string | null;
  products_services: string[] | null;
  social_links: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  } | null;
  technologies: string[] | null;
  founded_year: number | null;
  headquarters: string | null;
}

// Extract domain from email
function extractDomainFromEmail(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  const domain = email.split('@')[1]?.toLowerCase();
  
  // Skip common free email providers
  const freeProviders = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com',
    'aol.com', 'protonmail.com', 'mail.com', 'gmx.com', 'live.com',
    'hotmail.es', 'yahoo.es', 'outlook.es', 'me.com'
  ];
  
  if (freeProviders.includes(domain)) return null;
  return domain;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    if (!firecrawlKey) {
      throw new Error('FIRECRAWL_API_KEY not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const { lead_ids, limit = 10, force = false } = await req.json();

    // Build query - get leads without enrichment and with valid email domain
    let query = supabase
      .from('acquisition_leads')
      .select('id, email, email_domain, company, full_name')
      .is('is_deleted', false)
      .order('created_at', { ascending: false });

    if (!force) {
      query = query.is('company_enriched_at', null);
    }

    if (lead_ids?.length) {
      query = query.in('id', lead_ids);
    }

    const { data: leads, error: fetchError } = await query.limit(limit);

    if (fetchError) throw fetchError;
    if (!leads?.length) {
      return new Response(
        JSON.stringify({ success: true, enriched: 0, message: 'No leads to enrich' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[leads-company-enrich] Processing ${leads.length} leads`);

    const results = {
      enriched: 0,
      skipped: 0,
      failed: 0,
      details: [] as { id: string; status: string; domain?: string }[],
    };

    for (const lead of leads) {
      const domain = extractDomainFromEmail(lead.email);
      
      if (!domain) {
        results.skipped++;
        results.details.push({ id: lead.id, status: 'skipped_no_domain' });
        continue;
      }

      try {
        // Scrape website with Firecrawl
        console.log(`[leads-company-enrich] Scraping https://${domain}`);
        
        const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: `https://${domain}`,
            formats: ['markdown'],
            onlyMainContent: true,
            waitFor: 2000,
          }),
        });

        if (!scrapeResponse.ok) {
          const errorText = await scrapeResponse.text();
          console.error(`[leads-company-enrich] Firecrawl error for ${domain}:`, errorText);
          
          // Mark as attempted even if failed
          await supabase
            .from('acquisition_leads')
            .update({
              company_enriched_at: new Date().toISOString(),
              company_enriched_data: { error: 'scrape_failed', domain },
            })
            .eq('id', lead.id);

          results.failed++;
          results.details.push({ id: lead.id, status: 'scrape_failed', domain });
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const markdown = scrapeData.data?.markdown || '';

        if (!markdown || markdown.length < 100) {
          results.skipped++;
          results.details.push({ id: lead.id, status: 'empty_content', domain });
          continue;
        }

        // Extract structured data with AI
        const aiResponse = await callAI([
          {
            role: 'system',
            content: `You are a company data analyst. Extract structured information from website content.
Always respond with valid JSON matching this schema:
{
  "company_description": "2-3 sentence company description",
  "company_sector": "Primary industry/sector",
  "company_size": "startup | pyme | mediana | grande",
  "products_services": ["main product/service 1", "main product/service 2"],
  "social_links": { "linkedin": "url", "twitter": "url" },
  "technologies": ["tech1", "tech2"],
  "founded_year": 2015,
  "headquarters": "City, Country"
}
Use null for fields you cannot determine. Be concise and accurate.`,
          },
          {
            role: 'user',
            content: `Extract company information from this website (domain: ${domain}):

${markdown.substring(0, 8000)}`,
          },
        ], {
          jsonMode: true,
          temperature: 0.2,
          maxTokens: 1000,
        });

        const enrichedData = parseAIJson<EnrichmentResult>(aiResponse.content);

        // Update the lead with enriched data
        const { error: updateError } = await supabase
          .from('acquisition_leads')
          .update({
            company_enriched_at: new Date().toISOString(),
            company_enriched_data: enrichedData,
            company_description: enrichedData.company_description,
            company_sector: enrichedData.company_sector,
            company_size: enrichedData.company_size,
          })
          .eq('id', lead.id);

        if (updateError) throw updateError;

        // Log API usage
        await supabase.from('api_usage_log').insert({
          service: 'firecrawl',
          operation: 'scrape',
          credits_used: 1,
          function_name: 'leads-company-enrich',
          metadata: {
            lead_id: lead.id,
            domain,
            ai_provider: aiResponse.provider,
            ai_tokens: aiResponse.tokensUsed,
          },
        });

        results.enriched++;
        results.details.push({ id: lead.id, status: 'enriched', domain });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`[leads-company-enrich] Error processing lead ${lead.id}:`, error);
        results.failed++;
        results.details.push({ id: lead.id, status: 'error', domain });
      }
    }

    console.log(`[leads-company-enrich] Completed: ${results.enriched} enriched, ${results.skipped} skipped, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        message: `Enriquecidos ${results.enriched} leads de ${leads.length}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[leads-company-enrich] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
