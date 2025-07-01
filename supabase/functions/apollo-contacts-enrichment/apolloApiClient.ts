
import { ApolloContactsResponse } from './types.ts';

export async function fetchContactsFromApollo(apolloApiKey: string, organizationId: string): Promise<ApolloContactsResponse> {
  const apolloResponse = await fetch('https://api.apollo.io/v1/mixed_people/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
      'X-Api-Key': apolloApiKey
    },
    body: JSON.stringify({
      q_organization_ids: [organizationId],
      page: 1,
      per_page: 25,
      person_seniorities: ['senior', 'director', 'vp', 'c_suite', 'founder', 'owner'], // Focus on decision makers
      person_locations: [],
      include_emails: true
    })
  });

  if (!apolloResponse.ok) {
    const errorText = await apolloResponse.text();
    console.error('Apollo Contacts API Error:', errorText);
    throw new Error(`Apollo Contacts API error: ${apolloResponse.status} - ${errorText}`);
  }

  return await apolloResponse.json();
}
