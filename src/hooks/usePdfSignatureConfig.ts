import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PdfSignatureConfig {
  id: string;
  config_key: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  website: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const usePdfSignatureConfig = () => {
  return useQuery({
    queryKey: ['pdf-signature-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pdf_signature_config')
        .select('*')
        .eq('config_key', 'default')
        .single();
      
      if (error) {
        console.error('Error fetching PDF signature config:', error);
        return null;
      }
      
      return data as PdfSignatureConfig;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdatePdfSignatureConfig = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (updates: Partial<PdfSignatureConfig>) => {
      const { data, error } = await supabase
        .from('pdf_signature_config')
        .update(updates)
        .eq('config_key', 'default')
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pdf-signature-config'] });
      toast.success('Configuración de firma actualizada');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar: ${error.message}`);
    },
  });
};
