import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnrichmentResult {
  description?: string;
  sector_focus?: string[];
  search_keywords?: string[];
  key_highlights?: string[];
  investment_thesis?: string;
  buyer_type_suggestion?: string;
  geography_inferred?: string[];
  estimated_revenue?: string;
  acquisition_history?: string[];
}

export interface EnrichResponse {
  success: boolean;
  error?: string;
  enriched_data?: EnrichmentResult;
  current_data?: Record<string, any>;
  fields_updated?: string[];
  message?: string;
  source_url?: string;
  preview?: boolean;
}

export function useEnrichCorporateBuyer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      buyerId, 
      force = false,
      previewOnly = false 
    }: { 
      buyerId: string; 
      force?: boolean;
      previewOnly?: boolean;
    }): Promise<EnrichResponse> => {
      const { data, error } = await supabase.functions.invoke<EnrichResponse>(
        'corporate-buyer-enrich',
        { 
          body: { 
            buyer_id: buyerId, 
            force,
            preview_only: previewOnly 
          } 
        }
      );

      if (error) {
        throw new Error(error.message || 'Error al enriquecer el perfil');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Error desconocido');
      }

      return data;
    },
    onSuccess: (data) => {
      if (!data.preview) {
        queryClient.invalidateQueries({ queryKey: ['corporate-buyer'] });
        queryClient.invalidateQueries({ queryKey: ['corporate-buyers'] });
      }
    },
    onError: (error) => {
      console.error('Error enriching buyer:', error);
      toast.error(error instanceof Error ? error.message : 'Error al enriquecer el perfil');
    }
  });
}

export function useApplyEnrichment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      buyerId, 
      force = true 
    }: { 
      buyerId: string; 
      force?: boolean;
    }): Promise<EnrichResponse> => {
      const { data, error } = await supabase.functions.invoke<EnrichResponse>(
        'corporate-buyer-enrich',
        { 
          body: { 
            buyer_id: buyerId, 
            force,
            preview_only: false 
          } 
        }
      );

      if (error) {
        throw new Error(error.message || 'Error al aplicar cambios');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Error desconocido');
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-buyer'] });
      queryClient.invalidateQueries({ queryKey: ['corporate-buyers'] });
      toast.success(data.message || 'Perfil enriquecido correctamente');
    },
    onError: (error) => {
      console.error('Error applying enrichment:', error);
      toast.error(error instanceof Error ? error.message : 'Error al aplicar cambios');
    }
  });
}
