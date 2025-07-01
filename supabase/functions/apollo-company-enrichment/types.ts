
export interface CompanyEnrichmentRequest {
  company_domain: string;
}

export interface ApolloAPIResponse {
  organizations?: Array<{
    id: string;
    name: string;
    website_url: string;
    primary_domain: string;
    industry: string;
    keywords: string[];
    estimated_num_employees: number;
    founded_year: number;
    phone: string;
    linkedin_url: string;
    facebook_url: string;
    twitter_url: string;
    primary_phone: {
      number: string;
    };
    languages: string[];
    alexa_ranking: number;
    publicly_traded_symbol: string;
    publicly_traded_exchange: string;
    logo_url: string;
    crunchbase_url: string;
    owned_by_organization_id: string;
    suborganizations: Array<any>;
    num_suborganizations: number;
    seo_description: string;
    short_description: string;
    annual_revenue: number;
    total_funding: number;
    latest_funding_round_date: string;
    latest_funding_stage: string;
    funding_events: Array<any>;
    technology_names: string[];
    current_technologies: Array<{
      uid: string;
      name: string;
      category: string;
    }>;
    account_id: string;
    organization_raw_address: string;
    organization_city: string;
    organization_state: string;
    organization_country: string;
    organization_street_address: string;
    hubspot_id: string;
    salesforce_id: string;
    crm_owner_id: string;
    crm_record_url: string;
    num_contacts: number;
  }>;
}
