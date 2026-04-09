/**
 * Hook for managing buy-side pipeline data and mutations
 * Fetches from company_acquisition_inquiries, acquisition_leads,
 * company_valuations (compras) and contact_leads (compras)
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { PipelineLead, LeadStatus, ActivityType } from '../types';

export interface BuyPipelineLead {
  id: string;
  origin: 'acquisition' | 'company_acquisition' | 'valuation_compras' | 'contact_compras';
  contact_name: string;
  company_name: string;
  email: string;
  phone: string | null;
  lead_status_crm: LeadStatus | null;
  investment_budget: string | null;
  sectors_of_interest: string | null;
  acquisition_type: string | null;
  notes: string | null;
  created_at: string;
  acquisition_channel_id: string | null;
  lead_form: string | null;
  // New fields for parity with sales pipeline
  assigned_to: string | null;
  assigned_at: string | null;
  precall_email_sent: boolean | null;
  precall_email_sent_at: string | null;
  call_attempts_count: number | null;
  last_call_attempt_at: string | null;
  revenue: number | null;
  ebitda: number | null;
  final_valuation: number | null;
  location: string | null;
  employee_range: string | null;
  empresa_id: string | null;
  industry: string;
  email_sent: boolean | null;
  email_opened: boolean | null;
}

/** Map a BuyPipelineLead to a PipelineLead for shared component reuse */
export function toBuyPipelineLead(b: BuyPipelineLead): PipelineLead {
  return {
    id: b.id,
    origin: 'valuation', // PipelineCard expects 'valuation' | 'contact'
    contact_name: b.contact_name,
    company_name: b.company_name,
    email: b.email,
    phone: b.phone,
    industry: b.industry || '',
    lead_status_crm: b.lead_status_crm,
    final_valuation: b.final_valuation,
    revenue: b.revenue,
    ebitda: b.ebitda,
    employee_range: b.employee_range,
    location: b.location,
    created_at: b.created_at,
    assigned_to: b.assigned_to,
    assigned_at: b.assigned_at,
    email_sent: b.email_sent,
    email_opened: b.email_opened,
    email_opened_at: null,
    precall_email_sent: b.precall_email_sent,
    precall_email_sent_at: b.precall_email_sent_at,
    followup_count: null,
    call_attempts_count: b.call_attempts_count,
    last_call_attempt_at: b.last_call_attempt_at,
    notes: b.notes,
    valuation_range_min: null,
    valuation_range_max: null,
    acquisition_channel_id: b.acquisition_channel_id,
    lead_form: b.lead_form,
    empresa_id: b.empresa_id,
  };
}

const EXTRA_FIELDS = {
  assigned_to: null as string | null,
  assigned_at: null as string | null,
  precall_email_sent: null as boolean | null,
  precall_email_sent_at: null as string | null,
  call_attempts_count: null as number | null,
  last_call_attempt_at: null as string | null,
  revenue: null as number | null,
  ebitda: null as number | null,
  final_valuation: null as number | null,
  location: null as string | null,
  employee_range: null as string | null,
  empresa_id: null as string | null,
  industry: '',
  email_sent: null as boolean | null,
  email_opened: null as boolean | null,
};

export const useBuyPipeline = () => {
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading, refetch } = useQuery({
    queryKey: ['buy-pipeline'],
    queryFn: async () => {
      // Fetch company_acquisition_inquiries
      const { data: inquiries, error: err1 } = await supabase
        .from('company_acquisition_inquiries')
        .select(`
          id, full_name, company, email, phone,
          lead_status_crm, investment_budget, sectors_of_interest,
          acquisition_type, notes, created_at, acquisition_channel_id, lead_form
        `)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .not('lead_status_crm', 'is', null)
        .order('created_at', { ascending: false });

      if (err1) throw err1;

      // Fetch acquisition_leads
      const { data: acqLeads, error: err2 } = await supabase
        .from('acquisition_leads')
        .select(`
          id, full_name, company, email, phone,
          lead_status_crm, investment_range, sectors_of_interest,
          acquisition_type, created_at, acquisition_channel_id, lead_form
        `)
        .or('is_deleted.is.null,is_deleted.eq.false')
        .order('created_at', { ascending: false });

      if (err2) throw err2;

      // Fetch company_valuations with lead_status_crm = 'compras'
      const { data: valCompras, error: err3 } = await supabase
        .from('company_valuations')
        .select(`
          id, contact_name, company_name, email, phone,
          lead_status_crm, ai_sector_name, notes, created_at,
          acquisition_channel_id, lead_form, assigned_to, empresa_id,
          revenue, ebitda, final_valuation, location, employee_range,
          precall_email_sent, call_attempts_count, email_sent, email_opened
        `)
        .eq('is_deleted', false)
        .eq('lead_status_crm', 'compras')
        .order('created_at', { ascending: false });

      if (err3) throw err3;

      // Fetch contact_leads with lead_status_crm = 'compras'
      const { data: contactCompras, error: err4 } = await supabase
        .from('contact_leads')
        .select(`
          id, full_name, company, email, phone,
          lead_status_crm, notes, created_at,
          acquisition_channel_id, lead_form, assigned_to, empresa_id,
          email_sent, email_opened
        `)
        .eq('is_deleted', false)
        .eq('lead_status_crm', 'compras')
        .order('created_at', { ascending: false });

      if (err4) throw err4;

      const inquiryLeads: BuyPipelineLead[] = (inquiries || []).map((i: any) => ({
        ...EXTRA_FIELDS,
        id: i.id,
        origin: 'company_acquisition' as const,
        contact_name: i.full_name || '',
        company_name: i.company || '',
        email: i.email || '',
        phone: i.phone || null,
        lead_status_crm: (i.lead_status_crm === 'compras' || !i.lead_status_crm) ? 'nuevo' : i.lead_status_crm,
        investment_budget: i.investment_budget || null,
        sectors_of_interest: i.sectors_of_interest || null,
        acquisition_type: i.acquisition_type || null,
        notes: i.notes || null,
        created_at: i.created_at,
        acquisition_channel_id: i.acquisition_channel_id || null,
        lead_form: i.lead_form || null,
        assigned_to: i.assigned_to || null,
        empresa_id: i.empresa_id || null,
      }));

      const acquisitionLeads: BuyPipelineLead[] = (acqLeads || []).map((a: any) => ({
        ...EXTRA_FIELDS,
        id: a.id,
        origin: 'acquisition' as const,
        contact_name: a.full_name || '',
        company_name: a.company || '',
        email: a.email || '',
        phone: a.phone || null,
        lead_status_crm: (a.lead_status_crm === 'compras' || !a.lead_status_crm) ? 'nuevo' : a.lead_status_crm,
        investment_budget: a.investment_range || null,
        sectors_of_interest: a.sectors_of_interest || null,
        acquisition_type: a.acquisition_type || null,
        notes: null,
        created_at: a.created_at,
        acquisition_channel_id: a.acquisition_channel_id || null,
        lead_form: a.lead_form || null,
        assigned_to: a.assigned_to || null,
        empresa_id: a.empresa_id || null,
      }));

      const valComprasLeads: BuyPipelineLead[] = (valCompras || []).map((v: any) => ({
        ...EXTRA_FIELDS,
        id: v.id,
        origin: 'valuation_compras' as const,
        contact_name: v.contact_name || '',
        company_name: v.company_name || '',
        email: v.email || '',
        phone: v.phone || null,
        lead_status_crm: 'nuevo' as LeadStatus,
        investment_budget: null,
        sectors_of_interest: v.ai_sector_name || null,
        acquisition_type: null,
        notes: v.notes || null,
        created_at: v.created_at,
        acquisition_channel_id: v.acquisition_channel_id || null,
        lead_form: v.lead_form || null,
        assigned_to: v.assigned_to || null,
        empresa_id: v.empresa_id || null,
        revenue: v.revenue || null,
        ebitda: v.ebitda || null,
        final_valuation: v.final_valuation || null,
        location: v.location || null,
        employee_range: v.employee_range || null,
        precall_email_sent: v.precall_email_sent || null,
        call_attempts_count: v.call_attempts_count || null,
        email_sent: v.email_sent || null,
        email_opened: v.email_opened || null,
      }));

      const contactComprasLeads: BuyPipelineLead[] = (contactCompras || []).map((c: any) => ({
        ...EXTRA_FIELDS,
        id: c.id,
        origin: 'contact_compras' as const,
        contact_name: c.full_name || '',
        company_name: c.company || '',
        email: c.email || '',
        phone: c.phone || null,
        lead_status_crm: 'nuevo' as LeadStatus,
        investment_budget: null,
        sectors_of_interest: null,
        acquisition_type: null,
        notes: c.notes || null,
        created_at: c.created_at,
        acquisition_channel_id: c.acquisition_channel_id || null,
        lead_form: c.lead_form || null,
        assigned_to: c.assigned_to || null,
        empresa_id: c.empresa_id || null,
        email_sent: c.email_sent || null,
        email_opened: c.email_opened || null,
      }));

      // Deduplicate by email (prefer company_acquisition_inquiries)
      const allLeads = [...inquiryLeads, ...valComprasLeads, ...contactComprasLeads];
      const seenEmails = new Set(allLeads.map(l => l.email?.toLowerCase()).filter(Boolean));
      const uniqueAcq = acquisitionLeads.filter(
        a => !a.email || !seenEmails.has(a.email.toLowerCase())
      );

      return [...allLeads, ...uniqueAcq];
    },
    staleTime: 1000 * 60 * 3,
    refetchOnWindowFocus: false,
  });

  // Admin users for assignment
  const { data: adminUsers = [] } = useQuery({
    queryKey: ['admin-users-simple'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_active_admin_users');
      if (error) throw error;
      return data as { user_id: string; full_name: string; email: string; phone: string | null }[];
    },
  });

  const getLeadOrigin = (leadId: string) => {
    const lead = leads.find(l => l.id === leadId);
    return lead?.origin || 'company_acquisition';
  };

  const getTableName = (origin: BuyPipelineLead['origin']) => {
    switch (origin) {
      case 'company_acquisition': return 'company_acquisition_inquiries';
      case 'acquisition': return 'acquisition_leads';
      case 'valuation_compras': return 'company_valuations';
      case 'contact_compras': return 'contact_leads';
    }
  };

  // Update status mutation (optimistic)
  const updateStatusMutation = useMutation({
    onMutate: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['buy-pipeline'] });
      const previous = queryClient.getQueryData<BuyPipelineLead[]>(['buy-pipeline']);
      queryClient.setQueryData<BuyPipelineLead[]>(['buy-pipeline'], (old = []) =>
        old.map(l => l.id === leadId ? { ...l, lead_status_crm: status } : l)
      );
      return { previous };
    },
    mutationFn: async ({ leadId, status }: { leadId: string; status: LeadStatus }) => {
      const origin = getLeadOrigin(leadId);
      const table = getTableName(origin);
      const { error } = await supabase
        .from(table as any)
        .update({ lead_status_crm: status })
        .eq('id', leadId);
      if (error) throw error;
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['buy-pipeline'], context.previous);
      toast.error('Error al actualizar el estado', { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['buy-pipeline'] });
    },
  });

  // Assign lead mutation (optimistic)
  const assignLeadMutation = useMutation({
    onMutate: async ({ leadId, userId }: { leadId: string; userId: string | null }) => {
      await queryClient.cancelQueries({ queryKey: ['buy-pipeline'] });
      const previous = queryClient.getQueryData<BuyPipelineLead[]>(['buy-pipeline']);
      queryClient.setQueryData<BuyPipelineLead[]>(['buy-pipeline'], (old = []) =>
        old.map(l => l.id === leadId ? { ...l, assigned_to: userId } : l)
      );
      return { previous };
    },
    mutationFn: async ({ leadId, userId }: { leadId: string; userId: string | null }) => {
      const origin = getLeadOrigin(leadId);
      const table = getTableName(origin);
      const { error } = await supabase
        .from(table as any)
        .update({ assigned_to: userId, assigned_at: userId ? new Date().toISOString() : null })
        .eq('id', leadId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast.success(variables.userId ? 'Lead asignado correctamente' : 'Lead desasignado');
    },
    onError: (error, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(['buy-pipeline'], context.previous);
      toast.error('Error al asignar el lead', { description: error.message });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['buy-pipeline'] });
    },
  });

  // Register call attempt
  const registerCallMutation = useMutation({
    mutationFn: async ({ leadId, answered }: { leadId: string; answered: boolean }) => {
      const origin = getLeadOrigin(leadId);
      const table = getTableName(origin);

      // For tables that support call_attempts_count
      if (origin === 'valuation_compras') {
        const { data: lead } = await supabase
          .from('company_valuations')
          .select('call_attempts_count')
          .eq('id', leadId)
          .single();
        const currentCount = lead?.call_attempts_count || 0;
        await supabase
          .from('company_valuations')
          .update({
            call_attempts_count: currentCount + 1,
            last_call_attempt_at: new Date().toISOString(),
          })
          .eq('id', leadId);
      }

      // Log activity
      await supabase.from('lead_activities').insert({
        lead_id: leadId,
        lead_type: 'acquisition' as any,
        activity_type: answered ? 'call_completed' : 'call_no_answer',
        description: answered ? 'Llamada completada' : 'Llamada sin respuesta',
        metadata: {},
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['buy-pipeline'] });
      toast.success(variables.answered ? 'Llamada registrada' : 'Intento de llamada registrado');
    },
    onError: (error) => {
      toast.error('Error al registrar la llamada', { description: error.message });
    },
  });

  // Group by status
  const leadsByStatus = useMemo(() => {
    return leads.reduce((acc, lead) => {
      const status = lead.lead_status_crm as LeadStatus;
      if (!acc[status]) acc[status] = [];
      acc[status].push(lead);
      return acc;
    }, {} as Record<LeadStatus, BuyPipelineLead[]>);
  }, [leads]);

  return {
    leads,
    leadsByStatus,
    adminUsers,
    isLoading,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
    assignLead: assignLeadMutation.mutate,
    registerCall: registerCallMutation.mutate,
  };
};
