export interface FundNews {
  id: string;
  fund_id: string;
  fund_type: 'sf' | 'cr';
  title: string;
  url: string;
  source_name: string | null;
  content_preview: string | null;
  news_date: string | null;
  news_type: string | null;
  relevance_score: number | null;
  ai_summary: string | null;
  is_processed: boolean;
  is_material_change: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface FundForIntelligence {
  id: string;
  name: string;
  website: string | null;
  last_scraped_at: string | null;
  scrape_data: Record<string, unknown> | null;
}

type FundRow = {
  id: string;
  name: string;
  website: string | null;
  last_scraped_at: string | null;
};

const SUPABASE_URL = 'https://fwhqtzkkvnjkazhaficj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aHF0emtrdm5qa2F6aGFmaWNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4Mjc5NTMsImV4cCI6MjA2NTQwMzk1M30.Qhb3pRgx3HIoLSjeIulRHorgzw-eqL3WwXhpncHMF7I';

async function restQuery<T>(table: string, params: string): Promise<T[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const response = await fetch(url, {
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Query failed: ${response.statusText}`);
  }
  
  return response.json();
}

async function restMutate(table: string, method: 'POST' | 'PATCH' | 'DELETE', params: string, body?: object) {
  const url = `${SUPABASE_URL}/rest/v1/${table}?${params}`;
  const response = await fetch(url, {
    method,
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  
  if (!response.ok) {
    throw new Error(`Mutation failed: ${response.statusText}`);
  }
}

export async function fetchSFFunds(): Promise<FundForIntelligence[]> {
  // sf_funds does NOT have is_deleted column
  const rows = await restQuery<FundRow>(
    'sf_funds',
    'select=id,name,website,last_scraped_at&order=name'
  );
  
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    website: f.website,
    last_scraped_at: f.last_scraped_at,
    scrape_data: null,
  }));
}

export async function fetchCRFunds(): Promise<FundForIntelligence[]> {
  const rows = await restQuery<FundRow>(
    'cr_funds',
    'select=id,name,website,last_scraped_at&is_deleted=eq.false&order=name'
  );
  
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    website: f.website,
    last_scraped_at: f.last_scraped_at,
    scrape_data: null,
  }));
}

export async function fetchFundNews(): Promise<FundNews[]> {
  return restQuery<FundNews>(
    'fund_news',
    'select=*&order=created_at.desc&limit=100'
  );
}

export async function scrapeFundWebsite(fundId: string, fundType: 'sf' | 'cr') {
  const url = `${SUPABASE_URL}/functions/v1/fund-scrape-website`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fund_id: fundId, fund_type: fundType }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Scrape failed');
  }
  return data;
}

export async function searchFundNews(fundId: string, fundType: 'sf' | 'cr') {
  const url = `${SUPABASE_URL}/functions/v1/fund-search-news`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fund_id: fundId, fund_type: fundType }),
  });

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Search failed');
  }
  return data;
}

export async function markNewsAsProcessed(newsId: string) {
  await restMutate('fund_news', 'PATCH', `id=eq.${newsId}`, { is_processed: true });
}

export async function deleteFundNews(newsId: string) {
  await restMutate('fund_news', 'DELETE', `id=eq.${newsId}`);
}
