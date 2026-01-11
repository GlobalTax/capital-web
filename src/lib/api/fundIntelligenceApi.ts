import { supabase } from '@/integrations/supabase/client';

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

export async function fetchSFFunds(): Promise<FundForIntelligence[]> {
  const { data, error } = await supabase
    .from('sf_funds')
    .select('id, name, website, last_scraped_at')
    .order('name');
  
  if (error) {
    console.error('Error fetching SF funds:', error);
    throw error;
  }
  
  return (data || []).map((f) => ({
    id: f.id,
    name: f.name,
    website: f.website,
    last_scraped_at: f.last_scraped_at,
    scrape_data: null,
  }));
}

export async function fetchCRFunds(): Promise<FundForIntelligence[]> {
  const { data, error } = await supabase
    .from('cr_funds')
    .select('id, name, website, last_scraped_at')
    .eq('is_deleted', false)
    .order('name');
  
  if (error) {
    console.error('Error fetching CR funds:', error);
    throw error;
  }
  
  return (data || []).map((f) => ({
    id: f.id,
    name: f.name,
    website: f.website,
    last_scraped_at: f.last_scraped_at,
    scrape_data: null,
  }));
}

export async function fetchFundNews(): Promise<FundNews[]> {
  const { data, error } = await supabase
    .from('fund_news')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);
  
  if (error) {
    console.error('Error fetching fund news:', error);
    throw error;
  }
  
  return (data || []) as FundNews[];
}

export async function scrapeFundWebsite(fundId: string, fundType: 'sf' | 'cr') {
  const { data, error } = await supabase.functions.invoke('fund-scrape-website', {
    body: { fund_id: fundId, fund_type: fundType },
  });

  if (error) {
    throw new Error(error.message || 'Scrape failed');
  }
  
  if (!data?.success) {
    throw new Error(data?.error || 'Scrape failed');
  }
  
  return data;
}

export async function searchFundNews(fundId: string, fundType: 'sf' | 'cr') {
  const { data, error } = await supabase.functions.invoke('fund-search-news', {
    body: { fund_id: fundId, fund_type: fundType },
  });

  if (error) {
    throw new Error(error.message || 'Search failed');
  }
  
  if (!data?.success) {
    throw new Error(data?.error || 'Search failed');
  }
  
  return data;
}

export async function markNewsAsProcessed(newsId: string) {
  const { error } = await supabase
    .from('fund_news')
    .update({ is_processed: true })
    .eq('id', newsId);
  
  if (error) {
    throw error;
  }
}

export async function deleteFundNews(newsId: string) {
  const { error } = await supabase
    .from('fund_news')
    .delete()
    .eq('id', newsId);
  
  if (error) {
    throw error;
  }
}
