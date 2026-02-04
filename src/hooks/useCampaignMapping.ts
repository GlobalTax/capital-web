// ============= CAMPAIGN MAPPING HOOK =============
// CRUD para gestionar campaign_leads_mapping
// Vincula campañas de ads con patrones de lead forms

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ============= TYPES =============

export interface CampaignLeadsMapping {
  id: string;
  campaign_id: string;
  lead_form_pattern: string | null;
  campaign_name_pattern: string | null;
  utm_campaign_pattern: string | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  notes: string | null;
}

export interface CampaignWithMapping {
  id: string;
  name: string;
  external_name: string | null;
  external_campaign_id: string | null;
  default_lead_form: string | null;
  channel: string;
  delivery_status: string | null;
  mappings: CampaignLeadsMapping[];
}

export interface CreateMappingInput {
  campaign_id: string;
  lead_form_pattern?: string;
  campaign_name_pattern?: string;
  utm_campaign_pattern?: string;
  priority?: number;
  notes?: string;
}

export interface UpdateMappingInput {
  id: string;
  lead_form_pattern?: string | null;
  campaign_name_pattern?: string | null;
  utm_campaign_pattern?: string | null;
  priority?: number;
  is_active?: boolean;
  notes?: string | null;
}

// ============= MAIN HOOK =============

export const useCampaignMapping = () => {
  const queryClient = useQueryClient();

  // Fetch all campaigns with their mappings
  const { 
    data: campaignsWithMappings, 
    isLoading: isLoadingCampaigns,
    error: campaignsError 
  } = useQuery({
    queryKey: ['campaigns-with-mappings'],
    queryFn: async () => {
      // Get campaigns
      const { data: campaigns, error: campaignsErr } = await supabase
        .from('campaigns')
        .select('id, name, external_name, external_campaign_id, default_lead_form, channel, delivery_status')
        .order('name');
      
      if (campaignsErr) throw campaignsErr;
      
      // Get mappings
      const { data: mappings, error: mappingsErr } = await supabase
        .from('campaign_leads_mapping')
        .select('*')
        .order('priority');
      
      if (mappingsErr) throw mappingsErr;
      
      // Combine campaigns with their mappings
      const result: CampaignWithMapping[] = (campaigns || []).map(campaign => ({
        ...campaign,
        mappings: (mappings || []).filter(m => m.campaign_id === campaign.id) as CampaignLeadsMapping[],
      }));
      
      return result;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Fetch all mappings (flat)
  const { 
    data: allMappings,
    isLoading: isLoadingMappings 
  } = useQuery({
    queryKey: ['campaign-leads-mappings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('campaign_leads_mapping')
        .select('*')
        .order('priority');
      
      if (error) throw error;
      return (data || []) as CampaignLeadsMapping[];
    },
    staleTime: 1000 * 60 * 2,
  });

  // Get unique lead forms from company_valuations for autocomplete
  const { data: availableLeadForms } = useQuery({
    queryKey: ['available-lead-forms'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_valuations')
        .select('lead_form')
        .not('lead_form', 'is', null)
        .limit(1000);
      
      if (error) throw error;
      
      // Get unique values
      const forms = [...new Set(data?.map(d => d.lead_form).filter(Boolean))] as string[];
      return forms.sort();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Get unique campaign names from ads_costs_history for autocomplete
  const { data: availableCampaignNames } = useQuery({
    queryKey: ['available-campaign-names'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads_costs_history')
        .select('campaign_name')
        .limit(1000);
      
      if (error) throw error;
      
      const names = [...new Set(data?.map(d => d.campaign_name).filter(Boolean))] as string[];
      return names.sort();
    },
    staleTime: 1000 * 60 * 10,
  });

  // Create mapping mutation
  const createMappingMutation = useMutation({
    mutationFn: async (input: CreateMappingInput) => {
      const { data, error } = await supabase
        .from('campaign_leads_mapping')
        .insert({
          campaign_id: input.campaign_id,
          lead_form_pattern: input.lead_form_pattern || null,
          campaign_name_pattern: input.campaign_name_pattern || null,
          utm_campaign_pattern: input.utm_campaign_pattern || null,
          priority: input.priority ?? 10,
          notes: input.notes || null,
          is_active: true,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns-with-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-leads-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-leads-stats'] });
      toast.success('Mapeo creado correctamente');
    },
    onError: (error) => {
      console.error('[useCampaignMapping] Error creating mapping:', error);
      toast.error('Error al crear el mapeo');
    },
  });

  // Update mapping mutation
  const updateMappingMutation = useMutation({
    mutationFn: async (input: UpdateMappingInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('campaign_leads_mapping')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns-with-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-leads-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-leads-stats'] });
      toast.success('Mapeo actualizado');
    },
    onError: (error) => {
      console.error('[useCampaignMapping] Error updating mapping:', error);
      toast.error('Error al actualizar el mapeo');
    },
  });

  // Delete mapping mutation
  const deleteMappingMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaign_leads_mapping')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns-with-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-leads-mappings'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-leads-stats'] });
      toast.success('Mapeo eliminado');
    },
    onError: (error) => {
      console.error('[useCampaignMapping] Error deleting mapping:', error);
      toast.error('Error al eliminar el mapeo');
    },
  });

  // Toggle mapping active status
  const toggleMappingActive = async (id: string, isActive: boolean) => {
    await updateMappingMutation.mutateAsync({ id, is_active: isActive });
  };

  // Preview leads that match a pattern
  const previewMatchingLeads = async (pattern: string, patternType: 'lead_form' | 'campaign_name' | 'utm_campaign') => {
    try {
      let query = supabase
        .from('company_valuations')
        .select('id, contact_name, company_name, lead_form, last_campaign_name, utm_campaign, created_at')
        .eq('is_deleted', false)
        .limit(50);
      
      if (patternType === 'lead_form') {
        query = query.ilike('lead_form', pattern);
      } else if (patternType === 'campaign_name') {
        query = query.ilike('last_campaign_name', pattern);
      } else {
        query = query.ilike('utm_campaign', pattern);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('[useCampaignMapping] Error previewing leads:', err);
      return [];
    }
  };

  return {
    // Data
    campaignsWithMappings: campaignsWithMappings || [],
    allMappings: allMappings || [],
    availableLeadForms: availableLeadForms || [],
    availableCampaignNames: availableCampaignNames || [],
    
    // Loading
    isLoading: isLoadingCampaigns || isLoadingMappings,
    error: campaignsError,
    
    // Mutations
    createMapping: createMappingMutation.mutate,
    updateMapping: updateMappingMutation.mutate,
    deleteMapping: deleteMappingMutation.mutate,
    toggleMappingActive,
    
    // Mutation states
    isCreating: createMappingMutation.isPending,
    isUpdating: updateMappingMutation.isPending,
    isDeleting: deleteMappingMutation.isPending,
    
    // Helpers
    previewMatchingLeads,
  };
};

export default useCampaignMapping;
