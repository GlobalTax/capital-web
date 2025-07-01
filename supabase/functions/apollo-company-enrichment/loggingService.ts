
export async function logOperationStart(supabaseClient: any, companyDomain: string) {
  await supabaseClient.from('integration_logs').insert({
    integration_type: 'apollo',
    operation: 'enrich_company',
    company_domain: companyDomain,
    status: 'pending',
    data_payload: { domain: companyDomain }
  });
}

export async function logOperationSuccess(supabaseClient: any, companyDomain: string, companyData: any, orgId: string, executionTime: number) {
  await supabaseClient.from('integration_logs').insert({
    integration_type: 'apollo',
    operation: 'enrich_company',
    company_domain: companyDomain,
    status: 'success',
    data_payload: { 
      domain: companyDomain,
      enriched_data: companyData,
      is_target_account: companyData.is_target_account,
      apollo_org_id: orgId
    },
    execution_time_ms: executionTime
  });
}

export async function logOperationError(supabaseClient: any, errorMessage: string) {
  await supabaseClient.from('integration_logs').insert({
    integration_type: 'apollo',
    operation: 'enrich_company',
    company_domain: '',
    status: 'error',
    error_message: errorMessage,
    data_payload: { error: errorMessage }
  });
}
