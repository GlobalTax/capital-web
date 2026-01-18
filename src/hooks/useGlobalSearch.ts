import { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useTrackSearch } from './useSearchAnalytics';
import debounce from 'lodash/debounce';

export interface GlobalSearchResult {
  id: string;
  type: 'contact' | 'valuation' | 'sf_fund' | 'cr_fund' | 'news' | 'blog';
  title: string;
  subtitle?: string;
  url?: string;
}

interface SearchResults {
  contacts: GlobalSearchResult[];
  valuations: GlobalSearchResult[];
  sfFunds: GlobalSearchResult[];
  crFunds: GlobalSearchResult[];
  news: GlobalSearchResult[];
  blogs: GlobalSearchResult[];
  total: number;
}

export function useGlobalSearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const trackSearch = useTrackSearch();

  const debouncedSetQuery = useMemo(
    () => debounce((q: string) => setDebouncedQuery(q), 300),
    []
  );

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    debouncedSetQuery(value);
  }, [debouncedSetQuery]);

  const { data: results, isLoading } = useQuery({
    queryKey: ['global-search', debouncedQuery],
    queryFn: async (): Promise<SearchResults> => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        return { contacts: [], valuations: [], sfFunds: [], crFunds: [], news: [], blogs: [], total: 0 };
      }

      const searchTerm = `%${debouncedQuery}%`;

      // Execute all searches in parallel
      const [contactsRes, valuationsRes, sfFundsRes, crFundsRes, newsRes, blogsRes] = await Promise.all([
        // Contacts
        supabase
          .from('contact_leads')
          .select('id, full_name, email, company, created_at')
          .or(`full_name.ilike.${searchTerm},email.ilike.${searchTerm},company.ilike.${searchTerm}`)
          .limit(5),

        // Valuations (using correct columns: industry instead of sector)
        supabase
          .from('company_valuations')
          .select('id, company_name, industry, final_valuation, created_at')
          .or(`company_name.ilike.${searchTerm},industry.ilike.${searchTerm}`)
          .limit(5),

        // SF Funds (using correct column: country_base instead of country)
        supabase
          .from('sf_funds')
          .select('id, name, country_base, status, website')
          .or(`name.ilike.${searchTerm},country_base.ilike.${searchTerm}`)
          .limit(5),

        // CR Funds (using correct column: country_base instead of country)
        supabase
          .from('cr_funds')
          .select('id, name, country_base, status, website')
          .or(`name.ilike.${searchTerm},country_base.ilike.${searchTerm}`)
          .limit(5),

        // News (using correct column: source_name instead of source)
        supabase
          .from('fund_news')
          .select('id, title, source_name, news_date, url')
          .ilike('title', searchTerm)
          .limit(5),

        // Blogs
        supabase
          .from('blog_posts')
          .select('id, title, slug, excerpt, published_at')
          .or(`title.ilike.${searchTerm},content.ilike.${searchTerm}`)
          .eq('is_published', true)
          .limit(5),
      ]);

      const contacts: GlobalSearchResult[] = (contactsRes.data || []).map(c => ({
        id: c.id,
        type: 'contact' as const,
        title: c.full_name,
        subtitle: c.company ? `${c.company} • ${c.email}` : c.email,
        url: `/admin/contacts/${c.id}`,
      }));

      const valuations: GlobalSearchResult[] = (valuationsRes.data || []).map(v => ({
        id: v.id,
        type: 'valuation' as const,
        title: v.company_name,
        subtitle: v.industry ? `${v.industry} • ${v.final_valuation ? `€${(v.final_valuation / 1000000).toFixed(1)}M` : 'Sin valoración'}` : undefined,
        url: `/admin/valuations/${v.id}`,
      }));

      const sfFunds: GlobalSearchResult[] = (sfFundsRes.data || []).map(f => ({
        id: f.id,
        type: 'sf_fund' as const,
        title: f.name,
        subtitle: `${f.country_base || 'Sin país'} • ${f.status || 'Sin estado'}`,
        url: `/admin/search-funds/${f.id}`,
      }));

      const crFunds: GlobalSearchResult[] = (crFundsRes.data || []).map(f => ({
        id: f.id,
        type: 'cr_fund' as const,
        title: f.name,
        subtitle: `${f.country_base || 'Sin país'} • ${f.status || 'Sin estado'}`,
        url: `/admin/capital-riesgo/${f.id}`,
      }));

      const news: GlobalSearchResult[] = (newsRes.data || []).map(n => ({
        id: n.id,
        type: 'news' as const,
        title: n.title,
        subtitle: n.source_name || undefined,
        url: n.url || undefined,
      }));

      const blogs: GlobalSearchResult[] = (blogsRes.data || []).map(b => ({
        id: b.id,
        type: 'blog' as const,
        title: b.title,
        subtitle: b.excerpt || undefined,
        url: `/blog/${b.slug}`,
      }));

      const total = contacts.length + valuations.length + sfFunds.length + crFunds.length + news.length + blogs.length;

      // Track search
      if (debouncedQuery.length >= 2) {
        trackSearch.mutate({
          query: debouncedQuery,
          type: 'global',
          source: 'global_search',
          resultsCount: total,
        });
      }

      return { contacts, valuations, sfFunds, crFunds, news, blogs, total };
    },
    enabled: debouncedQuery.length >= 2,
  });

  return {
    query,
    setQuery: handleSearch,
    results: results || { contacts: [], valuations: [], sfFunds: [], crFunds: [], news: [], blogs: [], total: 0 },
    isLoading,
  };
}
