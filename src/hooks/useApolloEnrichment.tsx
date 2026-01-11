import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  ApolloStatus, 
  ApolloCandidate, 
  ApolloOrgData, 
  ApolloPerson,
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
      // Get current session for auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión de nuevo",
          variant: "destructive",
        });
        return null;
      }

      // Call the edge function
      const response = await fetch(
        `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/enrich-lead-apollo`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ lead_id: leadId }),
        }
      );

      const data: EnrichLeadResponse = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al enriquecer",
          description: data.message || "No se pudo enriquecer el lead",
          variant: "destructive",
        });
        return data;
      }

      // Handle different statuses
      if (data.status === 'ok') {
        toast({
          title: "¡Enriquecimiento exitoso!",
          description: `Datos de ${data.org_data?.name || 'empresa'} obtenidos correctamente`,
        });
      } else if (data.status === 'needs_review') {
        toast({
          title: "Selección requerida",
          description: `Se encontraron ${data.candidates?.length || 'varias'} empresas. Por favor, selecciona la correcta.`,
          variant: "default",
        });
      } else if (data.status === 'error') {
        toast({
          title: "Error de enriquecimiento",
          description: data.message || "No se encontró información de la empresa",
          variant: "destructive",
        });
      }

      return data;

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        toast({
          title: "Error de autenticación",
          description: "Por favor, inicia sesión de nuevo",
          variant: "destructive",
        });
        return null;
      }

      const response = await fetch(
        `https://fwhqtzkkvnjkazhaficj.supabase.co/functions/v1/confirm-apollo-match`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ lead_id: leadId, apollo_org_id: apolloOrgId }),
        }
      );

      const data: ConfirmMatchResponse = await response.json();

      if (!response.ok) {
        toast({
          title: "Error al confirmar",
          description: data.message || "No se pudo confirmar la selección",
          variant: "destructive",
        });
        return data;
      }

      toast({
        title: "¡Empresa confirmada!",
        description: `Datos de ${data.org_data?.name || 'empresa'} guardados correctamente`,
      });

      return data;

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
