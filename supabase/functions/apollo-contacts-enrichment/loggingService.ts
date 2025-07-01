
export async function logOperationStart(supabaseClient: any, company_domain: string, apollo_org_id?: string) {
  await supabaseClient.from('integration_logs').insert({
    integration_type: 'apollo',
    operation: 'enrich_contacts',
    company_domain,
    status: 'pending',
    data_payload: { domain: company_domain, apollo_org_id }
  });
}

export async function logOperationSuccess(supabaseClient: any, company_domain: string, contactsCount: number, decisionMakersCount: number, organizationId: string, executionTime: number) {
  await supabaseClient.from('integration_logs').insert({
    integration_type: 'apollo',
    operation: 'enrich_contacts',
    company_domain,
    status: 'success',
    data_payload: { 
      domain: company_domain,
      contacts_found: contactsCount,
      decision_makers: decisionMakersCount,
      apollo_org_id: organizationId
    },
    execution_time_ms: executionTime
  });
}

export async function logOperationError(supabaseClient: any, errorMessage: string) {
  await supabaseClient.from('integration_logs').insert({
    integration_type: 'apollo',
    operation: 'enrich_contacts',
    status: 'error',
    error_message: errorMessage,
    data_payload: { error: errorMessage }
  });
}
