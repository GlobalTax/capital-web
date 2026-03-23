/**
 * Hook for managing leads pipeline data and mutations
 * Fetches from both company_valuations and contact_leads
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PipelineLead, LeadStatus, LeadActivity, ActivityType } from '../types';

// Helper to fetch all rows with pagination
async function fetchAllPaginated(
  queryFn: (from: number, to: number) => PromiseLike<{ data: any[] | null; error: any }>
): Promise<any[]> {
  const PAGE_SIZE = 1000;
  let all: any[] = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await queryFn(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    all = all.concat(data || []);
    hasMore = (data?.length ?? 0) === PAGE_SIZE;
    from += PAGE_SIZE;
  }
  return all;
}

export const useLeadsPipeline = () => {
  const queryClient = useQueryClient();

  // Fetch leads from BOTH tables
  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ['leads-pipeline'],
    queryFn: async () => {
      // Fetch company_valuations
      const valuations = await fetchAllPaginated((from, to) =>
        supabase
          .from('company_valuations')
          .select(`
            id, contact_name, company_name, email, phone, industry,
            lead_status_crm, final_valuation, revenue, ebitda,
            employee_range, location, acquisition_channel_id, lead_form,
            created_at, assigned_to, email_sent, email_opened,
            precall_email_sent, call_attempts_count, empresa_id
          `)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .range(from, to)
      );

      // Fetch contact_leads
      const contacts = await fetchAllPaginated((from, to) =>
        supabase
          .from('contact_leads')
          .select(`
            id, full_name, company, email, phone, service_type,
            lead_status_crm, acquisition_channel_id, lead_form,
            created_at, assigned_to, email_sent, email_opened, notes, empresa_id
          `)
          .eq('is_deleted', false)
          .not('lead_status_crm', 'is', null)
          .order('created_at', { ascending: false })
          .range(from, to)
      );

      // Normalize valuations
      const valLeads: PipelineLead[] = valuations.map((v: any) => ({
        ...v,
        origin: 'valuation' as const,
      }));

      // Normalize contact_leads → PipelineLead shape
      const contactLeads: PipelineLead[] = contacts.map((c: any) => ({
        id: c.id,
        origin: 'contact' as const,
        contact_name: c.full_name || '',
        company_name: c.company || '',
        email: c.email || '',
        phone: c.phone || null,
        industry: c.service_type || '',
        lead_status_crm: c.lead_status_crm,
        final_valuation: null,
        revenue: null,
        ebitda: null,
        employee_range: null,
        location: null,
        created_at: c.created_at,
        assigned_to: c.assigned_to || null,
        assigned_at: null,
        email_sent: c.email_sent || null,
        email_opened: c.email_opened || null,
        email_opened_at: null,
        precall_email_sent: null,
        precall_email_sent_at: null,
        followup_count: null,
        call_attempts_count: null,
        last_call_attempt_at: null,
        notes: c.notes || null,
        valuation_range_min: null,
        valuation_range_max: null,
        acquisition_channel_id: c.acquisition_channel_id || null,
        lead_form: c.lead_form || null,
        empresa_id: c.empresa_id || null,
      }));

      // Merge: deduplicate by email (prefer valuations)
      const seenEmails = new Set(valLeads.map(v => v.email?.toLowerCase()).filter(Boolean));
      const uniqueContacts = contactLeads.filter(
        c => !c.email || !seenEmails.has(c.email.toLowerCase())
      );

      return [...valLeads, ...uniqueContacts];
    },
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 10,
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

  // Helper to resolve table from leadId
  const getLeadOrigin = (leadId: string): 'valuation' | 'contact' => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.origin || 'valuation';
  };

  const getTableName = (origin: 'valuation' | 'contact') =>
    origin === 'valuation' ? 'company_valuations' : 'contact_leads';

  // Update lead status mutation (optimistic)
  const updateStatusMutation = useMutation({
    onMutate: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['leads-pipeline'] });
      const previous = queryClient.getQueryData<PipelineLead[]>(['leads-pipeline']);
      queryClient.setQueryData<PipelineLead[]>(['leads-pipeline'], (old = []) =>
        old.map(l => l.id === leadId ? { ...l, lead_status_crm: status } : l)
      );
      return { previous };
    },
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      const origin = getLeadOrigin(leadId);
      const table = getTableName(origin);
      
      const updateData: any = { lead_status_crm: status };
      if (origin === 'valuation') {
        updateData.status_updated_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from(table as any)
        .update(updateData)
        .eq('id', leadId);
      if (error) throw error;
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['leads-pipeline'], context.previous);
      toast.error('Error al actualizar el estado', { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
      queryClient.invalidateQueries({ queryKey: ['unified-contacts'] });
    },
  });

  // Assign lead mutation (optimistic)
  const assignLeadMutation = useMutation({
    onMutate: async ({ leadId, userId }: { leadId: string; userId: string | null }) => {
      await queryClient.cancelQueries({ queryKey: ['leads-pipeline'] });
      const previous = queryClient.getQueryData<PipelineLead[]>(['leads-pipeline']);
      queryClient.setQueryData<PipelineLead[]>(['leads-pipeline'], (old = []) =>
        old.map(l => l.id === leadId ? { ...l, assigned_to: userId } : l)
      );
      return { previous };
    },
    mutationFn: async ({ leadId, userId }: { leadId: string; userId: string | null }) => {
      const origin = getLeadOrigin(leadId);
      const table = getTableName(origin);

      const updateData: any = { assigned_to: userId };
      if (origin === 'valuation') {
        updateData.assigned_at = userId ? new Date().toISOString() : null;
      }

      const { error } = await supabase
        .from(table as any)
        .update(updateData)
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.userId ? 'Lead asignado correctamente' : 'Lead desasignado');
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['leads-pipeline'], context.previous);
      toast.error('Error al asignar el lead', { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['leads-pipeline'] });
      queryClient.invalidateQueries({ queryKey: ['lead-activities'] });
    },
  });

  // Add activity mutation
  const addActivityMutation = useMutation({
    mutationFn: async ({ leadId, activityType, description, metadata = {} }: {
      leadId: string;
      activityType: ActivityType;
      description?: string;
      metadata?: Record<string, any>;
    }) => {
      const origin = getLeadOrigin(leadId);
      const { error } = await supabase
        .from('lead_activities')
        .insert({
          lead_id: leadId,
          lead_type: origin === 'valuation' ? 'valuation' : 'contact',
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
      const origin = getLeadOrigin(leadId);
      const table = getTableName(origin);

      const { error } = await supabase
        .from(table as any)
        .update({ notes })
        .eq('id', leadId);
      if (error) throw error;

      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        lead_type: origin === 'valuation' ? 'valuation' : 'contact',
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
    mutationFn: async ({ leadId, answered }: { leadId: string; answered: boolean }) => {
      const origin = getLeadOrigin(leadId);
      const table = getTableName(origin);

      if (origin === 'valuation') {
        const { data: lead } = await supabase
          .from('company_valuations')
          .select('call_attempts_count')
          .eq('id', leadId)
          .single();

        const currentCount = lead?.call_attempts_count || 0;
        const { error } = await supabase
          .from('company_valuations')
          .update({
            call_attempts_count: currentCount + 1,
            last_call_attempt_at: new Date().toISOString(),
            lead_status_crm: answered ? 'contactando' : undefined,
          })
          .eq('id', leadId);
        if (error) throw error;

        await supabase.from('lead_activities').insert({
          lead_id: leadId,
          lead_type: 'valuation',
          activity_type: answered ? 'call_completed' : 'call_no_answer',
          description: answered ? 'Llamada completada' : 'Llamada sin respuesta',
          metadata: { attempt_number: currentCount + 1 },
        });
      } else {
        // For contact_leads, just log the activity
        if (answered) {
          await supabase
            .from('contact_leads' as any)
            .update({ lead_status_crm: 'contactando' })
            .eq('id', leadId);
        }
        await supabase.from('lead_activities').insert({
          lead_id: leadId,
          lead_type: 'contact',
          activity_type: answered ? 'call_completed' : 'call_no_answer',
          description: answered ? 'Llamada completada' : 'Llamada sin respuesta',
          metadata: {},
        });
      }
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

  // Memoized grouping
  const leadsByStatus = useMemo(() => {
    return leads.reduce((acc, lead) => {
      const status = lead.lead_status_crm || 'nuevo';
      if (!acc[status]) acc[status] = [];
      acc[status].push(lead);
      return acc;
    }, {} as Record<LeadStatus, PipelineLead[]>);
  }, [leads]);

  return {
    leads,
    leadsByStatus,
    adminUsers,
    isLoading,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
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
