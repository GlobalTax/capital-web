/**
 * Hook for managing leads pipeline data and mutations
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PipelineLead, LeadStatus, LeadActivity, ActivityType } from '../types';

export const useLeadsPipeline = () => {
  const queryClient = useQueryClient();

  // Fetch leads for pipeline - limited to recent 200 for performance
  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ['leads-pipeline'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('company_valuations')
        .select(`
          id,
          contact_name,
          company_name,
          email,
          phone,
          industry,
          lead_status_crm,
          final_valuation,
          created_at,
          assigned_to,
          email_sent,
          email_opened,
          precall_email_sent,
          followup_count,
          call_attempts_count,
          notes
        `)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data as PipelineLead[];
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });

  // Fetch admin users for assignment
  const { data: adminUsers = [] } = useQuery({
    queryKey: ['admin-users-simple'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_users')
        .select('user_id, full_name, email')
        .eq('is_active', true);

      if (error) throw error;
      return data;
    },
  });

  // Update lead status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      const { error } = await supabase
        .from('company_valuations')
        .update({ 
          lead_status_crm: status,
          status_updated_at: new Date().toISOString()
        })
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
    },
    onError: (error) => {
      toast.error('Error al actualizar el estado', { description: error.message });
    },
  });

  // Assign lead mutation
  const assignLeadMutation = useMutation({
    mutationFn: async ({ leadId, userId }: { leadId: string; userId: string | null }) => {
      const { error } = await supabase
        .from('company_valuations')
        .update({ 
          assigned_to: userId,
          assigned_at: userId ? new Date().toISOString() : null
        })
        .eq('id', leadId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      toast.success(variables.userId ? 'Lead asignado correctamente' : 'Lead desasignado');
    },
    onError: (error) => {
      toast.error('Error al asignar el lead', { description: error.message });
    },
  });

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async ({ 
      leadId, 
      activityType, 
      description, 
      metadata = {} 
    }: { 
      leadId: string; 
      activityType: ActivityType; 
      description?: string;
      metadata?: Record<string, any>;
    }) => {
      const { error } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          lead_type: 'valuation',
          activity_type: activityType,
          description,
          metadata,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
    },
  });

  // Update notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ leadId, notes }: { leadId: string; notes: string }) => {
      const { error } = await supabase
        .from('company_valuations')
        .update({ notes })
        .eq('id', leadId);

      if (error) throw error;

      // Also add activity
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        lead_type: 'valuation',
        activity_type: 'note_added',
        description: notes.substring(0, 100) + (notes.length > 100 ? '...' : ''),
        metadata: { full_note: notes },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      toast.success('Nota guardada');
    },
    onError: (error) => {
      toast.error('Error al guardar la nota', { description: error.message });
    },
  });

  // Register call attempt
  const registerCallMutation = useMutation({
    mutationFn: async ({ 
      leadId, 
      answered 
    }: { 
      leadId: string; 
      answered: boolean;
    }) => {
      // Get current lead data
      const { data: lead } = await supabase
        .from('company_valuations')
        .select('call_attempts_count')
        .eq('id', leadId)
        .single();

      const currentCount = lead?.call_attempts_count || 0;

      // Update lead
      const { error } = await supabase
        .from('company_valuations')
        .update({ 
          call_attempts_count: currentCount + 1,
          last_call_attempt_at: new Date().toISOString(),
          lead_status_crm: answered ? 'contactando' : undefined,
        })
        .eq('id', leadId);

      if (error) throw error;

      // Add activity
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        lead_type: 'valuation',
        activity_type: answered ? 'call_completed' : 'call_no_answer',
        description: answered ? 'Llamada completada' : 'Llamada sin respuesta',
        metadata: { attempt_number: currentCount + 1 },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      toast.success(variables.answered ? 'Llamada registrada' : 'Intento de llamada registrado');
    },
    onError: (error) => {
      toast.error('Error al registrar la llamada', { description: error.message });
    },
  });

  // Group leads by status
  const leadsByStatus = leads.reduce((acc, lead) => {
    const status = lead.lead_status_crm || 'nuevo';
    if (!acc[status]) acc[status] = [];
    acc[status].push(lead);
    return acc;
  }, {} as Record<LeadStatus, PipelineLead[]>);

  return {
    leads,
    leadsByStatus,
    adminUsers,
    isLoading,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    assignLead: assignLeadMutation.mutate,
    isAssigning: assignLeadMutation.isPending,
    addActivity: addActivityMutation.mutate,
    updateNotes: updateNotesMutation.mutate,
    registerCall: registerCallMutation.mutate,
  };
};

export const useLeadActivities = (leadId: string) => {
  return useQuery({
    queryKey: ['lead-activities', leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_activities')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as LeadActivity[];
    },
    enabled: !!leadId,
  });
};
