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

// Map roles specific to Capital Riesgo (PE/VC)
function mapRoleFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Managing Partner / GP
  if (titleLower.includes('managing partner') || 
      titleLower.includes('general partner') ||
      titleLower.includes(' gp ') ||
      titleLower === 'gp') {
    return 'managing_partner';
  }
  
  // Partner
  if (titleLower.includes('partner') || 
      titleLower.includes('socio')) {
    return 'partner';
  }
  
  // Principal / Investment Director
  if (titleLower.includes('principal') || 
      titleLower.includes('investment director') ||
      titleLower.includes('director de inversión') ||
      titleLower.includes('director inversiones')) {
    return 'principal';
  }
  
  // Director / VP
  if (titleLower.includes('director') || 
      titleLower.includes('vp ') ||
      titleLower.includes('vice president')) {
    return 'director';
  }
  
  // Operating Partner
  if (titleLower.includes('operating partner') || 
      titleLower.includes('portfolio operations')) {
    return 'operating_partner';
  }
  
  // Associate
  if (titleLower.includes('associate') || 
      titleLower.includes('investment associate') ||
      titleLower.includes('asociado')) {
    return 'associate';
  }
  
  // Analyst
  if (titleLower.includes('analyst') || 
      titleLower.includes('analista')) {
    return 'analyst';
  }
  
  // Advisor / Board Member
  if (titleLower.includes('advisor') || 
      titleLower.includes('asesor') ||
      titleLower.includes('board member') ||
      titleLower.includes('consejero')) {
    return 'advisor';
  }
  
  // Default: partner as safe fallback
  return 'partner';
}

// Detect fund type from organization info
// ONLY returns values allowed by cr_funds_fund_type_check constraint:
// 'private_equity', 'venture_capital', 'growth_equity', 'family_office', 'corporate', 'fund_of_funds'
function detectFundType(org: ApolloPersonResult['organization']): string {
  if (!org) return 'private_equity';
  
  const name = (org.name || '').toLowerCase();
  const industry = (org.industry || '').toLowerCase();
  
  if (name.includes('venture') || industry.includes('venture capital')) {
    return 'venture_capital';
  }
  if (name.includes('growth') || industry.includes('growth equity')) {
    return 'growth_equity';
  }
  if (name.includes('family office')) {
    return 'family_office';
  }
  if (name.includes('fund of funds') || name.includes('fof')) {
    return 'fund_of_funds';
  }
  if (name.includes('corporate venture') || name.includes('cvc')) {
    return 'corporate';
  }
  
  // All other types (buyout, infrastructure, real estate, debt, etc.) default to private_equity
  return 'private_equity';
}

function extractLocation(person: ApolloPersonResult): string | null {
  const parts = [];
  if (person.city) parts.push(person.city);
  if (person.country) parts.push(person.country);
  return parts.length > 0 ? parts.join(', ') : null;
}

async function searchPeopleInApollo(criteria: SearchCriteria): Promise<{ people: ApolloPersonResult[]; pagination: any }> {
  console.log('[CR Apollo] Searching with criteria:', JSON.stringify(criteria));
  
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
    console.error('[CR Apollo] Search error:', response.status, errorText);
    throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('[CR Apollo] Found', data.people?.length || 0, 'people, pagination:', data.pagination);
  
  return {
    people: data.people || [],
    pagination: data.pagination || {},
  };
}

async function enrichPersonEmail(person: ApolloPersonResult): Promise<ApolloPersonResult | null> {
  if (person.email && person.email_status === 'verified') {
    return person;
  }
  
  console.log('[CR Apollo] Enriching person:', person.name);
  
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
      console.warn('[CR Apollo] Enrichment failed for', person.name, response.status);
      return person;
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
    console.error('[CR Apollo] Enrichment error for', person.name, error);
    return person;
  }
}

async function findOrCreateFund(
  supabase: ReturnType<typeof createClient>,
  org: ApolloPersonResult['organization']
): Promise<string | null> {
  if (!org?.name) return null;

  // Normalize fund name for consistent matching
  const normalizedName = org.name.trim();
  
  // Search existing fund by exact name match (case-insensitive)
  // Using maybeSingle() instead of single() to avoid errors when no results
  const { data: existing } = await supabase
    .from('cr_funds')
    .select('id')
    .ilike('name', normalizedName)
    .eq('is_deleted', false)
    .limit(1)
    .maybeSingle();

  if (existing) {
    console.log('[CR Import] Found existing fund:', normalizedName, existing.id);
    return existing.id;
  }

  // Also check by website if available
  if (org.website_url) {
    const { data: byWebsite } = await supabase
      .from('cr_funds')
      .select('id')
      .eq('website', org.website_url)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (byWebsite) {
      console.log('[CR Import] Found existing fund by website:', normalizedName, byWebsite.id);
      return byWebsite.id;
    }
  }

  // Create new fund with detected type
  const fundType = detectFundType(org);
  const { data: newFund, error } = await supabase
    .from('cr_funds')
    .insert({
      name: normalizedName,
      website: org.website_url,
      country_base: org.country || 'Spain',
      sector_focus: org.industry ? [org.industry] : [],
      status: 'active',
      fund_type: fundType,
      source_url: org.linkedin_url || 'apollo_import',
    })
    .select('id')
    .single();

  if (error) {
    // If error due to unique constraint, try to find the fund that was just created
    // (handles race condition where another request created it first)
    console.warn('[CR Import] Insert failed, checking for existing fund:', error.message);
    
    const { data: fallback } = await supabase
      .from('cr_funds')
      .select('id')
      .ilike('name', normalizedName)
      .eq('is_deleted', false)
      .limit(1)
      .maybeSingle();
    
    if (fallback) {
      console.log('[CR Import] Found fund after race condition:', normalizedName, fallback.id);
      return fallback.id;
    }
    
    console.error('[CR Import] Error creating fund:', error);
    return null;
  }

  console.log('[CR Import] Created new fund:', normalizedName, newFund.id, 'type:', fundType);
  return newFund.id;
}

async function findExistingPerson(
  supabase: ReturnType<typeof createClient>,
  person: ApolloPersonResult
): Promise<string | null> {
  // Search by LinkedIn URL (most reliable)
  if (person.linkedin_url) {
    const { data } = await supabase
      .from('cr_people')
      .select('id')
      .eq('linkedin_url', person.linkedin_url)
      .limit(1)
      .single();
    
    if (data) return data.id;
  }

  // Search by email
  if (person.email) {
    const { data } = await supabase
      .from('cr_people')
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
    let enrichedPerson = person;
    if (enrich) {
      const enriched = await enrichPersonEmail(person);
      if (enriched) enrichedPerson = enriched;
    }

    const existingId = await findExistingPerson(supabase, enrichedPerson);
    const fundId = await findOrCreateFund(supabase, enrichedPerson.organization);

    // CRITICAL: Skip if no fund_id available (fund creation failed)
    if (!fundId) {
      console.error('[CR Import] Skipping person - no fund_id:', enrichedPerson.name, enrichedPerson.organization?.name);
      return { 
        success: false, 
        action: 'skipped', 
        error: `No se pudo crear/encontrar el fondo: ${enrichedPerson.organization?.name || 'Sin organización'}` 
      };
    }

    const personData = {
      full_name: enrichedPerson.name,
      email: enrichedPerson.email,
      linkedin_url: enrichedPerson.linkedin_url,
      phone: enrichedPerson.phone_numbers?.[0]?.sanitized_number,
      role: mapRoleFromTitle(enrichedPerson.title || ''),
      location: extractLocation(enrichedPerson),
      fund_id: fundId,
      notes: `Importado desde Apollo el ${new Date().toLocaleDateString('es-ES')}. Cargo: ${enrichedPerson.title || 'N/A'}`,
    };

    if (existingId) {
      const { error } = await supabase
        .from('cr_people')
        .update(personData)
        .eq('id', existingId);

      if (error) {
        console.error('[CR Import] Update error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[CR Import] Updated person:', enrichedPerson.name);
      return { success: true, action: 'updated', personId: existingId };
    } else {
      const { data: newPerson, error } = await supabase
        .from('cr_people')
        .insert(personData)
        .select('id')
        .single();

      if (error) {
        console.error('[CR Import] Insert error:', error);
        return { success: false, action: 'skipped', error: error.message };
      }

      console.log('[CR Import] Created person:', enrichedPerson.name);
      return { success: true, action: 'created', personId: newPerson.id };
    }
  } catch (error) {
    console.error('[CR Import] Error importing person:', error);
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

    console.log('[cr-apollo-search-import] Action:', action, 'Params:', JSON.stringify(params));

    // ============= ACTION: SEARCH =============
    if (action === 'search') {
      const { criteria, import_id } = params;
      
      const result = await searchPeopleInApollo(criteria);
      
      if (import_id) {
        await supabase
          .from('cr_apollo_imports')
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
        .from('cr_apollo_imports')
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

    // ============= ACTION: IMPORT BATCH (BATCH PROCESSING - NO TIMEOUT) =============
    if (action === 'import_batch') {
      const { import_id, people, enrich = false, batch_index = 0, batch_size = 50 } = params;
      
      console.log(`[CR Apollo] IMPORT_BATCH: batch ${batch_index}, size ${batch_size}, total people: ${people.length}`);
      
      // Calculate which people belong to this batch
      const startIdx = batch_index * batch_size;
      const endIdx = Math.min(startIdx + batch_size, people.length);
      const batchPeople = people.slice(startIdx, endIdx);
      const totalBatches = Math.ceil(people.length / batch_size);
      
      console.log(`[CR Apollo] Processing batch ${batch_index + 1}/${totalBatches}: people ${startIdx}-${endIdx} (${batchPeople.length} items)`);

      // Mark as importing on first batch
      if (batch_index === 0) {
        await supabase
          .from('cr_apollo_imports')
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

        // Small delay between imports
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      // Check if this is the last batch
      const isLastBatch = endIdx >= people.length;
      
      // Get current counts from database to accumulate
      const { data: currentImport } = await supabase
        .from('cr_apollo_imports')
        .select('imported_count, updated_count, skipped_count, error_count')
        .eq('id', import_id)
        .single();
      
      const newImportedCount = (currentImport?.imported_count || 0) + results.imported;
      const newUpdatedCount = (currentImport?.updated_count || 0) + results.updated;
      const newSkippedCount = (currentImport?.skipped_count || 0) + results.skipped;
      const newErrorCount = (currentImport?.error_count || 0) + results.errors;
      
      // Update import job with accumulated counts
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
        .from('cr_apollo_imports')
        .update(updateData)
        .eq('id', import_id);

      console.log(`[CR Apollo] Batch ${batch_index + 1}/${totalBatches} complete: imported=${results.imported}, updated=${results.updated}`);

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

    // ============= ACTION: IMPORT SELECTED (LEGACY - for small imports) =============
    if (action === 'import_selected') {
      const { import_id, people, enrich = false } = params;
      
      // For small imports (<= 50), process directly. For larger, redirect to batch
      if (people.length > 50) {
        console.log(`[CR Apollo] Large import (${people.length}), use import_batch instead`);
        return new Response(JSON.stringify({
          success: false,
          error: 'Use import_batch for large imports (>50 people)',
          total_people: people.length,
          recommended_batches: Math.ceil(people.length / 50),
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      await supabase
        .from('cr_apollo_imports')
        .update({ status: 'importing', started_at: new Date().toISOString() })
        .eq('id', import_id);

      const results = {
        imported: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        details: [] as any[],
      };

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

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      await supabase
        .from('cr_apollo_imports')
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
        .from('cr_apollo_imports')
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

    // ============= ACTION: DELETE IMPORT =============
    if (action === 'delete_import') {
      console.log('🗑️ [CR Apollo] DELETE IMPORT requested');
      const { import_id } = params;
      
      if (!import_id) {
        throw new Error('import_id is required');
      }

      // Get import to check status
      const { data: existingImport, error: fetchError } = await supabase
        .from('cr_apollo_imports')
        .select('id, status')
        .eq('id', import_id)
        .single();

      if (fetchError) {
        console.error('❌ [CR Apollo] Error fetching import:', fetchError);
        throw new Error(`Import not found: ${fetchError.message}`);
      }

      // Only allow deleting incomplete or failed imports
      const deletableStatuses = ['pending', 'importing', 'failed', 'cancelled', 'searching', 'previewing'];
      if (!deletableStatuses.includes(existingImport.status)) {
        throw new Error('Solo se pueden eliminar importaciones incompletas o fallidas');
      }

      console.log('🗑️ [CR Apollo] Deleting import:', import_id, 'with status:', existingImport.status);

      const { error: deleteError } = await supabase
        .from('cr_apollo_imports')
        .delete()
        .eq('id', import_id);

      if (deleteError) {
        console.error('❌ [CR Apollo] Delete error:', deleteError);
        throw new Error(`Failed to delete: ${deleteError.message}`);
      }

      console.log('✅ [CR Apollo] Import deleted successfully');

      return new Response(JSON.stringify({
        success: true,
        message: 'Importación eliminada',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: SEARCH FROM LIST (WITH AUTO-PAGINATION) =============
    if (action === 'search_from_list') {
      console.log('🚀 [CR Apollo] ACTION: search_from_list STARTING');
      console.log('🚀 [CR Apollo] Params received:', JSON.stringify(params));
      
      const { list_id, max_pages = 20 } = params; // max 20 pages = 2000 contacts
      
      if (!list_id) {
        console.error('❌ [CR Apollo] list_id is missing from params');
        throw new Error('list_id is required');
      }

      console.log('🔍 [CR Apollo] Fetching ALL contacts from list:', list_id, 'max_pages:', max_pages);
      
      let allPeople: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let detectedListName = 'Lista Apollo PE/VC';
      let totalEntries = 0;
      
      // Pagination loop - fetch all pages
      do {
        console.log(`[CR Apollo] Fetching page ${currentPage} of ${totalPages}...`);
        
        // Apollo uses label_ids for saved lists
        const requestBody = {
          label_ids: [list_id],
          page: currentPage,
          per_page: 100, // Always use max per page
        };
        
        console.log(`[CR Apollo] Request body:`, JSON.stringify(requestBody));
        
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
          console.error('[CR Apollo] List fetch error:', response.status, errorText);
          throw new Error(`Apollo API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        // Log raw response for debugging
        console.log(`[CR Apollo] Raw response keys:`, Object.keys(data));
        console.log(`[CR Apollo] Pagination:`, JSON.stringify(data.pagination));
        console.log(`[CR Apollo] Contacts count:`, data.contacts?.length || 0);
        if (data.contacts?.length === 0 && data.people?.length > 0) {
          console.log(`[CR Apollo] NOTE: Found ${data.people.length} in 'people' array instead of 'contacts'`);
        }
        
        // Calculate total pages on first iteration
        if (currentPage === 1) {
          totalEntries = data.pagination?.total_entries || 0;
          totalPages = Math.min(Math.ceil(totalEntries / 100), max_pages);
          
          // Detect list name from first contact
          detectedListName = data.contacts?.[0]?.contact_list_names?.find(
            (name: string) => name.toLowerCase().includes('private equity') || 
                             name.toLowerCase().includes('venture') ||
                             name.toLowerCase().includes('capital')
          ) || data.contacts?.[0]?.contact_list_names?.[0] || 'Lista Apollo PE/VC';
          
          console.log(`[CR Apollo] Total entries: ${totalEntries}, Pages needed: ${totalPages}, List: ${detectedListName}`);
        }
        
        // Map and accumulate contacts
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
        console.log(`[CR Apollo] Page ${currentPage}: Got ${mappedContacts.length} contacts, total so far: ${allPeople.length}`);
        
        currentPage++;
        
        // Small delay between requests to avoid rate limiting
        if (currentPage <= totalPages) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        
      } while (currentPage <= totalPages);
      
      // Deduplicate by ID (Apollo may return same contact in multiple pages)
      const uniqueMap = new Map<string, any>();
      allPeople.forEach((person: any) => {
        if (person.id && !uniqueMap.has(person.id)) {
          uniqueMap.set(person.id, person);
        }
      });
      const dedupedPeople = Array.from(uniqueMap.values());
      
      // Filter invalid entries
      const validPeople = dedupedPeople.filter((p: any) => 
        p.name && p.name !== '(No Name)' && p.name.trim() !== ''
      );
      
      console.log(`[CR Apollo] Deduped: ${dedupedPeople.length} unique from ${allPeople.length} total`);
      console.log(`[CR Apollo] Final: ${validPeople.length} valid people (${totalPages} pages)`);

      return new Response(JSON.stringify({
        success: true,
        people: validPeople,
        pagination: {
          total_entries: totalEntries,
          pages_fetched: totalPages,
          filtered_count: validPeople.length,
          original_count: allPeople.length,
        },
        list_name: detectedListName,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ============= ACTION: PRESETS =============
    if (action === 'get_presets') {
      const presets = [
        {
          id: 'pe_partners_europe',
          name: 'PE Partners Europa',
          description: 'Partners y Managing Partners en Private Equity europeo',
          criteria: {
            person_titles: ['Partner', 'Managing Partner', 'General Partner', 'Principal'],
            person_locations: ['Spain', 'Portugal', 'France', 'Germany', 'Italy', 'United Kingdom'],
            organization_industries: ['private equity', 'investment banking'],
            person_seniorities: ['partner', 'c_suite', 'owner'],
          },
        },
        {
          id: 'vc_partners_spain',
          name: 'VC Partners España',
          description: 'Partners de Venture Capital en España',
          criteria: {
            person_titles: ['Partner', 'Managing Partner', 'Investment Director', 'Principal'],
            person_locations: ['Spain'],
            organization_industries: ['venture capital', 'startup investment'],
            person_seniorities: ['partner', 'c_suite', 'director'],
          },
        },
        {
          id: 'growth_equity_dach',
          name: 'Growth Equity DACH',
          description: 'Profesionales de Growth Equity en Alemania, Austria y Suiza',
          criteria: {
            person_titles: ['Partner', 'Director', 'Principal', 'Investment Manager'],
            person_locations: ['Germany', 'Austria', 'Switzerland'],
            q_keywords: 'growth equity OR growth capital',
            person_seniorities: ['partner', 'director', 'c_suite'],
          },
        },
        {
          id: 'family_offices_europe',
          name: 'Family Offices Europa',
          description: 'Profesionales de inversión en Family Offices europeos',
          criteria: {
            person_titles: ['CIO', 'Investment Director', 'Managing Director', 'Partner'],
            person_locations: ['Spain', 'Portugal', 'France', 'Germany', 'Switzerland'],
            q_keywords: 'family office OR single family office OR multi family office',
            person_seniorities: ['c_suite', 'partner', 'director'],
          },
        },
        {
          id: 'operating_partners',
          name: 'Operating Partners',
          description: 'Operating Partners y Portfolio Operations en PE',
          criteria: {
            person_titles: ['Operating Partner', 'Portfolio Operations', 'Value Creation Director'],
            person_locations: ['Spain', 'Portugal', 'France', 'Germany', 'United Kingdom'],
            organization_industries: ['private equity'],
            person_seniorities: ['partner', 'director'],
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
    console.error('[cr-apollo-search-import] Error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
