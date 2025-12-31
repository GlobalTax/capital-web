import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';

export interface LeadSearchResult {
  id: string;
  type: string;
  full_name: string;
  email: string;
  company?: string;
  created_at: string;
}

const LEAD_TYPE_LABELS: Record<string, string> = {
  valuation: 'Valoración',
  contact: 'Contacto',
  general_contact: 'Contacto General',
  investor: 'Inversor',
  sell: 'Venta',
  acquisition: 'Adquisición',
  legal: 'Legal',
  accountex: 'Accountex',
  collaborator: 'Colaborador',
};

export const getLeadTypeLabel = (type: string) => LEAD_TYPE_LABELS[type] || type;

export const useLeadSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedTerm, setDebouncedTerm] = useState('');

  // Debounce search term
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setDebouncedTerm(term);
    }, 300),
    []
  );

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    debouncedSearch(term);
  };

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['lead-search', debouncedTerm],
    queryFn: async (): Promise<LeadSearchResult[]> => {
      if (!debouncedTerm || debouncedTerm.length < 2) return [];

      const searchPattern = `%${debouncedTerm}%`;
      const allResults: LeadSearchResult[] = [];

      // Search company_valuations
      const { data: valuations } = await supabase
        .from('company_valuations')
        .select('id, contact_name, email, company_name, created_at')
        .or(`contact_name.ilike.${searchPattern},email.ilike.${searchPattern},company_name.ilike.${searchPattern}`)
        .limit(5);

      valuations?.forEach(v => {
        allResults.push({
          id: v.id,
          type: 'valuation',
          full_name: v.contact_name,
          email: v.email,
          company: v.company_name,
          created_at: v.created_at,
        });
      });

      // Search contact_leads
      const { data: contacts } = await supabase
        .from('contact_leads')
        .select('id, full_name, email, company, created_at')
        .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern},company.ilike.${searchPattern}`)
        .limit(5);

      contacts?.forEach(c => {
        allResults.push({
          id: c.id,
          type: 'contact',
          full_name: c.full_name,
          email: c.email,
          company: c.company || undefined,
          created_at: c.created_at,
        });
      });

      // Search investor_leads
      const { data: investors } = await supabase
        .from('investor_leads')
        .select('id, full_name, email, company, created_at')
        .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern},company.ilike.${searchPattern}`)
        .limit(5);

      investors?.forEach(i => {
        allResults.push({
          id: i.id,
          type: 'investor',
          full_name: i.full_name,
          email: i.email,
          company: i.company || undefined,
          created_at: i.created_at,
        });
      });

      // Search acquisition_leads
      const { data: acquisitions } = await supabase
        .from('acquisition_leads')
        .select('id, full_name, email, company, created_at')
        .or(`full_name.ilike.${searchPattern},email.ilike.${searchPattern},company.ilike.${searchPattern}`)
        .limit(5);

      acquisitions?.forEach(a => {
        allResults.push({
          id: a.id,
          type: 'acquisition',
          full_name: a.full_name,
          email: a.email,
          company: a.company,
          created_at: a.created_at,
        });
      });

      // Sort by created_at desc
      return allResults.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    },
    enabled: debouncedTerm.length >= 2,
  });

  return {
    searchTerm,
    setSearchTerm: handleSearch,
    results,
    isLoading,
  };
};
