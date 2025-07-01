
export async function getOrganizationId(supabaseClient: any, company_domain: string, apollo_org_id?: string): Promise<string> {
  let organizationId = apollo_org_id;
  
  if (!organizationId) {
    const { data: companyData } = await supabaseClient
      .from('apollo_companies')
      .select('apollo_id')
      .eq('company_domain', company_domain)
      .single();
    
    organizationId = companyData?.apollo_id;
  }

  if (!organizationId) {
    throw new Error('Apollo organization ID not found. Please enrich company first.');
  }

  return organizationId;
}

export async function getCompanyRecord(supabaseClient: any, company_domain: string) {
  const { data: companyRecord } = await supabaseClient
    .from('apollo_companies')
    .select('id')
    .eq('company_domain', company_domain)
    .single();

  return companyRecord;
}

export async function saveContactsToDatabase(supabaseClient: any, contactsToInsert: any[]) {
  const { data: savedContacts, error: contactsError } = await supabaseClient
    .from('apollo_contacts')
    .upsert(contactsToInsert, {
      onConflict: 'apollo_person_id',
      ignoreDuplicates: false
    })
    .select();

  if (contactsError) {
    throw contactsError;
  }

  return savedContacts;
}

export async function updateCompanyContactCounts(supabaseClient: any, company_domain: string, contactsCount: number, decisionMakersCount: number) {
  await supabaseClient
    .from('apollo_companies')
    .update({
      contacts_count: contactsCount,
      decision_makers_count: decisionMakersCount
    })
    .eq('company_domain', company_domain);
}
