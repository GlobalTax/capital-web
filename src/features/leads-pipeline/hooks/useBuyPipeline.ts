/**
 * Hook for managing buy-side pipeline data and mutations
 * Fetches from company_acquisition_inquiries and acquisition_leads
 */

import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { LeadStatus } from '../types';

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
}

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
          lead_status_crm, sectors_of_interest, notes, created_at,
          acquisition_channel_id, lead_form
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
          acquisition_channel_id, lead_form
        `)
        .eq('is_deleted', false)
        .eq('lead_status_crm', 'compras')
        .order('created_at', { ascending: false });

      if (err4) throw err4;

      const inquiryLeads: BuyPipelineLead[] = (inquiries || []).map((i: any) => ({
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
      }));

      const acquisitionLeads: BuyPipelineLead[] = (acqLeads || []).map((a: any) => ({
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
      }));

      const valComprasLeads: BuyPipelineLead[] = (valCompras || []).map((v: any) => ({
        id: v.id,
        origin: 'valuation_compras' as const,
        contact_name: v.contact_name || '',
        company_name: v.company_name || '',
        email: v.email || '',
        phone: v.phone || null,
        lead_status_crm: 'nuevo' as LeadStatus,
        investment_budget: null,
        sectors_of_interest: v.sectors_of_interest || null,
        acquisition_type: null,
        notes: v.notes || null,
        created_at: v.created_at,
        acquisition_channel_id: v.acquisition_channel_id || null,
        lead_form: v.lead_form || null,
      }));

      const contactComprasLeads: BuyPipelineLead[] = (contactCompras || []).map((c: any) => ({
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
    isLoading,
    refetch,
    updateStatus: updateStatusMutation.mutate,
    updateStatusAsync: updateStatusMutation.mutateAsync,
  };
};
