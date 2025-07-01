
import { ApolloAPIResponse } from './types.ts';

export async function fetchCompanyFromApollo(apolloApiKey: string, companyDomain: string): Promise<ApolloAPIResponse> {
  const apolloResponse = await fetch('https://api.apollo.io/v1/mixed_companies/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apolloApiKey
    },
    body: JSON.stringify({
      q_organization_domains: companyDomain,
      page: 1,
      per_page: 1
    })
  });

  if (!apolloResponse.ok) {
    const errorText = await apolloResponse.text();
    console.error('Apollo API Error:', errorText);
    throw new Error(`Apollo API error: ${apolloResponse.status} - ${errorText}`);
  }

  return await apolloResponse.json();
}
