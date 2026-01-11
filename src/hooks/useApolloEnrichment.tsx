import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  EnrichLeadResponse,
  ConfirmMatchResponse 
} from '@/types/apollo';

interface UseApolloEnrichmentReturn {
  // States
  isEnriching: string | null;
  isConfirming: string | null;
  
  // Actions
  enrichLead: (leadId: string) => Promise<EnrichLeadResponse | null>;
  confirmMatch: (leadId: string, apolloOrgId: string) => Promise<ConfirmMatchResponse | null>;
}

export const useApolloEnrichment = (): UseApolloEnrichmentReturn => {
  const [isEnriching, setIsEnriching] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState<string | null>(null);
  const { toast } = useToast();

  const enrichLead = useCallback(async (leadId: string): Promise<EnrichLeadResponse | null> => {
    setIsEnriching(leadId);
    
    try {
      // Call the edge function using supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke('enrich-lead-apollo', {
        body: { lead_id: leadId }
      });

      if (error) {
        toast({
          title: "Error al enriquecer",
          description: error.message || "No se pudo enriquecer el lead",
          variant: "destructive",
        });
        return null;
      }

      const responseData = data as EnrichLeadResponse;

      // Handle different statuses
      if (responseData.status === 'ok') {
        toast({
          title: "¡Enriquecimiento exitoso!",
          description: `Datos de ${responseData.org_data?.name || 'empresa'} obtenidos correctamente`,
        });
      } else if (responseData.status === 'needs_review') {
        toast({
          title: "Selección requerida",
          description: `Se encontraron ${responseData.candidates?.length || 'varias'} empresas. Por favor, selecciona la correcta.`,
          variant: "default",
        });
      } else if (responseData.status === 'error') {
        toast({
          title: "Error de enriquecimiento",
          description: responseData.message || "No se encontró información de la empresa",
          variant: "destructive",
        });
      }

      return responseData;

    } catch (error) {
      console.error('Apollo enrichment error:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servicio de enriquecimiento",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsEnriching(null);
    }
  }, [toast]);

  const confirmMatch = useCallback(async (
    leadId: string, 
    apolloOrgId: string
  ): Promise<ConfirmMatchResponse | null> => {
    setIsConfirming(leadId);
    
    try {
      // Call the edge function using supabase.functions.invoke
      const { data, error } = await supabase.functions.invoke('confirm-apollo-match', {
        body: { lead_id: leadId, apollo_org_id: apolloOrgId }
      });

      if (error) {
        toast({
          title: "Error al confirmar",
          description: error.message || "No se pudo confirmar la selección",
          variant: "destructive",
        });
        return null;
      }

      const responseData = data as ConfirmMatchResponse;

      toast({
        title: "¡Empresa confirmada!",
        description: `Datos de ${responseData.org_data?.name || 'empresa'} guardados correctamente`,
      });

      return responseData;

    } catch (error) {
      console.error('Apollo confirm match error:', error);
      toast({
        title: "Error de conexión",
        description: "No se pudo conectar con el servicio",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsConfirming(null);
    }
  }, [toast]);

  return {
    isEnriching,
    isConfirming,
    enrichLead,
    confirmMatch,
  };
};
