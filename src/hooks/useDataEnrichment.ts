import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnrichmentStats {
  entity_type: string;
  total: number;
  enriched: number;
  pending_with_website: number;
  pending_no_website: number;
}

export function useEnrichmentStats() {
  return useQuery({
    queryKey: ['enrichment-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('v_enrichment_stats')
        .select('*');
      
      if (error) throw error;
      return data as EnrichmentStats[];
    },
  });
}

export function useEnrichPortfolio() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ company_ids, limit, force }: { company_ids?: string[]; limit?: number; force?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('cr-portfolio-enrich', {
        body: { company_ids, limit: limit || 10, force: force || false },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrichment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cr-portfolio'] });
      toast.success(data.message || 'Empresas enriquecidas correctamente');
    },
    onError: (error) => {
      console.error('Error enriching portfolio:', error);
      toast.error('Error al enriquecer empresas');
    },
  });
}

export function useEnrichFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ fund_ids, limit, force }: { fund_ids?: string[]; limit?: number; force?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('cr-funds-enrich', {
        body: { fund_ids, limit: limit || 10, force: force || false },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrichment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cr-funds'] });
      toast.success(data.message || 'Fondos enriquecidos correctamente');
    },
    onError: (error) => {
      console.error('Error enriching funds:', error);
      toast.error('Error al enriquecer fondos');
    },
  });
}

export function useEnrichLeads() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ lead_ids, limit, force }: { lead_ids?: string[]; limit?: number; force?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('leads-company-enrich', {
        body: { lead_ids, limit: limit || 10, force: force || false },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrichment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['acquisition-leads'] });
      toast.success(data.message || 'Leads enriquecidos correctamente');
    },
    onError: (error) => {
      console.error('Error enriching leads:', error);
      toast.error('Error al enriquecer leads');
    },
  });
}

export function useEnrichPeople() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ person_ids, limit, force }: { person_ids?: string[]; limit?: number; force?: boolean }) => {
      const { data, error } = await supabase.functions.invoke('cr-people-enrich', {
        body: { person_ids, limit: limit || 10, force: force || false },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['enrichment-stats'] });
      queryClient.invalidateQueries({ queryKey: ['cr-people'] });
      toast.success(data.message || 'Contactos enriquecidos correctamente');
    },
    onError: (error) => {
      console.error('Error enriching people:', error);
      toast.error('Error al enriquecer contactos');
    },
  });
}
