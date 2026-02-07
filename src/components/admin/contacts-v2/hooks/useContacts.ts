// ============= USE CONTACTS HOOK (SIMPLIFIED) =============
// Simplified hook for fetching and managing contacts

import { useState, useEffect, useRef, useId, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Contact, ContactFilters, ContactStats, ContactOrigin } from '../types';

const DEFAULT_STATS: ContactStats = {
  total: 0,
  uniqueContacts: 0,
  hot: 0,
  qualified: 0,
  byOrigin: {
    contact: 0,
    valuation: 0,
    collaborator: 0,
    general: 0,
    acquisition: 0,
    company_acquisition: 0,
    advisor: 0,
  },
  totalValuation: 0,
};

export const useContacts = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ContactFilters>({ emailStatus: 'all' });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Unique channel ID per instance to avoid subscription conflicts
  const instanceId = useId();
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchContacts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Fetch prospect statuses and lead forms display_name map in parallel
      const [{ data: prospectStatuses }, { data: leadFormsData }] = await Promise.all([
        supabase
          .from('contact_statuses')
          .select('status_key')
          .eq('is_prospect_stage', true)
          .eq('is_active', true),
        supabase
          .from('lead_forms')
          .select('id, name, display_name'),
      ]);
      
      const prospectKeys = (prospectStatuses || []).map(s => s.status_key);
      
      // Build display_name lookup: form_id -> display_name
      const formDisplayMap: Record<string, string> = {};
      for (const f of (leadFormsData || [])) {
        formDisplayMap[f.id] = f.display_name || f.name;
      }

      // Parallel fetch all contact sources
      const [
        { data: contactLeads },
        { data: valuationLeads },
        { data: collaboratorLeads },
        { data: acquisitionLeads },
        { data: advisorLeads },
      ] = await Promise.all([
        supabase
          .from('contact_leads')
          .select('*, empresas:empresa_id(nombre, facturacion), acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')
          .is('is_deleted', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('company_valuations')
          .select('*, empresas:empresa_id(nombre, facturacion), acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')
          .is('is_deleted', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('collaborator_applications')
          .select('*, acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')
          .is('is_deleted', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('acquisition_leads')
          .select('*, acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')
          .is('is_deleted', false)
          .order('created_at', { ascending: false }),
        supabase
          .from('advisor_valuations')
          .select('*, acquisition_channel:acquisition_channel_id(name), lead_form_ref:lead_form(name)')
          .order('created_at', { ascending: false }),
      ]);

      // Transform to unified format
      const unified: Contact[] = [
        ...(contactLeads || []).map(l => transformContact(l, 'contact', formDisplayMap)),
        ...(valuationLeads || []).map(l => transformValuation(l, formDisplayMap)),
        ...(collaboratorLeads || []).map(l => transformContact(l, 'collaborator', formDisplayMap)),
        ...(acquisitionLeads || []).map(l => transformContact(l, 'acquisition', formDisplayMap)),
        ...(advisorLeads || []).map(l => transformAdvisor(l, formDisplayMap)),
      ];

      // Filter out prospects
      const filtered = prospectKeys.length > 0
        ? unified.filter(c => !prospectKeys.includes(c.lead_status_crm || ''))
        : unified;

      // Sort by date
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setContacts(filtered);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({ title: 'Error', description: 'Error al cargar contactos', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Subscribe to realtime changes with unique channel ID
  useEffect(() => {
    fetchContacts();

    const channelName = `contacts-realtime-${instanceId.replace(/:/g, '-')}`;
    channelRef.current = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'contact_leads' }, () => {
        fetchContacts();
        // Cross-invalidation: also update prospects list
        queryClient.invalidateQueries({ queryKey: ['prospects'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'company_valuations' }, () => {
        fetchContacts();
        // Cross-invalidation: also update prospects list
        queryClient.invalidateQueries({ queryKey: ['prospects'] });
      })
      .subscribe();

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchContacts, instanceId]);

  // Apply filters with useMemo
  const filteredContacts = useMemo(() => {
    let result = [...contacts];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(c =>
        c.name?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.company?.toLowerCase().includes(search)
      );
    }

    // origin filter removed - no longer needed

    if (filters.status && filters.status !== 'all') {
      result = result.filter(c => c.status === filters.status || c.lead_status_crm === filters.status);
    }

    if (filters.emailStatus && filters.emailStatus !== 'all') {
      if (filters.emailStatus === 'opened') result = result.filter(c => c.email_opened);
      else if (filters.emailStatus === 'sent') result = result.filter(c => c.email_sent && !c.email_opened);
      else if (filters.emailStatus === 'not_contacted') result = result.filter(c => !c.email_sent);
    }

    if (filters.dateFrom) {
      result = result.filter(c => new Date(c.created_at) >= new Date(filters.dateFrom!));
    }
    if (filters.dateTo) {
      result = result.filter(c => new Date(c.created_at) <= new Date(filters.dateTo!));
    }

    if (filters.revenueMin) {
      result = result.filter(c => (c.empresa_facturacion ?? c.revenue ?? 0) >= filters.revenueMin!);
    }
  
  if (filters.revenueMax) {
    result = result.filter(c => (c.empresa_facturacion ?? c.revenue ?? 0) <= filters.revenueMax!);
  }
  
  if (filters.ebitdaMin) {
    result = result.filter(c => (c.ebitda ?? 0) >= filters.ebitdaMin!);
  }
  
  if (filters.ebitdaMax) {
    result = result.filter(c => (c.ebitda ?? 0) <= filters.ebitdaMax!);
  }
  
    // valuationType filter removed - no longer needed

    if (filters.acquisitionChannelId) {
      result = result.filter(c => c.acquisition_channel_id === filters.acquisitionChannelId);
    }

    if (filters.leadFormId) {
      // leadFormId is now a display_name; resolve to all matching form IDs
      result = result.filter(c => {
        if (!c.lead_form) return false;
        const formDisplayName = c.lead_form_name; // raw name from DB
        // Check if display_name matches (will be resolved via displayNameMap in ContactRow)
        // For filtering, we match against the lead_form_name or display_name
        return c.lead_form_display_name === filters.leadFormId;
      });
    }

    return result;
  }, [contacts, filters]);

  // Calculate stats
  const stats = useMemo((): ContactStats => {
    const byOrigin = contacts.reduce((acc, c) => {
      acc[c.origin] = (acc[c.origin] || 0) + 1;
      return acc;
    }, {} as Record<ContactOrigin, number>);

    const uniqueEmails = new Set(contacts.map(c => c.email.toLowerCase()));

    return {
      total: contacts.length,
      uniqueContacts: uniqueEmails.size,
      hot: contacts.filter(c => c.priority === 'hot').length,
      qualified: contacts.filter(c => c.status === 'qualified' || c.status === 'opportunity').length,
      byOrigin: { ...DEFAULT_STATS.byOrigin, ...byOrigin },
      totalValuation: contacts.reduce((sum, c) => sum + (c.final_valuation || 0), 0),
    };
  }, [contacts]);

  return {
    contacts: filteredContacts,
    allContacts: contacts,
    stats,
    isLoading,
    filters,
    applyFilters: setFilters,
    refetch: fetchContacts,
  };
};

// Transform helpers
function transformContact(lead: any, origin: ContactOrigin, formDisplayMap: Record<string, string>): Contact {
  return {
    id: lead.id,
    origin,
    name: lead.full_name || lead.contact_name || '',
    email: lead.email,
    phone: lead.phone,
    company: lead.company || lead.company_name,
    created_at: lead.created_at,
    lead_received_at: lead.lead_received_at || lead.created_at,
    status: lead.status || 'new',
    lead_status_crm: lead.lead_status_crm,
    assigned_to: lead.assigned_to,
    empresa_id: lead.empresa_id,
    empresa_nombre: lead.empresas?.nombre,
    empresa_facturacion: lead.empresas?.facturacion ? Number(lead.empresas.facturacion) : undefined,
    acquisition_channel_id: lead.acquisition_channel_id,
    acquisition_channel_name: lead.acquisition_channel?.name,
    lead_form: lead.lead_form,
    lead_form_name: lead.lead_form_ref?.name,
    lead_form_display_name: lead.lead_form ? formDisplayMap[lead.lead_form] : undefined,
    email_sent: lead.email_sent,
    email_sent_at: lead.email_sent_at,
    email_opened: lead.email_opened,
    priority: determinePriority(lead),
    is_hot_lead: determinePriority(lead) === 'hot',
  };
}

function transformValuation(lead: any, formDisplayMap: Record<string, string>): Contact {
  return {
    id: lead.id,
    origin: 'valuation',
    name: lead.contact_name || '',
    email: lead.email,
    phone: lead.phone,
    company: lead.company_name,
    created_at: lead.created_at,
    lead_received_at: lead.lead_received_at || lead.created_at,
    status: lead.valuation_status || 'pending',
    source_project: lead.source_project,
    cif: lead.cif,
    industry: lead.industry,
    employee_range: lead.employee_range,
    final_valuation: lead.final_valuation ? Number(lead.final_valuation) : undefined,
    ebitda: lead.ebitda ? Number(lead.ebitda) : undefined,
    revenue: lead.revenue ? Number(lead.revenue) : undefined,
    location: lead.location,
    email_sent: lead.email_sent,
    email_sent_at: lead.email_sent_at,
    email_opened: lead.email_opened,
    lead_status_crm: lead.lead_status_crm,
    assigned_to: lead.assigned_to,
    empresa_id: lead.empresa_id,
    empresa_nombre: lead.empresas?.nombre,
    empresa_facturacion: lead.empresas?.facturacion ? Number(lead.empresas.facturacion) : undefined,
    acquisition_channel_id: lead.acquisition_channel_id,
    acquisition_channel_name: lead.acquisition_channel?.name,
    lead_form: lead.lead_form,
    lead_form_name: lead.lead_form_ref?.name,
    lead_form_display_name: lead.lead_form ? formDisplayMap[lead.lead_form] : undefined,
    apollo_status: lead.apollo_status || 'none',
    apollo_candidates: lead.apollo_candidates,
    is_from_pro_valuation: lead.source_project?.includes('pro') || lead.referrer === 'Valoración Pro',
    priority: determinePriority(lead),
    is_hot_lead: determinePriority(lead) === 'hot',
  };
}

function transformAdvisor(lead: any, formDisplayMap: Record<string, string>): Contact {
  return {
    id: lead.id,
    origin: 'advisor',
    name: lead.contact_name || '',
    email: lead.email,
    phone: lead.phone,
    company: lead.company_name,
    created_at: lead.created_at,
    status: lead.email_sent ? 'contacted' : 'new',
    cif: lead.cif,
    industry: lead.firm_type,
    employee_range: lead.employee_range,
    revenue: lead.revenue ? Number(lead.revenue) : undefined,
    ebitda: lead.ebitda ? Number(lead.ebitda) : undefined,
    final_valuation: lead.final_valuation ? Number(lead.final_valuation) : undefined,
    email_sent: lead.email_sent,
    email_sent_at: lead.email_sent_at,
    acquisition_channel_id: lead.acquisition_channel_id,
    acquisition_channel_name: lead.acquisition_channel?.name,
    lead_form: lead.lead_form,
    lead_form_name: lead.lead_form_ref?.name,
    lead_form_display_name: lead.lead_form ? formDisplayMap[lead.lead_form] : undefined,
    priority: lead.ebitda && Number(lead.ebitda) > 50000 ? 'hot' : 'warm',
    is_hot_lead: lead.ebitda && Number(lead.ebitda) > 50000,
  };
}

function determinePriority(lead: any): 'hot' | 'warm' | 'cold' {
  if (lead.email_opened) return 'hot';
  if (lead.final_valuation && lead.final_valuation > 1000000) return 'hot';
  if (lead.status === 'qualified' || lead.status === 'opportunity') return 'hot';
  if (lead.email_sent) return 'warm';
  return 'cold';
}
