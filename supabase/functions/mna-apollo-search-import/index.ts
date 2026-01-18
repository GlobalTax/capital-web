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
  _is_organization?: boolean;
}

// ============= HELPER FUNCTIONS =============

// Verify if a list exists in Apollo using multiple methods (copied from CR)
async function verifyListExists(listId: string, apiKey: string): Promise<{exists: boolean, name?: string, total?: number, listType?: string}> {
  try {
    console.log(`[MNA Apollo] Verifying list exists: ${listId}`);
    
    // Method 1: Try to get list info directly via labels endpoint
    try {
      const labelsResponse = await fetch('https://api.apollo.io/v1/labels', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
      });
      
      console.log(`[MNA Apollo] Labels endpoint status: ${labelsResponse.status}`);
      
      if (labelsResponse.ok) {
        const labelsData = await labelsResponse.json();
        console.log(`[MNA Apollo] Labels response type: ${Array.isArray(labelsData) ? 'array' : typeof labelsData}`);
        
        const labels = Array.isArray(labelsData) ? labelsData : (labelsData.labels || labelsData.data || labelsData.contact_labels || []);
        console.log(`[MNA Apollo] Fetched ${labels.length} labels from Apollo`);
        
        if (labels.length > 0) {
          console.log(`[MNA Apollo] Sample labels: ${JSON.stringify(labels.slice(0, 3))}`);
        }
        
        const foundLabel = labels.find((label: any) => label.id === listId || label._id === listId);
        if (foundLabel) {
          const listType = foundLabel.label_type || foundLabel.modality || 'label';
          console.log(`[MNA Apollo] ✅ Found list via labels: "${foundLabel.name}" (type: ${listType}, cached_count: ${foundLabel.cached_count})`);
          return { 
            exists: true, 
            name: foundLabel.name,
            listType: 'label',
            total: foundLabel.cached_count,
          };
        }
        console.log(`[MNA Apollo] List ${listId} not found in labels endpoint`);
      } else {
        const errorText = await labelsResponse.text();
        console.warn(`[MNA Apollo] Labels endpoint error: ${labelsResponse.status} - ${errorText}`);
      }
    } catch (labelError) {
      console.warn('[MNA Apollo] Labels endpoint failed:', labelError);
    }
    
    // Method 2: Try saved_views endpoint for dynamic lists
    try {
      const savedViewsResponse = await fetch('https://api.apollo.io/v1/saved_views', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': apiKey,
        },
      });
      
      if (savedViewsResponse.ok) {
        const savedViewsData = await savedViewsResponse.json();
        const views = savedViewsData.saved_views || [];
        console.log(`[MNA Apollo] Fetched ${views.length} saved views from Apollo`);
        
        const foundView = views.find((view: any) => view.id === listId);
        if (foundView) {
          console.log(`[MNA Apollo] ✅ Found list via saved_views: "${foundView.name}"`);
          return { 
            exists: true, 
            name: foundView.name,
            listType: 'saved_view' 
          };
        }
      }
    } catch (viewError) {
      console.warn('[MNA Apollo] Saved views endpoint failed:', viewError);
    }
    
    // Method 3: Fallback - do a search and check if results look filtered
    const response = await fetch('https://api.apollo.io/v1/contacts/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': apiKey,
      },
      body: JSON.stringify({
        contact_list_ids: [listId],
        page: 1,
        per_page: 10,
      }),
    });

    if (!response.ok) {
      console.warn('[MNA Apollo] Could not verify list - API error');
      return { exists: true };
    }

    const data = await response.json();
    const totalEntries = data.pagination?.total_entries || 0;
    const contacts = data.contacts || [];
    
    const hasListNames = contacts.some((c: any) => 
      c.contact_list_names && c.contact_list_names.length > 0
    );
    
    const isInTargetList = contacts.some((c: any) => 
      c.contact_list_ids && c.contact_list_ids.includes(listId)
    );
    
    console.log(`[MNA Apollo] Search verification: total=${totalEntries}, hasListNames=${hasListNames}, isInTargetList=${isInTargetList}`);
    
    if (isInTargetList || hasListNames) {
      const listName = contacts[0]?.contact_list_names?.[0];
      return { 
        exists: true, 
        name: listName,
        total: totalEntries 
      };
    }
    
    if (totalEntries > 40000) {
      console.warn(`[MNA Apollo] List ${listId} appears invalid - returned ${totalEntries} contacts without list association`);
      return { exists: false, total: totalEntries };
    }
    
    return { 
      exists: true, 
      total: totalEntries 
    };
  } catch (error) {
    console.warn('[MNA Apollo] Error verifying list:', error);
    return { exists: true };
  }
}

// Map roles specific to M&A Boutiques
function mapMNARoleFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  if (titleLower.includes('managing partner') || titleLower.includes('senior partner')) {
    return 'partner';
  }
  if (titleLower.includes('partner') || titleLower.includes('socio')) {
    return 'partner';
  }
  if (titleLower.includes('managing director') || titleLower.includes('md')) {
    return 'managing_director';
  }
  if (titleLower.includes('director')) {
    return 'director';
  }
  if (titleLower.includes('vp') || titleLower.includes('vice president')) {
    return 'vp';
  }
  if (titleLower.includes('associate')) {
    return 'associate';
  }
  if (titleLower.includes('analyst') || titleLower.includes('analista')) {
    return 'analyst';
  }
  
  return 'other';
}

// Detect boutique tier based on organization info
function detectBoutiqueTier(org: ApolloPersonResult['organization']): string {
  if (!org) return 'tier_3';
  
  const employees = org.estimated_num_employees || 0;
  const name = (org.name || '').toLowerCase();
  
  const tier1Names = ['goldman', 'morgan stanley', 'jp morgan', 'lazard', 'rothschild', 'evercore', 'moelis'];
  if (tier1Names.some(n => name.includes(n)) || employees > 500) {
    return 'tier_1';
  }
  
  if (employees > 50) {
    return 'tier_2';
  }
  
  if (employees > 10) {
    return 'regional';
  }
  
  return 'tier_3';
}

// Detect specialization from organization info
function detectSpecialization(org: ApolloPersonResult['organization']): string[] {
  if (!org) return ['sell_side'];
  
  const name = (org.name || '').toLowerCase();
  const industry = (org.industry || '').toLowerCase();
  const specializations: string[] = [];
  
  if (name.includes('m&a') || name.includes('mergers') || industry.includes('investment banking')) {
    specializations.push('sell_side', 'buy_side');
  }
  if (name.includes('due diligence') || name.includes('dd')) {
    specializations.push('due_diligence');
  }
  if (name.includes('valuation') || name.includes('valoracion')) {
    specializations.push('valuation');
  }
  if (name.includes('restructur')) {
    specializations.push('restructuring');
  }
  if (name.includes('debt') || name.includes('deuda')) {
    specializations.push('debt_advisory');
  }
  
  return specializations.length > 0 ? specializations : ['sell_side'];
}

function extractLocation(person: ApolloPersonResult): string | null {
  const parts = [];
  if (person.city) parts.push(person.city);
  if (person.country) parts.push(person.country);
  return parts.length > 0 ? parts.join(', ') : null;
}

async function findOrCreateBoutique(
  supabase: ReturnType<typeof createClient>,
  org: ApolloPersonResult['organization']
): Promise<string | null> {
  if (!org?.name) return null;

  const normalizedName = org.name.trim();
  
  // Search existing boutique by name
  const { data: existing } = await supabase
    .from('mna_boutiques')
    .select('id')
    .ilike('name', normalizedName)
    .eq('is_deleted', false)
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log('[MNA Import] Found existing boutique:', normalizedName, existing.id);
    return existing.id;
  }

  // Check by website if available
  if (org.website_url) {
    const { data: byWebsite } = await supabase
      .from('mna_boutiques')
      .select('id')
      .eq('website', org.website_url)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (byWebsite) {
      console.log('[MNA Import] Found existing boutique by website:', normalizedName, byWebsite.id);
      return byWebsite.id;
    }
  }

  // Create new boutique
  const tier = detectBoutiqueTier(org);
  const specialization = detectSpecialization(org);
  
  const { data: newBoutique, error } = await supabase
    .from('mna_boutiques')
    .insert({
      name: normalizedName,
      website: org.website_url,
      linkedin_url: org.linkedin_url,
      country_base: org.country || 'Spain',
      employee_count: org.estimated_num_employees,
      employee_count_source: 'apollo',
      sector_focus: org.industry ? [org.industry] : [],
      specialization,
      status: 'active',
      tier,
      source_url: 'apollo_import',
    })
    .select('id')
    .single();

  if (error) {
    console.warn('[MNA Import] Insert failed, checking for existing boutique:', error.message);
    
    const { data: fallback } = await supabase
      .from('mna_boutiques')
      .select('id')
      .ilike('name', normalizedName)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (fallback) {
      console.log('[MNA Import] Found boutique after race condition:', normalizedName, fallback.id);
      return fallback.id;
    }
    
    console.error('[MNA Import] Error creating boutique:', error);
    return null;
  }

  console.log('[MNA Import] Created new boutique:', normalizedName, newBoutique.id, 'tier:', tier);
  return newBoutique.id;
}

async function findExistingPerson(
  supabase: ReturnType<typeof createClient>,
  person: ApolloPersonResult
): Promise<string | null> {
  if (person.linkedin_url) {
    const { data } = await supabase
      .from('mna_boutique_people')
      .select('id')
      .eq('linkedin_url', person.linkedin_url)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (data) return data.id;
  }

  if (person.email) {
    const { data } = await supabase
      .from('mna_boutique_people')
      .select('id')
      .eq('email', person.email)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
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
    const existingId = await findExistingPerson(supabase, person);
    const boutiqueId = await findOrCreateBoutique(supabase, person.organization);

    if (!boutiqueId) {
      console.error('[MNA Import] Skipping person - no boutique_id:', person.name, person.organization?.name);
      return { 
        success: false, 
        action: 'skipped', 
        error: `No se pudo crear/encontrar la boutique: ${person.organization?.name || 'Sin organización'}` 
      };
    }

    const personData = {
      full_name: person.name,
      email: person.email,
      linkedin_url: person.linkedin_url,
      phone: person.phone_numbers?.[0]?.sanitized_number,
      role: mapMNARoleFromTitle(person.title || ''),
      title: person.title,
      location: extractLocation(person),
      boutique_id: boutiqueId,
      notes: `Importado desde Apollo el ${new Date().toLocaleDateString('es-ES')}. Cargo: ${person.title || 'N/A'}`,
    };

    if (existingId) {
      const { error } = await supabase
        .from('mna_boutique_people')
        .update(personData)
        .eq('id', existingId);

      if (error) {
        console.error('[MNA Import] Update error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[MNA Import] Updated person:', person.name);
      return { success: true, action: 'updated', personId: existingId };
    } else {
      const { data: newPerson, error } = await supabase
        .from('mna_boutique_people')
        .insert(personData)
        .select('id')
        .single();

      if (error) {
        console.error('[MNA Import] Insert error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[MNA Import] Created person:', person.name);
      return { success: true, action: 'created', personId: newPerson.id };
    }
  } catch (error) {
    console.error('[MNA Import] Error importing person:', error);
    return { success: false, action: 'skipped', error: String(error) };
  }
}

async function importOrganization(
  supabase: ReturnType<typeof createClient>,
  org: ApolloPersonResult
): Promise<{ success: boolean; action: 'created' | 'updated' | 'skipped'; boutiqueId?: string; error?: string }> {
  try {
    const normalizedName = org.name.trim();
    
    // Check if boutique already exists
    const { data: existing } = await supabase
      .from('mna_boutiques')
      .select('id')
      .ilike('name', normalizedName)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();

    if (existing) {
      // Update existing boutique
      const updateData: any = {
        employee_count: org.organization?.estimated_num_employees,
        employee_count_source: 'apollo',
      };
      
      if (org.organization?.website_url) updateData.website = org.organization.website_url;
      if (org.linkedin_url) updateData.linkedin_url = org.linkedin_url;
      if (org.organization?.country) updateData.country_base = org.organization.country;
      
      const { error } = await supabase
        .from('mna_boutiques')
        .update(updateData)
        .eq('id', existing.id);

      if (error) {
        console.error('[MNA Import] Update org error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[MNA Import] Updated boutique:', normalizedName);
      return { success: true, action: 'updated', boutiqueId: existing.id };
    }

    // Create new boutique
    const tier = detectBoutiqueTier(org.organization);
    const specialization = detectSpecialization(org.organization);
    
    const { data: newBoutique, error } = await supabase
      .from('mna_boutiques')
      .insert({
        name: normalizedName,
        website: org.organization?.website_url,
        linkedin_url: org.linkedin_url,
        country_base: org.organization?.country || 'Spain',
        employee_count: org.organization?.estimated_num_employees,
        employee_count_source: 'apollo',
        sector_focus: org.organization?.industry ? [org.organization.industry] : [],
        specialization,
        status: 'active',
        tier,
        source_url: 'apollo_import',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[MNA Import] Insert org error:', error);
      return { success: false, action: 'skipped', error: error.message };
    }

    console.log('[MNA Import] Created boutique:', normalizedName, newBoutique.id);
    return { success: true, action: 'created', boutiqueId: newBoutique.id };
  } catch (error) {
    console.error('[MNA Import] Error importing org:', error);
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

    console.log('[mna-apollo-search-import] Action:', action, 'Params:', JSON.stringify(params));

    // ============= ACTION: GET PRESETS =============
    if (action === 'get_presets') {
      const presets = [
        {
          id: 'mna-spain',
          name: 'M&A Advisors España',
          description: 'Profesionales M&A en España',
          criteria: {
            person_titles: ['Partner', 'Managing Director', 'Director', 'Vice President'],
            person_locations: ['Spain'],
            q_keywords: '"M&A" OR "corporate finance" OR "investment banking" OR "fusiones"',
            organization_industries: ['investment banking', 'financial services'],
          }
        },
        {
          id: 'mna-iberia',
          name: 'M&A Iberia',
          description: 'Profesionales M&A en España y Portugal',
          criteria: {
            person_titles: ['Partner', 'Director', 'Managing Director'],
            person_locations: ['Spain', 'Portugal'],
            q_keywords: '"mergers" OR "acquisitions" OR "M&A" OR "corporate finance"',
          }
        },
        {
          id: 'boutiques-mid-market',
          name: 'Boutiques Mid-Market',
          description: 'Boutiques especializadas en mid-market',
          criteria: {
            q_keywords: '"M&A boutique" OR "mid-market" OR "lower middle market" OR "corporate finance"',
            organization_num_employees_ranges: ['11,50', '51,200'],
          }
        },
        {
          id: 'valuation-advisory',
          name: 'Valoración y Due Diligence',
          description: 'Profesionales de valoración y DD',
          criteria: {
            person_titles: ['Partner', 'Director', 'Manager'],
            q_keywords: '"valuation" OR "due diligence" OR "valoracion" OR "transaction services"',
          }
        },
      ];

      return new Response(JSON.stringify({
        success: true,
        presets,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: GET HISTORY =============
    if (action === 'get_history') {
      const { limit = 20 } = params;
      
      const { data, error } = await supabase
        .from('mna_apollo_imports')
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

    // ============= ACTION: CREATE IMPORT JOB =============
    if (action === 'create_import') {
      const { criteria, user_id, import_type } = params;
      
      const { data: importJob, error } = await supabase
        .from('mna_apollo_imports')
        .insert({
          search_criteria: criteria,
          status: 'pending',
          import_type: import_type || 'contacts',
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

    // ============= ACTION: SEARCH FROM LIST (CONTACTS) =============
    if (action === 'search_from_list') {
      console.log('🚀 [MNA Apollo] ACTION: search_from_list STARTING');
      
      const { list_id, max_pages = 20 } = params;
      
      if (!list_id) {
        throw new Error('list_id is required');
      }

      console.log('🔍 [MNA Apollo] Fetching contacts from list:', list_id);
      
      // ============= PRE-VERIFICATION: Check if list exists =============
      const listCheck = await verifyListExists(list_id, APOLLO_API_KEY!);
      console.log(`[MNA Apollo] List pre-check: exists=${listCheck.exists}, name=${listCheck.name}, total=${listCheck.total}`);
      
      if (!listCheck.exists) {
        console.error(`❌ [MNA Apollo] List "${list_id}" does not exist or was deleted`);
        return new Response(JSON.stringify({
          success: false,
          error: `La lista "${list_id}" no existe en Apollo o fue eliminada. Apollo devolvió ${listCheck.total?.toLocaleString() || 'N/A'} contactos sin filtrar.`,
          suggestion: 'Verifica el ID de la lista en Apollo: app.apollo.io/#/lists/',
          filter_ignored: true,
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      let allPeople: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let detectedListName = listCheck.name || 'Lista Apollo M&A';
      let totalEntries = listCheck.total || 0;
      
      // Determine correct filter based on list type
      const listType = listCheck.listType || '';
      const isLabel = listType.includes('label') || listType === 'tag';
      console.log(`[MNA Apollo] List type detected: "${listType}", using ${isLabel ? 'label_ids' : 'contact_list_ids'}`);
      
      do {
        console.log(`[MNA Apollo] Fetching page ${currentPage} of ${totalPages}...`);
        
        const requestBody: Record<string, unknown> = {
          page: currentPage,
          per_page: 100,
        };
        
        if (isLabel) {
          requestBody.label_ids = [list_id];
        } else {
          requestBody.contact_list_ids = [list_id];
        }
        
        const response = await fetch('https://api.apollo.io/v1/contacts/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': APOLLO_API_KEY!,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[MNA Apollo] List fetch error:', response.status, errorText);
          throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (currentPage === 1) {
          totalEntries = data.pagination?.total_entries || 0;
          totalPages = Math.min(Math.ceil(totalEntries / 100), max_pages);
          
          const betterListName = data.contacts?.[0]?.contact_list_names?.[0];
          if (betterListName) {
            detectedListName = betterListName;
          }
          
          console.log(`[MNA Apollo] Total entries: ${totalEntries}, Pages: ${totalPages}, List: ${detectedListName}`);
        }
        
        const contacts = data.contacts || [];
        const mappedContacts = contacts.map((contact: any) => ({
          id: contact.id,
          first_name: contact.first_name,
          last_name: contact.last_name,
          name: contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim(),
          title: contact.title,
          email: contact.email,
          email_status: contact.email_status,
          linkedin_url: contact.linkedin_url,
          city: contact.city,
          state: contact.state,
          country: contact.country,
          organization: contact.organization ? {
            id: contact.organization.id,
            name: contact.organization.name,
            website_url: contact.organization.website_url,
            linkedin_url: contact.organization.linkedin_url,
            primary_domain: contact.organization.primary_domain,
            industry: contact.organization.industry,
            estimated_num_employees: contact.organization.estimated_num_employees,
            city: contact.organization.city,
            country: contact.organization.country,
          } : undefined,
          phone_numbers: contact.phone_numbers,
          seniority: contact.seniority,
          contact_list_names: contact.contact_list_names,
        }));
        
        allPeople.push(...mappedContacts);
        console.log(`[MNA Apollo] Page ${currentPage}: ${mappedContacts.length} contacts, total: ${allPeople.length}`);
        
        currentPage++;
        
        if (currentPage <= totalPages) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } while (currentPage <= totalPages);
      
      // Deduplicate
      const uniqueMap = new Map<string, any>();
      allPeople.forEach((person: any) => {
        if (person.id && !uniqueMap.has(person.id)) {
          uniqueMap.set(person.id, person);
        }
      });
      const dedupedPeople = Array.from(uniqueMap.values());
      
      const validPeople = dedupedPeople.filter((p: any) => 
        p.name && p.name !== '(No Name)' && p.name.trim() !== ''
      );
      
      console.log(`[MNA Apollo] Deduped: ${dedupedPeople.length} unique from ${allPeople.length} total`);
      console.log(`[MNA Apollo] Final: ${validPeople.length} valid people`);

      return new Response(JSON.stringify({
        success: true,
        people: validPeople,
        pagination: {
          total_entries: totalEntries,
          pages_fetched: totalPages,
          filtered_count: validPeople.length,
        },
        list_name: detectedListName,
        list_type: 'contacts',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: SEARCH ORGANIZATIONS FROM LIST =============
    if (action === 'search_organizations_from_list') {
      console.log('🚀 [MNA Apollo] ACTION: search_organizations_from_list STARTING');
      
      const { list_id, max_pages = 20 } = params;
      
      if (!list_id) {
        throw new Error('list_id is required');
      }

      console.log('🔍 [MNA Apollo] Fetching organizations from list:', list_id);
      
      let allOrganizations: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let detectedListName = 'Lista Apollo Empresas M&A';
      let totalEntries = 0;
      
      do {
        console.log(`[MNA Apollo] Fetching organizations page ${currentPage}...`);
        
        const requestBody = {
          account_list_ids: [list_id],
          page: currentPage,
          per_page: 100,
        };
        
        const response = await fetch('https://api.apollo.io/v1/accounts/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache',
            'X-Api-Key': APOLLO_API_KEY!,
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('[MNA Apollo] Organization list error:', response.status, errorText);
          throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (currentPage === 1) {
          totalEntries = data.pagination?.total_entries || 0;
          totalPages = Math.min(Math.ceil(totalEntries / 100), max_pages);
          detectedListName = 'Lista Apollo Empresas M&A';
          console.log(`[MNA Apollo] Total entries: ${totalEntries}, Pages: ${totalPages}`);
          
          // Log large lists but don't block them - users may have legitimately large lists
          if (totalEntries > 10000) {
            console.log(`[MNA Apollo] Large list detected: ${totalEntries} entries. Proceeding with import (max ${max_pages} pages = ${max_pages * 100} results).`);
          }
        }
        
        const accounts = data.accounts || [];
        const mappedOrganizations = accounts.map((account: any) => ({
          id: account.id,
          first_name: account.name,
          last_name: '',
          name: account.name,
          title: account.industry || 'Organization',
          email: null,
          linkedin_url: account.linkedin_url,
          city: account.city,
          country: account.country,
          organization: {
            id: account.id,
            name: account.name,
            website_url: account.website_url || (account.primary_domain ? `https://${account.primary_domain}` : null),
            linkedin_url: account.linkedin_url,
            primary_domain: account.primary_domain,
            industry: account.industry,
            estimated_num_employees: account.estimated_num_employees,
            city: account.city,
            country: account.country,
          },
          _is_organization: true,
          // Extra org fields for boutique creation
          _org_description: account.short_description || account.seo_description,
          _org_keywords: account.keywords,
          _org_founded_year: account.founded_year,
          _org_technologies: account.technologies,
          _org_annual_revenue: account.annual_revenue_printed,
        }));
        
        allOrganizations.push(...mappedOrganizations);
        console.log(`[MNA Apollo] Page ${currentPage}: ${mappedOrganizations.length} orgs, total: ${allOrganizations.length}`);
        
        currentPage++;
        
        if (currentPage <= totalPages) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      } while (currentPage <= totalPages);
      
      // Deduplicate
      const uniqueMap = new Map<string, any>();
      allOrganizations.forEach((org: any) => {
        if (org.id && !uniqueMap.has(org.id)) {
          uniqueMap.set(org.id, org);
        }
      });
      const dedupedOrgs = Array.from(uniqueMap.values());
      
      const validOrgs = dedupedOrgs.filter((o: any) => 
        o.name && o.name !== '(No Name)' && o.name.trim() !== ''
      );
      
      console.log(`[MNA Apollo] Deduped: ${dedupedOrgs.length} unique from ${allOrganizations.length} total`);
      console.log(`[MNA Apollo] Final: ${validOrgs.length} valid organizations`);

      return new Response(JSON.stringify({
        success: true,
        people: validOrgs,
        pagination: {
          total_entries: totalEntries,
          pages_fetched: totalPages,
          filtered_count: validOrgs.length,
        },
        list_name: detectedListName,
        list_type: 'organizations',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: IMPORT BATCH (PEOPLE) =============
    if (action === 'import_batch') {
      const { import_id, people, enrich = false, batch_index = 0, batch_size = 50 } = params;
      
      console.log(`[MNA Apollo] IMPORT_BATCH: batch ${batch_index}, size ${batch_size}, total: ${people.length}`);
      
      const startIdx = batch_index * batch_size;
      const endIdx = Math.min(startIdx + batch_size, people.length);
      const batchPeople = people.slice(startIdx, endIdx);
      const totalBatches = Math.ceil(people.length / batch_size);
      
      console.log(`[MNA Apollo] Processing batch ${batch_index + 1}/${totalBatches}: ${batchPeople.length} items`);

      if (batch_index === 0) {
        await supabase
          .from('mna_apollo_imports')
          .update({ status: 'importing', started_at: new Date().toISOString() })
          .eq('id', import_id);
      }

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        details: [] as any[],
      };

      for (const person of batchPeople) {
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

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const isLastBatch = endIdx >= people.length;
      
      const { data: currentImport } = await supabase
        .from('mna_apollo_imports')
        .select('imported_count, updated_count, skipped_count, error_count')
        .eq('id', import_id)
        .single();
      
      const newImportedCount = (currentImport?.imported_count || 0) + results.imported;
      const newUpdatedCount = (currentImport?.updated_count || 0) + results.updated;
      const newSkippedCount = (currentImport?.skipped_count || 0) + results.skipped;
      const newErrorCount = (currentImport?.error_count || 0) + results.errors;
      
      const updateData: any = {
        imported_count: newImportedCount,
        updated_count: newUpdatedCount,
        skipped_count: newSkippedCount,
        error_count: newErrorCount,
      };
      
      if (isLastBatch) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
        updateData.credits_used = enrich ? people.length : 0;
      }
      
      await supabase
        .from('mna_apollo_imports')
        .update(updateData)
        .eq('id', import_id);

      console.log(`[MNA Apollo] Batch ${batch_index + 1}/${totalBatches} complete`);

      return new Response(JSON.stringify({
        success: true,
        batch_index,
        total_batches: totalBatches,
        is_last_batch: isLastBatch,
        batch_results: results,
        accumulated: {
          imported: newImportedCount,
          updated: newUpdatedCount,
          skipped: newSkippedCount,
          errors: newErrorCount,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: IMPORT ORGANIZATIONS BATCH =============
    if (action === 'import_organizations_batch') {
      const { import_id, people, batch_index = 0, batch_size = 50 } = params;
      
      console.log(`[MNA Apollo] IMPORT_ORGANIZATIONS_BATCH: batch ${batch_index}`);
      
      const startIdx = batch_index * batch_size;
      const endIdx = Math.min(startIdx + batch_size, people.length);
      const batchOrgs = people.slice(startIdx, endIdx);
      const totalBatches = Math.ceil(people.length / batch_size);
      
      if (batch_index === 0) {
        await supabase
          .from('mna_apollo_imports')
          .update({ status: 'importing', started_at: new Date().toISOString() })
          .eq('id', import_id);
      }

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        details: [] as any[],
      };

      for (const org of batchOrgs) {
        const result = await importOrganization(supabase, org);
        
        if (result.success) {
          if (result.action === 'created') results.imported++;
          else if (result.action === 'updated') results.updated++;
          else results.skipped++;
        } else {
          results.errors++;
        }
        
        results.details.push({
          name: org.name,
          ...result,
        });

        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const isLastBatch = endIdx >= people.length;
      
      const { data: currentImport } = await supabase
        .from('mna_apollo_imports')
        .select('imported_count, updated_count, skipped_count, error_count')
        .eq('id', import_id)
        .single();
      
      const newImportedCount = (currentImport?.imported_count || 0) + results.imported;
      const newUpdatedCount = (currentImport?.updated_count || 0) + results.updated;
      const newSkippedCount = (currentImport?.skipped_count || 0) + results.skipped;
      const newErrorCount = (currentImport?.error_count || 0) + results.errors;
      
      const updateData: any = {
        imported_count: newImportedCount,
        updated_count: newUpdatedCount,
        skipped_count: newSkippedCount,
        error_count: newErrorCount,
      };
      
      if (isLastBatch) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
      }
      
      await supabase
        .from('mna_apollo_imports')
        .update(updateData)
        .eq('id', import_id);

      return new Response(JSON.stringify({
        success: true,
        batch_index,
        total_batches: totalBatches,
        is_last_batch: isLastBatch,
        batch_results: results,
        accumulated: {
          imported: newImportedCount,
          updated: newUpdatedCount,
          skipped: newSkippedCount,
          errors: newErrorCount,
        },
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: DELETE IMPORT =============
    if (action === 'delete_import') {
      const { import_id } = params;
      
      if (!import_id) {
        throw new Error('import_id is required');
      }

      const { data: existingImport, error: fetchError } = await supabase
        .from('mna_apollo_imports')
        .select('id, status')
        .eq('id', import_id)
        .single();

      if (fetchError) {
        throw new Error(`Import not found: ${fetchError.message}`);
      }

      const deletableStatuses = ['pending', 'importing', 'failed', 'cancelled', 'searching', 'previewing'];
      if (!deletableStatuses.includes(existingImport.status)) {
        throw new Error('Solo se pueden eliminar importaciones incompletas o fallidas');
      }

      const { error: deleteError } = await supabase
        .from('mna_apollo_imports')
        .delete()
        .eq('id', import_id);

      if (deleteError) {
        throw new Error(`Failed to delete: ${deleteError.message}`);
      }

      return new Response(JSON.stringify({
        success: true,
        message: 'Importación eliminada',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (error) {
    console.error('[mna-apollo-search-import] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
