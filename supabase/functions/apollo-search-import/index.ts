import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const APOLLO_API_KEY = Deno.env.get('APOLLO_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============= TYPES =============

interface SearchCriteria {
  person_titles?: string[];
  person_locations?: string[];
  person_seniorities?: string[];
  q_keywords?: string;
  organization_locations?: string[];
  organization_num_employees_ranges?: string[];
  organization_industries?: string[];
  page?: number;
  per_page?: number;
}

interface ApolloPersonResult {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  city?: string;
  state?: string;
  country?: string;
  organization?: {
    id: string;
    name: string;
    website_url?: string;
    linkedin_url?: string;
    primary_domain?: string;
    industry?: string;
    estimated_num_employees?: number;
    city?: string;
    country?: string;
  };
  phone_numbers?: Array<{ raw_number: string; sanitized_number: string; type: string }>;
  departments?: string[];
  subdepartments?: string[];
  seniority?: string;
}

// ============= HELPER FUNCTIONS =============

function mapRoleFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('searcher') || titleLower.includes('ceo') || titleLower.includes('founder')) {
    return 'searcher';
  }
  if (titleLower.includes('partner') || titleLower.includes('investor') || titleLower.includes('director')) {
    return 'backer';
  }
  if (titleLower.includes('advisor') || titleLower.includes('mentor') || titleLower.includes('consultant')) {
    return 'advisor';
  }
  return 'other';
}

function extractLocation(person: ApolloPersonResult): string | null {
  const parts = [];
  if (person.city) parts.push(person.city);
  if (person.country) parts.push(person.country);
  return parts.length > 0 ? parts.join(', ') : null;
}

async function searchPeopleInApollo(criteria: SearchCriteria): Promise<{ people: ApolloPersonResult[]; pagination: any }> {
  console.log('[Apollo] Searching with criteria:', JSON.stringify(criteria));
  
  const response = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': APOLLO_API_KEY!,
    },
    body: JSON.stringify({
      person_titles: criteria.person_titles || [],
      person_locations: criteria.person_locations || [],
      person_seniorities: criteria.person_seniorities || [],
      q_keywords: criteria.q_keywords || '',
      organization_locations: criteria.organization_locations || [],
      organization_num_employees_ranges: criteria.organization_num_employees_ranges || [],
      organization_industries: criteria.organization_industries || [],
      page: criteria.page || 1,
      per_page: Math.min(criteria.per_page || 25, 100),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Apollo] Search error:', response.status, errorText);
    throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[Apollo] Found', data.people?.length || 0, 'people, pagination:', data.pagination);
  
  return {
    people: data.people || [],
    pagination: data.pagination || {},
  };
}

async function enrichPersonEmail(person: ApolloPersonResult): Promise<ApolloPersonResult | null> {
  // Si ya tiene email válido, no enriquecemos
  if (person.email && person.email_status === 'verified') {
    return person;
  }
  
  console.log('[Apollo] Enriching person:', person.name);
  
  try {
    const response = await fetch('https://api.apollo.io/v1/people/match', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'X-Api-Key': APOLLO_API_KEY!,
      },
      body: JSON.stringify({
        first_name: person.first_name,
        last_name: person.last_name,
        organization_name: person.organization?.name,
        linkedin_url: person.linkedin_url,
        reveal_personal_emails: false,
        reveal_phone_number: true,
      }),
    });

    if (!response.ok) {
      console.warn('[Apollo] Enrichment failed for', person.name, response.status);
      return person; // Return original without enrichment
    }

    const data = await response.json();
    if (data.person) {
      return {
        ...person,
        email: data.person.email || person.email,
        email_status: data.person.email_status || person.email_status,
        phone_numbers: data.person.phone_numbers || person.phone_numbers,
      };
    }
    
    return person;
  } catch (error) {
    console.error('[Apollo] Enrichment error for', person.name, error);
    return person;
  }
}

async function findOrCreateFund(
  supabase: ReturnType<typeof createClient>,
  org: ApolloPersonResult['organization']
): Promise<string | null> {
  if (!org?.name) return null;

  // Buscar fund existente por nombre o LinkedIn
  const { data: existing } = await supabase
    .from('sf_funds')
    .select('id')
    .or(`name.ilike.%${org.name}%,linkedin_url.eq.${org.linkedin_url || ''}`)
    .limit(1)
    .single();

  if (existing) {
    console.log('[Import] Found existing fund:', org.name, existing.id);
    return existing.id;
  }

  // Crear nuevo fund
  const { data: newFund, error } = await supabase
    .from('sf_funds')
    .insert({
      name: org.name,
      website_url: org.website_url,
      linkedin_url: org.linkedin_url,
      country: org.country || 'Spain',
      sector_focus: org.industry ? [org.industry] : [],
      status: 'searching',
      source: 'apollo_import',
    })
    .select('id')
    .single();

  if (error) {
    console.error('[Import] Error creating fund:', error);
    return null;
  }

  console.log('[Import] Created new fund:', org.name, newFund.id);
  return newFund.id;
}

async function findExistingPerson(
  supabase: ReturnType<typeof createClient>,
  person: ApolloPersonResult
): Promise<string | null> {
  // Buscar por LinkedIn URL (más fiable)
  if (person.linkedin_url) {
    const { data } = await supabase
      .from('sf_people')
      .select('id')
      .eq('linkedin_url', person.linkedin_url)
      .limit(1)
      .single();
    
    if (data) return data.id;
  }

  // Buscar por email
  if (person.email) {
    const { data } = await supabase
      .from('sf_people')
      .select('id')
      .eq('email', person.email)
      .limit(1)
      .single();
    
    if (data) return data.id;
  }

  return null;
}

async function importPerson(
  supabase: ReturnType<typeof createClient>,
  person: ApolloPersonResult,
  enrich: boolean = false
): Promise<{ success: boolean; action: 'created' | 'updated' | 'skipped'; personId?: string; error?: string }> {
  try {
    // Enriquecer si está activado
    let enrichedPerson = person;
    if (enrich) {
      const enriched = await enrichPersonEmail(person);
      if (enriched) enrichedPerson = enriched;
    }

    // Verificar si ya existe
    const existingId = await findExistingPerson(supabase, enrichedPerson);
    
    // Buscar o crear fund si tiene organización
    const fundId = await findOrCreateFund(supabase, enrichedPerson.organization);

    const personData = {
      full_name: enrichedPerson.name,
      email: enrichedPerson.email,
      linkedin_url: enrichedPerson.linkedin_url,
      phone: enrichedPerson.phone_numbers?.[0]?.sanitized_number,
      role: mapRoleFromTitle(enrichedPerson.title || ''),
      title: enrichedPerson.title,
      location: extractLocation(enrichedPerson),
      fund_id: fundId,
      notes: `Importado desde Apollo el ${new Date().toLocaleDateString('es-ES')}`,
    };

    if (existingId) {
      // Actualizar existente
      const { error } = await supabase
        .from('sf_people')
        .update(personData)
        .eq('id', existingId);

      if (error) {
        console.error('[Import] Update error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[Import] Updated person:', enrichedPerson.name);
      return { success: true, action: 'updated', personId: existingId };
    } else {
      // Crear nuevo
      const { data: newPerson, error } = await supabase
        .from('sf_people')
        .insert(personData)
        .select('id')
        .single();

      if (error) {
        console.error('[Import] Insert error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[Import] Created person:', enrichedPerson.name);
      return { success: true, action: 'created', personId: newPerson.id };
    }
  } catch (error) {
    console.error('[Import] Error importing person:', error);
    return { success: false, action: 'skipped', error: String(error) };
  }
}

// ============= MAIN HANDLER =============

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!APOLLO_API_KEY) {
      throw new Error('APOLLO_API_KEY not configured');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const body = await req.json();
    const { action, ...params } = body;

    console.log('[apollo-search-import] Action:', action, 'Params:', JSON.stringify(params));

    // ============= ACTION: SEARCH =============
    if (action === 'search') {
      const { criteria, import_id } = params;
      
      const result = await searchPeopleInApollo(criteria);
      
      // Si hay import_id, actualizar el registro
      if (import_id) {
        await supabase
          .from('sf_apollo_imports')
          .update({
            status: 'previewing',
            total_results: result.pagination?.total_entries || result.people.length,
            preview_data: result.people,
          })
          .eq('id', import_id);
      }

      return new Response(JSON.stringify({
        success: true,
        people: result.people,
        pagination: result.pagination,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: CREATE IMPORT JOB =============
    if (action === 'create_import') {
      const { criteria, user_id } = params;
      
      const { data: importJob, error } = await supabase
        .from('sf_apollo_imports')
        .insert({
          search_criteria: criteria,
          status: 'pending',
          created_by: user_id,
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create import job: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        import_id: importJob.id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: IMPORT SELECTED =============
    if (action === 'import_selected') {
      const { import_id, people, enrich = false } = params;
      
      // Actualizar estado
      await supabase
        .from('sf_apollo_imports')
        .update({ status: 'importing', started_at: new Date().toISOString() })
        .eq('id', import_id);

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        details: [] as any[],
      };

      // Importar cada persona
      for (const person of people) {
        const result = await importPerson(supabase, person, enrich);
        
        if (result.success) {
          if (result.action === 'created') results.imported++;
          else if (result.action === 'updated') results.updated++;
          else results.skipped++;
        } else {
          results.errors++;
        }
        
        results.details.push({
          name: person.name,
          ...result,
        });

        // Pequeña pausa para no saturar
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Actualizar registro de import
      await supabase
        .from('sf_apollo_imports')
        .update({
          status: 'completed',
          imported_count: results.imported,
          updated_count: results.updated,
          skipped_count: results.skipped,
          error_count: results.errors,
          import_results: results.details,
          credits_used: enrich ? people.length : 0,
          completed_at: new Date().toISOString(),
        })
        .eq('id', import_id);

      return new Response(JSON.stringify({
        success: true,
        results,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: GET HISTORY =============
    if (action === 'get_history') {
      const { limit = 20 } = params;
      
      const { data, error } = await supabase
        .from('sf_apollo_imports')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        throw new Error(`Failed to fetch history: ${error.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        imports: data,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: PRESETS =============
    if (action === 'get_presets') {
      const presets = [
        {
          id: 'searchers_spain',
          name: 'Searchers España',
          description: 'CEOs y founders de Search Funds en España',
          criteria: {
            person_titles: ['Searcher', 'CEO', 'Founder', 'Managing Partner'],
            person_locations: ['Spain'],
            q_keywords: 'search fund OR ETA OR entrepreneurship through acquisition',
            person_seniorities: ['owner', 'founder', 'c_suite'],
          },
        },
        {
          id: 'eta_europe',
          name: 'ETA Europa',
          description: 'Profesionales de ETA en principales países europeos',
          criteria: {
            person_titles: ['Searcher', 'CEO', 'Founder', 'ETA'],
            person_locations: ['Spain', 'Portugal', 'France', 'Germany', 'Italy', 'United Kingdom'],
            q_keywords: 'search fund OR ETA OR entrepreneurship acquisition',
            person_seniorities: ['owner', 'founder', 'c_suite'],
          },
        },
        {
          id: 'backers_potential',
          name: 'Potenciales Backers',
          description: 'Family offices e inversores que podrían invertir en SF',
          criteria: {
            person_titles: ['Partner', 'Principal', 'Investment Director', 'Managing Director'],
            person_locations: ['Spain', 'Portugal'],
            organization_industries: ['investment banking', 'venture capital', 'private equity'],
            person_seniorities: ['partner', 'c_suite', 'director'],
          },
        },
        {
          id: 'sf_advisors',
          name: 'Asesores de Search Funds',
          description: 'Consultores y asesores especializados en SF',
          criteria: {
            person_titles: ['Advisor', 'Consultant', 'Mentor', 'Board Member'],
            person_locations: ['Spain', 'Portugal', 'France'],
            q_keywords: 'search fund advisor OR ETA mentor',
          },
        },
      ];

      return new Response(JSON.stringify({
        success: true,
        presets,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);

  } catch (error) {
    console.error('[apollo-search-import] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
