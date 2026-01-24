/**
 * CR People Enrichment Edge Function
 * Enriches cr_people contacts using Firecrawl Search and AI
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import { callAI, parseAIJson } from '../_shared/ai-helper.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PersonEnrichmentResult {
  bio: string | null;
  expertise_areas: string[] | null;
  previous_roles: string[] | null;
  education: string | null;
  media_mentions: string[] | null;
  linkedin_summary: string | null;
  notable_deals: string[] | null;
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
    const { person_ids, limit = 10, force = false } = await req.json();

    // Build query - get people without enrichment, prioritizing those with fund associations
    let query = supabase
      .from('cr_people')
      .select(`
        id, 
        name, 
        title, 
        linkedin_url,
        fund_associations:cr_fund_people(
          fund:cr_funds(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (!force) {
      query = query.is('enriched_at', null);
    }

    if (person_ids?.length) {
      query = query.in('id', person_ids);
    }

    const { data: people, error: fetchError } = await query.limit(limit);

    if (fetchError) throw fetchError;
    if (!people?.length) {
      return new Response(
        JSON.stringify({ success: true, enriched: 0, message: 'No people to enrich' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[cr-people-enrich] Processing ${people.length} contacts`);

    const results = {
      enriched: 0,
      skipped: 0,
      failed: 0,
      details: [] as { id: string; status: string; name?: string }[],
    };

    for (const person of people) {
      // Get fund name if available
      const fundName = person.fund_associations?.[0]?.fund?.name || null;
      
      // Build search query
      const searchTerms = [person.name];
      if (person.title) searchTerms.push(person.title);
      if (fundName) searchTerms.push(fundName);
      searchTerms.push('private equity OR venture capital OR inversión');

      const searchQuery = searchTerms.join(' ');

      try {
        // Use Firecrawl Search to find professional info
        console.log(`[cr-people-enrich] Searching for: ${person.name}`);
        
        const searchResponse = await fetch('https://api.firecrawl.dev/v1/search', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: searchQuery,
            limit: 5,
            scrapeOptions: {
              formats: ['markdown'],
              onlyMainContent: true,
            },
          }),
        });

        if (!searchResponse.ok) {
          const errorText = await searchResponse.text();
          console.error(`[cr-people-enrich] Firecrawl search error for ${person.name}:`, errorText);
          
          // Mark as attempted
          await supabase
            .from('cr_people')
            .update({
              enriched_at: new Date().toISOString(),
              enriched_data: { error: 'search_failed' },
            })
            .eq('id', person.id);

          results.failed++;
          results.details.push({ id: person.id, status: 'search_failed', name: person.name });
          continue;
        }

        const searchData = await searchResponse.json();
        const searchResults = searchData.data || [];

        if (!searchResults.length) {
          // Mark as attempted with no results
          await supabase
            .from('cr_people')
            .update({
              enriched_at: new Date().toISOString(),
              enriched_data: { error: 'no_results' },
            })
            .eq('id', person.id);

          results.skipped++;
          results.details.push({ id: person.id, status: 'no_results', name: person.name });
          continue;
        }

        // Combine search results content
        const combinedContent = searchResults
          .map((r: { title?: string; markdown?: string; url?: string }) => 
            `Source: ${r.url}\nTitle: ${r.title}\n${r.markdown?.substring(0, 2000) || ''}`
          )
          .join('\n\n---\n\n');

        // Extract structured data with AI
        const aiResponse = await callAI([
          {
            role: 'system',
            content: `You are a professional profile analyst specializing in private equity and venture capital professionals.
Extract structured information about the specified person from search results.
Always respond with valid JSON matching this schema:
{
  "bio": "2-3 sentence professional biography",
  "expertise_areas": ["sector 1", "sector 2"],
  "previous_roles": ["Previous role at Company"],
  "education": "University, Degree if found",
  "media_mentions": ["Article title or conference"],
  "linkedin_summary": "Brief LinkedIn-style summary",
  "notable_deals": ["Deal or investment mentioned"]
}
Use null for fields you cannot determine. Only include verified information about this specific person.
Be careful not to confuse this person with others who may share similar names.`,
          },
          {
            role: 'user',
            content: `Extract professional information about "${person.name}"${person.title ? ` (${person.title})` : ''}${fundName ? ` at ${fundName}` : ''} from these search results:

${combinedContent.substring(0, 10000)}`,
          },
        ], {
          jsonMode: true,
          temperature: 0.2,
          maxTokens: 1200,
        });

        const enrichedData = parseAIJson<PersonEnrichmentResult>(aiResponse.content);

        // Update the person with enriched data
        const { error: updateError } = await supabase
          .from('cr_people')
          .update({
            enriched_at: new Date().toISOString(),
            enriched_data: enrichedData,
            bio: enrichedData.bio,
            expertise_areas: enrichedData.expertise_areas,
          })
          .eq('id', person.id);

        if (updateError) throw updateError;

        // Log API usage - Search costs 2 credits
        await supabase.from('api_usage_log').insert({
          service: 'firecrawl',
          operation: 'search',
          credits_used: 2,
          function_name: 'cr-people-enrich',
          metadata: {
            person_id: person.id,
            person_name: person.name,
            fund_name: fundName,
            results_count: searchResults.length,
            ai_provider: aiResponse.provider,
            ai_tokens: aiResponse.tokensUsed,
          },
        });

        results.enriched++;
        results.details.push({ id: person.id, status: 'enriched', name: person.name });

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`[cr-people-enrich] Error processing person ${person.id}:`, error);
        results.failed++;
        results.details.push({ id: person.id, status: 'error', name: person.name });
      }
    }

    console.log(`[cr-people-enrich] Completed: ${results.enriched} enriched, ${results.skipped} skipped, ${results.failed} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        message: `Enriquecidos ${results.enriched} contactos de ${people.length}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[cr-people-enrich] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
