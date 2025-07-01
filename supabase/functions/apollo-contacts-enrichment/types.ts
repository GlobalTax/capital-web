
export interface ContactsEnrichmentRequest {
  company_domain: string;
  apollo_org_id?: string;
}

export interface ApolloContactsResponse {
  people?: Array<{
    id: string;
    first_name: string;
    last_name: string;
    name: string;
    linkedin_url: string;
    title: string;
    email: string;
    phone_numbers: Array<{
      raw_number: string;
      sanitized_number: string;
      type: string;
    }>;
    organization_id: string;
    organization: {
      id: string;
      name: string;
      website_url: string;
      primary_domain: string;
    };
    seniority: string;
    departments: string[];
    functions: string[];
    employment_history: Array<any>;
    extrapolated_email_confidence: number;
    headline: string;
    photo_url: string;
    twitter_url: string;
    github_url: string;
    facebook_url: string;
    city: string;
    state: string;
    country: string;
  }>;
}
