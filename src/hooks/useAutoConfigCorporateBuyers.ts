// =============================================
// AUTO-CONFIG CORPORATE BUYERS HOOK
// =============================================

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AutoConfigResult {
  buyer_id: string;
  buyer_name: string;
  status: 'configured' | 'skipped' | 'error';
  generated_fields?: {
    sector_focus?: string[];
    geography_focus?: string[];
    search_keywords?: string[];
    buyer_type?: string;
  };
  error_message?: string;
}

interface AutoConfigResponse {
  success: boolean;
  total_processed: number;
  configured: number;
  skipped: number;
  errors: number;
  results: AutoConfigResult[];
}

interface AutoConfigParams {
  buyerIds: string[];
  overwriteExisting?: boolean;
  fieldsToGenerate?: ('sector_focus' | 'geography_focus' | 'search_keywords')[];
}

export function useAutoConfigCorporateBuyers() {
  const queryClient = useQueryClient();

  const autoConfigBatch = useMutation({
    mutationFn: async (params: AutoConfigParams): Promise<AutoConfigResponse> => {
      const { data, error } = await supabase.functions.invoke(
        'corporate-buyer-auto-config',
        { 
          body: { 
            buyer_ids: params.buyerIds, 
            overwrite_existing: params.overwriteExisting,
            fields_to_generate: params.fieldsToGenerate
          } 
        }
      );
      
      if (error) {
        console.error('Auto-config error:', error);
        throw new Error(error.message || 'Error en auto-configuración');
      }
      
      if (data?.error) {
        throw new Error(data.error);
      }
      
      return data as AutoConfigResponse;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['corporate-buyers'] });
      if (data.configured > 0) {
        toast.success(`${data.configured} compradores configurados`, {
          description: data.skipped > 0 ? `${data.skipped} omitidos` : undefined
        });
      }
    },
    onError: (error: Error) => {
      console.error('Auto-config mutation error:', error);
      toast.error('Error en auto-configuración', {
        description: error.message
      });
    }
  });

  // Single buyer auto-config via existing edge function
  const autoConfigSingle = useMutation({
    mutationFn: async (buyerId: string) => {
      const { data, error } = await supabase.functions.invoke(
        'corporate-buyer-ai',
        { body: { buyer_id: buyerId, action: 'auto_configure' } }
      );
      
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['corporate-buyers'] });
      toast.success('Criterios configurados automáticamente');
    },
    onError: (error: Error) => {
      toast.error('Error al auto-configurar', {
        description: error.message
      });
    }
  });

  return {
    autoConfigBatch,
    autoConfigSingle,
    isAutoConfiguring: autoConfigBatch.isPending || autoConfigSingle.isPending
  };
}
