import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PESectorTaxonomy {
  id: string;
  name_en: string;
  name_es: string;
  description: string | null;
  keywords: string[];
  parent_sector: string | null;
  display_order: number;
  is_active: boolean;
}

interface ClassifySectorResult {
  success: boolean;
  company_name: string;
  sector_pe: string;
  confidence: number;
  keywords: string[];
  reasoning: string;
}

export const usePESectors = () => {
  // Fetch taxonomy from database
  const { data: sectors, isLoading } = useQuery({
    queryKey: ['pe-sector-taxonomy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pe_sector_taxonomy')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      return data as PESectorTaxonomy[];
    },
    staleTime: 1000 * 60 * 60, // 1 hour - taxonomy rarely changes
  });

  return { sectors, isLoading };
};

export const useClassifySectorPE = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      company_name: string;
      description?: string;
      existing_sector?: string;
      additional_info?: string;
    }): Promise<ClassifySectorResult> => {
      const { data, error } = await supabase.functions.invoke('classify-sector-pe', {
        body: params,
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Classification failed');
      
      return data;
    },
    onError: (error) => {
      console.error('Sector classification error:', error);
      toast.error('Error al clasificar el sector');
    },
  });
};

export const useUpdateOperationSectorPE = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { operationId: string; sectorPE: string }) => {
      const { error } = await supabase
        .from('company_operations')
        .update({ sector_pe: params.sectorPE })
        .eq('id', params.operationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-operations'] });
      toast.success('Sector PE actualizado');
    },
    onError: (error) => {
      console.error('Error updating sector PE:', error);
      toast.error('Error al actualizar el sector');
    },
  });
};

export const useBulkClassifySectors = () => {
  const classifyMutation = useClassifySectorPE();
  const updateMutation = useUpdateOperationSectorPE();

  const classifyAndUpdate = async (operations: Array<{ id: string; company_name: string; sector?: string; description?: string }>) => {
    const results = [];
    
    for (const op of operations) {
      try {
        const classification = await classifyMutation.mutateAsync({
          company_name: op.company_name,
          description: op.description,
          existing_sector: op.sector,
        });

        await updateMutation.mutateAsync({
          operationId: op.id,
          sectorPE: classification.sector_pe,
        });

        results.push({
          id: op.id,
          success: true,
          sector_pe: classification.sector_pe,
          confidence: classification.confidence,
        });
      } catch (error) {
        results.push({
          id: op.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  };

  return { classifyAndUpdate, isLoading: classifyMutation.isPending || updateMutation.isPending };
};
