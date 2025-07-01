
export async function saveCompanyToDatabase(supabaseClient: any, companyData: any) {
  const { data: savedCompany, error: companyError } = await supabaseClient
    .from('apollo_companies')
    .upsert(companyData, {
      onConflict: 'company_domain'
    })
    .select()
    .single();

  if (companyError) {
    throw companyError;
  }

  return savedCompany;
}
