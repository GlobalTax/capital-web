import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Generate teaser for an operation
export const useGenerateTeaser = () => {
  return useMutation({
    mutationFn: async ({ operationId, dealProfile }: { 
      operationId?: string; 
      dealProfile?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.functions.invoke('sf-generate-teaser', {
        body: { operation_id: operationId, deal_profile_json: dealProfile }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Teaser generado correctamente');
    },
    onError: () => {
      toast.error('Error al generar teaser');
    }
  });
};

// Generate outreach email
export const useGenerateOutreach = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      fundId, 
      operationId, 
      personId,
      buyerProfile,
      teaserJson,
      senderInfo
    }: { 
      fundId?: string; 
      operationId?: string;
      personId?: string;
      buyerProfile?: Record<string, any>;
      teaserJson?: Record<string, any>;
      senderInfo?: {
        name: string;
        firm: string;
        email: string;
        phone?: string;
      };
    }) => {
      const { data, error } = await supabase.functions.invoke('sf-generate-outreach', {
        body: { 
          fund_id: fundId, 
          operation_id: operationId,
          person_id: personId,
          buyer_profile_json: buyerProfile,
          teaser_json: teaserJson,
          my_name: senderInfo?.name,
          my_firm: senderInfo?.firm,
          my_email: senderInfo?.email,
          my_phone: senderInfo?.phone
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-outreach'] });
      toast.success('Email generado correctamente');
    },
    onError: () => {
      toast.error('Error al generar email');
    }
  });
};

// Generate follow-up email
export const useGenerateFollowup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      outreachId,
      previousEmailBody,
      buyerProfile,
      teaserJson
    }: { 
      outreachId?: string;
      previousEmailBody?: string;
      buyerProfile?: Record<string, any>;
      teaserJson?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.functions.invoke('sf-generate-followup', {
        body: { 
          outreach_id: outreachId,
          previous_email_body: previousEmailBody,
          buyer_profile_json: buyerProfile,
          teaser_json: teaserJson
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-outreach'] });
      toast.success('Follow-up generado correctamente');
    },
    onError: () => {
      toast.error('Error al generar follow-up');
    }
  });
};

// Run AI matching
export const useRunAIMatching = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      operationId, 
      fundId,
      dealProfile,
      buyerProfile
    }: { 
      operationId?: string; 
      fundId?: string;
      dealProfile?: Record<string, any>;
      buyerProfile?: Record<string, any>;
    }) => {
      const { data, error } = await supabase.functions.invoke('sf-ai-matching', {
        body: { 
          operation_id: operationId, 
          fund_id: fundId,
          deal_profile_json: dealProfile,
          buyer_profile_json: buyerProfile
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-matches'] });
      toast.success('Matching ejecutado correctamente');
    },
    onError: () => {
      toast.error('Error al ejecutar matching');
    }
  });
};

// Monitor fund changes
export const useMonitorFundChanges = () => {
  return useMutation({
    mutationFn: async ({ fundId }: { fundId: string }) => {
      const { data, error } = await supabase.functions.invoke('sf-monitor-changes', {
        body: { fund_id: fundId }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Monitoreo ejecutado');
    },
    onError: () => {
      toast.error('Error al monitorear cambios');
    }
  });
};

// Check for duplicates
export const useCheckDuplicates = () => {
  return useMutation({
    mutationFn: async ({ buyerAId, buyerBId }: { buyerAId: string; buyerBId: string }) => {
      const { data, error } = await supabase.functions.invoke('sf-dedupe-check', {
        body: { buyer_a_id: buyerAId, buyer_b_id: buyerBId }
      });

      if (error) throw error;
      return data;
    }
  });
};

// Enrich profile with new data
export const useEnrichProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      fundId, 
      newUrl, 
      newMarkdown 
    }: { 
      fundId: string; 
      newUrl: string; 
      newMarkdown: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('sf-enrich-profile', {
        body: { fund_id: fundId, new_url: newUrl, new_markdown: newMarkdown }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sf-funds'] });
      toast.success('Perfil enriquecido correctamente');
    },
    onError: () => {
      toast.error('Error al enriquecer perfil');
    }
  });
};
