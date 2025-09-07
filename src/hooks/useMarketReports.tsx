import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MarketReport {
  id: string;
  title: string;
  description: string;
  category: string;
  pages: number;
  file_url?: string;
  cover_image_url?: string;
  last_updated: string;
  is_active: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Hook para obtener informes de mercado (públicos)
export const useMarketReports = () => {
  return useQuery({
    queryKey: ['marketReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_reports')
        .select('*')
        .eq('is_active', true)
        .order('last_updated', { ascending: false });
      
      if (error) throw error;
      return data as MarketReport[];
    }
  });
};

// Hook para admin - todos los informes
export const useAdminMarketReports = () => {
  return useQuery({
    queryKey: ['adminMarketReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('market_reports')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as MarketReport[];
    }
  });
};

// Hook para crear informe
export const useCreateMarketReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (reportData: Omit<MarketReport, 'id' | 'created_at' | 'updated_at' | 'download_count'>) => {
      const { data, error } = await supabase
        .from('market_reports')
        .insert(reportData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMarketReports'] });
      queryClient.invalidateQueries({ queryKey: ['marketReports'] });
    }
  });
};

// Hook para actualizar informe
export const useUpdateMarketReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<MarketReport> & { id: string }) => {
      const { data, error } = await supabase
        .from('market_reports')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMarketReports'] });
      queryClient.invalidateQueries({ queryKey: ['marketReports'] });
    }
  });
};

// Hook para eliminar informe
export const useDeleteMarketReport = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('market_reports')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminMarketReports'] });
      queryClient.invalidateQueries({ queryKey: ['marketReports'] });
    }
  });
};

// Hook para incrementar contador de descargas
export const useIncrementDownloadCount = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { data: currentReport, error: fetchError } = await supabase
        .from('market_reports')
        .select('download_count')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const { error } = await supabase
        .from('market_reports')
        .update({ download_count: (currentReport.download_count || 0) + 1 })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketReports'] });
      queryClient.invalidateQueries({ queryKey: ['adminMarketReports'] });
    }
  });
};