// ============= CAMPAIGN REGISTRY HOOK =============
// Hook para gestionar campañas y sus snapshots por fecha

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

// ============= TYPES =============

export interface Campaign {
  id: string;
  name: string;
  channel: 'meta_ads' | 'google_ads' | 'linkedin_ads' | 'other';
  delivery_status: 'active' | 'paused';
  archived: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  // Latest snapshot (joined)
  latest_snapshot?: CampaignSnapshot | null;
}

export interface CampaignSnapshot {
  id: string;
  campaign_id: string;
  snapshot_date: string;
  results: number;
  amount_spent: number;
  daily_budget: number | null;
  monthly_budget: number | null;
  target_cpl: number | null;
  internal_status: 'ok' | 'watch' | 'stop' | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Calculated fields (added in frontend)
  cost_per_result?: number | null;
  cpl_variation?: number | null;
}

export interface CampaignWithSnapshot extends Campaign {
  latest_snapshot: CampaignSnapshot | null;
}

export interface CreateCampaignInput {
  name: string;
  channel?: 'meta_ads' | 'google_ads' | 'linkedin_ads' | 'other';
  delivery_status?: 'active' | 'paused';
  // Optional first snapshot
  initial_snapshot?: Omit<SnapshotInput, 'campaign_id'>;
}

export interface UpdateCampaignInput {
  id: string;
  name?: string;
  channel?: 'meta_ads' | 'google_ads' | 'linkedin_ads' | 'other';
  delivery_status?: 'active' | 'paused';
  archived?: boolean;
}

export interface SnapshotInput {
  campaign_id: string;
  snapshot_date: string;
  results?: number;
  amount_spent?: number;
  daily_budget?: number | null;
  monthly_budget?: number | null;
  target_cpl?: number | null;
  internal_status?: 'ok' | 'watch' | 'stop' | null;
  notes?: string | null;
}

// ============= CHANNEL LABELS =============

export const CHANNEL_LABELS: Record<string, string> = {
  meta_ads: 'Meta Ads',
  google_ads: 'Google Ads',
  linkedin_ads: 'LinkedIn Ads',
  other: 'Otros'
};

// ============= HELPER FUNCTIONS =============

const calculateCostPerResult = (amountSpent: number, results: number): number | null => {
  if (!results || results === 0) return null;
  return amountSpent / results;
};

const calculateCplVariation = (costPerResult: number | null, targetCpl: number | null): number | null => {
  if (!costPerResult || !targetCpl || targetCpl === 0) return null;
  return ((costPerResult - targetCpl) / targetCpl) * 100;
};

const enrichSnapshot = (snapshot: CampaignSnapshot): CampaignSnapshot => {
  const costPerResult = calculateCostPerResult(snapshot.amount_spent, snapshot.results);
  return {
    ...snapshot,
    cost_per_result: costPerResult,
    cpl_variation: calculateCplVariation(costPerResult, snapshot.target_cpl)
  };
};

// ============= MAIN HOOK =============

export const useCampaignRegistry = () => {
  const queryClient = useQueryClient();

  // ========== QUERIES ==========

  // Fetch all campaigns with their latest snapshot
  const { 
    data: campaigns = [], 
    isLoading: isLoadingCampaigns, 
    error: campaignsError 
  } = useQuery({
    queryKey: ['campaigns_registry'],
    queryFn: async () => {
      // First get all campaigns
      const { data: campaignsData, error: campaignsErr } = await supabase
        .from('campaigns')
        .select('*')
        .eq('archived', false)
        .order('created_at', { ascending: false });
      
      if (campaignsErr) throw campaignsErr;
      if (!campaignsData || campaignsData.length === 0) return [];

      // Get latest snapshot for each campaign
      const campaignIds = campaignsData.map(c => c.id);
      
      const { data: snapshotsData, error: snapshotsErr } = await supabase
        .from('campaign_cost_snapshots')
        .select('*')
        .in('campaign_id', campaignIds)
        .order('snapshot_date', { ascending: false });
      
      if (snapshotsErr) throw snapshotsErr;

      // Map latest snapshot to each campaign
      const snapshotsByCompaign = new Map<string, CampaignSnapshot>();
      snapshotsData?.forEach(snap => {
        if (!snapshotsByCompaign.has(snap.campaign_id)) {
          snapshotsByCompaign.set(snap.campaign_id, enrichSnapshot(snap as CampaignSnapshot));
        }
      });

      return campaignsData.map(campaign => ({
        ...campaign,
        latest_snapshot: snapshotsByCompaign.get(campaign.id) || null
      })) as CampaignWithSnapshot[];
    }
  });

  // Fetch all snapshots for evolution/charts (with date range)
  const fetchSnapshotsByDateRange = async (
    startDate?: string, 
    endDate?: string,
    campaignIds?: string[]
  ) => {
    let query = supabase
      .from('campaign_cost_snapshots')
      .select('*, campaigns!inner(name, channel, delivery_status)')
      .order('snapshot_date', { ascending: true });
    
    if (startDate) query = query.gte('snapshot_date', startDate);
    if (endDate) query = query.lte('snapshot_date', endDate);
    if (campaignIds && campaignIds.length > 0) {
      query = query.in('campaign_id', campaignIds);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return data?.map(snap => enrichSnapshot(snap as CampaignSnapshot)) || [];
  };

  // Fetch snapshots for a specific campaign
  const fetchCampaignSnapshots = async (campaignId: string) => {
    const { data, error } = await supabase
      .from('campaign_cost_snapshots')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('snapshot_date', { ascending: false });
    
    if (error) throw error;
    return data?.map(snap => enrichSnapshot(snap as CampaignSnapshot)) || [];
  };

  // ========== MUTATIONS ==========

  // Create new campaign
  const createCampaignMutation = useMutation({
    mutationFn: async (input: CreateCampaignInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Insert campaign
      const { data: campaign, error: campaignErr } = await supabase
        .from('campaigns')
        .insert({
          name: input.name,
          channel: input.channel || 'meta_ads',
          delivery_status: input.delivery_status || 'active',
          created_by: user?.id
        })
        .select()
        .single();
      
      if (campaignErr) throw campaignErr;

      // Insert initial snapshot if provided
      if (input.initial_snapshot) {
        const { error: snapErr } = await supabase
          .from('campaign_cost_snapshots')
          .insert({
            campaign_id: campaign.id,
            snapshot_date: input.initial_snapshot.snapshot_date || format(new Date(), 'yyyy-MM-dd'),
            results: input.initial_snapshot.results || 0,
            amount_spent: input.initial_snapshot.amount_spent || 0,
            daily_budget: input.initial_snapshot.daily_budget,
            monthly_budget: input.initial_snapshot.monthly_budget,
            target_cpl: input.initial_snapshot.target_cpl,
            internal_status: input.initial_snapshot.internal_status,
            notes: input.initial_snapshot.notes,
            created_by: user?.id
          });
        
        if (snapErr) throw snapErr;
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
      queryClient.invalidateQueries({ queryKey: ['campaign_history'] });
      toast.success('Campaña creada correctamente');
    },
    onError: (error) => {
      console.error('Error creating campaign:', error);
      toast.error('Error al crear la campaña');
    }
  });

  // Update campaign (dimension data only)
  const updateCampaignMutation = useMutation({
    mutationFn: async ({ id, ...input }: UpdateCampaignInput) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(input)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
      toast.success('Campaña actualizada');
    },
    onError: (error) => {
      console.error('Error updating campaign:', error);
      toast.error('Error al actualizar la campaña');
    }
  });

  // Archive campaign
  const archiveCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .update({ archived: true })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
      toast.success('Campaña archivada');
    },
    onError: (error) => {
      console.error('Error archiving campaign:', error);
      toast.error('Error al archivar la campaña');
    }
  });

  // Duplicate campaign
  const duplicateCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get original campaign
      const original = campaigns.find(c => c.id === id);
      if (!original) throw new Error('Campaign not found');

      // Create new campaign
      const { data: newCampaign, error } = await supabase
        .from('campaigns')
        .insert({
          name: `${original.name} (copia)`,
          channel: original.channel,
          delivery_status: 'paused', // Duplicates start paused
          created_by: user?.id
        })
        .select()
        .single();
      
      if (error) throw error;
      return newCampaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
      toast.success('Campaña duplicada');
    },
    onError: (error) => {
      console.error('Error duplicating campaign:', error);
      toast.error('Error al duplicar la campaña');
    }
  });

  // Upsert snapshot (creates or updates for campaign_id + date)
  const upsertSnapshotMutation = useMutation({
    mutationFn: async (input: SnapshotInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('campaign_cost_snapshots')
        .upsert({
          campaign_id: input.campaign_id,
          snapshot_date: input.snapshot_date,
          results: input.results ?? 0,
          amount_spent: input.amount_spent ?? 0,
          daily_budget: input.daily_budget,
          monthly_budget: input.monthly_budget,
          target_cpl: input.target_cpl,
          internal_status: input.internal_status,
          notes: input.notes,
          created_by: user?.id
        }, {
          onConflict: 'campaign_id,snapshot_date'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
      queryClient.invalidateQueries({ queryKey: ['campaign_history'] });
      toast.success('Registro guardado');
    },
    onError: (error) => {
      console.error('Error saving snapshot:', error);
      toast.error('Error al guardar el registro');
    }
  });

  // Update single snapshot cell (optimistic update)
  const updateSnapshotCellMutation = useMutation({
    mutationFn: async ({ 
      snapshotId, 
      field, 
      value 
    }: { 
      snapshotId: string; 
      field: string; 
      value: string | number | null;
    }) => {
      const { data, error } = await supabase
        .from('campaign_cost_snapshots')
        .update({ [field]: value })
        .eq('id', snapshotId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ snapshotId, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ['campaigns_registry'] });
      
      const previous = queryClient.getQueryData<CampaignWithSnapshot[]>(['campaigns_registry']);
      
      // Optimistic update
      queryClient.setQueryData<CampaignWithSnapshot[]>(['campaigns_registry'], (old) =>
        old?.map((campaign) => {
          if (campaign.latest_snapshot?.id === snapshotId) {
            return {
              ...campaign,
              latest_snapshot: {
                ...campaign.latest_snapshot,
                [field]: value
              }
            };
          }
          return campaign;
        })
      );
      
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['campaigns_registry'], context.previous);
      }
      toast.error('Error al guardar');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
      queryClient.invalidateQueries({ queryKey: ['campaign_history'] });
    }
  });

  // Update campaign cell (delivery_status, name)
  const updateCampaignCellMutation = useMutation({
    mutationFn: async ({ 
      campaignId, 
      field, 
      value 
    }: { 
      campaignId: string; 
      field: string; 
      value: string | null;
    }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update({ [field]: value })
        .eq('id', campaignId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async ({ campaignId, field, value }) => {
      await queryClient.cancelQueries({ queryKey: ['campaigns_registry'] });
      
      const previous = queryClient.getQueryData<CampaignWithSnapshot[]>(['campaigns_registry']);
      
      queryClient.setQueryData<CampaignWithSnapshot[]>(['campaigns_registry'], (old) =>
        old?.map((campaign) => {
          if (campaign.id === campaignId) {
            return { ...campaign, [field]: value };
          }
          return campaign;
        })
      );
      
      return { previous };
    },
    onError: (err, vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['campaigns_registry'], context.previous);
      }
      toast.error('Error al guardar');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
    }
  });

  // Delete snapshot
  const deleteSnapshotMutation = useMutation({
    mutationFn: async (snapshotId: string) => {
      const { error } = await supabase
        .from('campaign_cost_snapshots')
        .delete()
        .eq('id', snapshotId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns_registry'] });
      queryClient.invalidateQueries({ queryKey: ['campaign_history'] });
      toast.success('Registro eliminado');
    },
    onError: (error) => {
      console.error('Error deleting snapshot:', error);
      toast.error('Error al eliminar el registro');
    }
  });

  return {
    // Data
    campaigns,
    
    // Loading states
    isLoadingCampaigns,
    campaignsError,
    
    // Queries
    fetchSnapshotsByDateRange,
    fetchCampaignSnapshots,
    
    // Campaign mutations
    createCampaign: createCampaignMutation.mutate,
    createCampaignAsync: createCampaignMutation.mutateAsync,
    updateCampaign: updateCampaignMutation.mutate,
    archiveCampaign: archiveCampaignMutation.mutate,
    duplicateCampaign: duplicateCampaignMutation.mutate,
    
    // Snapshot mutations
    upsertSnapshot: upsertSnapshotMutation.mutate,
    upsertSnapshotAsync: upsertSnapshotMutation.mutateAsync,
    updateSnapshotCell: updateSnapshotCellMutation.mutateAsync,
    updateCampaignCell: updateCampaignCellMutation.mutateAsync,
    deleteSnapshot: deleteSnapshotMutation.mutate,
    
    // Mutation states
    isCreating: createCampaignMutation.isPending,
    isUpdating: updateCampaignMutation.isPending || updateSnapshotCellMutation.isPending,
    isArchiving: archiveCampaignMutation.isPending,
    isDuplicating: duplicateCampaignMutation.isPending,
    isSavingSnapshot: upsertSnapshotMutation.isPending,
    
    // Helpers
    channelLabels: CHANNEL_LABELS
  };
};
