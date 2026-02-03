import { supabase } from '@/integrations/supabase/client';

type FirecrawlResponse<T = any> = {
  success: boolean;
  error?: string;
  message?: string;
  data?: T;
};

type ScrapeOptions = {
  formats?: ('markdown' | 'html' | 'rawHtml' | 'links' | 'screenshot' | 'branding' | 'summary')[];
  onlyMainContent?: boolean;
  waitFor?: number;
};

type SearchOptions = {
  limit?: number;
  lang?: string;
  country?: string;
  tbs?: string;
  scrapeOptions?: { formats?: ('markdown' | 'html')[] };
};

export const firecrawlApi = {
  // Scrape a single URL
  async scrape(url: string, options?: ScrapeOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-scrape', {
      body: { url, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Search the web and optionally scrape results
  async search(query: string, options?: SearchOptions): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('firecrawl-search', {
      body: { query, options },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Trigger M&A news fetch
  async fetchMANews(): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('fetch-ma-news', {
      body: {},
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Trigger AI processing of news
  async processNewsWithAI(): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('process-news-ai', {
      body: {},
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },

  // Scrape Dealsuite wanted market with session cookie
  async scrapeDealsuite(
    sessionCookie: string, 
    options?: { dryRun?: boolean; filters?: Record<string, string> }
  ): Promise<FirecrawlResponse> {
    const { data, error } = await supabase.functions.invoke('dealsuite-scrape-wanted', {
      body: { 
        session_cookie: sessionCookie,
        dry_run: options?.dryRun,
        filters: options?.filters
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return data;
  },
};
