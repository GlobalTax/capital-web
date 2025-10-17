import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type ContactOrigin = 'contact' | 'valuation' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition';

export interface UnifiedContact {
  id: string;
  origin: ContactOrigin;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
  status: string;
  
  // Campos específicos por origen
  valuation_amount?: number;
  final_valuation?: number;
  ebitda?: number;
  revenue?: number;
  industry?: string;
  profession?: string;
  motivation?: string;
  company_size?: string;
  employee_range?: string;
  referral?: string;
  experience?: string;
  service_type?: string;
  country?: string;
  investment_budget?: string;
  sectors_of_interest?: string;
  acquisition_type?: string;
  target_timeline?: string;
  preferred_location?: string;
  location?: string;
  
  // Email tracking
  email_sent?: boolean;
  email_sent_at?: string;
  email_opened?: boolean;
  email_opened_at?: string;
  email_message_id?: string;
  
  // HubSpot tracking
  hubspot_sent?: boolean;
  hubspot_sent_at?: string;
  
  // UTM tracking
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  
  // Additional metadata
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  
  // Lead scoring
  is_hot_lead?: boolean;
  priority?: 'hot' | 'warm' | 'cold';
  score?: number;
  
  // CRM fields
  lead_status_crm?: 'nuevo' | 'contactado' | 'calificado' | 'descartado' | 'contactando' | 'en_espera' | 'propuesta_enviada' | 'negociacion' | 'ganado' | 'perdido' | 'archivado' | null;
  assigned_to?: string;
  assigned_to_name?: string | null;
  
  // Legacy compatibility
  source?: string;
}

export interface ContactFilters {
  search?: string;
  origin?: ContactOrigin | 'all';
  status?: string;
  emailStatus?: 'all' | 'opened' | 'sent' | 'not_contacted';
  dateFrom?: string;
  dateTo?: string;
  dateRangeLabel?: string;
  utmSource?: string;
  budget?: string;
  sector?: string;
  companySize?: string;
}

export interface ContactStats {
  total: number;
  hot: number;
  qualified: number;
  byOrigin: Record<ContactOrigin, number>;
  growth: number;
  potentialValue: number;
  totalValuation: number;
}

export const useUnifiedContacts = () => {
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<UnifiedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<ContactStats>({
    total: 0,
    hot: 0,
    qualified: 0,
    byOrigin: {
      contact: 0,
      valuation: 0,
      collaborator: 0,
      general: 0,
      acquisition: 0,
      company_acquisition: 0,
    },
    growth: 0,
    potentialValue: 0,
    totalValuation: 0,
  });
  const [filters, setFilters] = useState<ContactFilters>({
    origin: 'all',
    emailStatus: 'all',
  });
  const { toast } = useToast();

  const fetchUnifiedContacts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch contact_leads (exclude soft deleted)
      const { data: contactLeads, error: contactError } = await supabase
        .from('contact_leads')
        .select('*, lead_status_crm, assigned_to')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      // Fetch company_valuations (exclude soft deleted)
      const { data: valuationLeads, error: valuationError } = await supabase
        .from('company_valuations')
        .select('*, lead_status_crm, assigned_to')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (valuationError) throw valuationError;

      // Fetch collaborator_applications (exclude soft deleted)
      const { data: collaboratorLeads, error: collaboratorError } = await supabase
        .from('collaborator_applications')
        .select('*, lead_status_crm, assigned_to')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (collaboratorError) throw collaboratorError;

      // Fetch general_contact_leads (if exists, exclude soft deleted)
      const { data: generalLeads, error: generalError } = await supabase
        .from('general_contact_leads')
        .select('*')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      // Fetch acquisition_leads (exclude soft deleted)
      const { data: acquisitionLeads, error: acquisitionError } = await supabase
        .from('acquisition_leads')
        .select('*')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (acquisitionError) throw acquisitionError;

      // Fetch company_acquisition_inquiries (exclude soft deleted)
      const { data: companyAcquisitionLeads, error: companyAcquisitionError } = await supabase
        .from('company_acquisition_inquiries')
        .select('*')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (companyAcquisitionError) throw companyAcquisitionError;

      // Transform and unify data
      const unifiedData: UnifiedContact[] = [
        // Contact leads
        ...(contactLeads || []).map(lead => ({
          id: lead.id,
          origin: 'contact' as const,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          created_at: lead.created_at,
          status: lead.status,
          company_size: lead.company_size,
          country: lead.country,
          referral: lead.referral,
          service_type: lead.service_type,
          sectors_of_interest: lead.sectors_of_interest,
          investment_budget: lead.investment_budget,
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          email_opened: lead.email_opened,
          email_opened_at: lead.email_opened_at,
          email_message_id: lead.email_message_id,
          hubspot_sent: lead.hubspot_sent,
          hubspot_sent_at: lead.hubspot_sent_at,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
        })),
        
        // Valuation leads
        ...(valuationLeads || []).map(lead => ({
          id: lead.id,
          origin: 'valuation' as const,
          name: lead.contact_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company_name,
          created_at: lead.created_at,
          status: lead.valuation_status || 'pending',
          industry: lead.industry,
          employee_range: lead.employee_range,
          final_valuation: lead.final_valuation,
          ebitda: lead.ebitda,
          revenue: lead.revenue,
          valuation_amount: lead.final_valuation,
          location: lead.location,
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          email_opened: lead.email_opened,
          email_opened_at: lead.email_opened_at,
          email_message_id: lead.email_message_id,
          hubspot_sent: lead.hubspot_sent,
          hubspot_sent_at: lead.hubspot_sent_at,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
        })),
        
        // Collaborator applications
        ...(collaboratorLeads || []).map(lead => ({
          id: lead.id,
          origin: 'collaborator' as const,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          created_at: lead.created_at,
          status: lead.status,
          profession: lead.profession,
          motivation: lead.motivation,
          experience: lead.experience,
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          email_opened: lead.email_opened,
          email_opened_at: lead.email_opened_at,
          email_message_id: lead.email_message_id,
          hubspot_sent: lead.hubspot_sent,
          hubspot_sent_at: lead.hubspot_sent_at,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
        })),
        
        // General contact leads (if table exists)
        ...(generalLeads || []).map(lead => ({
          id: lead.id,
          origin: 'general' as const,
          name: lead.full_name || '',
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          created_at: lead.created_at,
          status: lead.status || 'new',
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          email_opened: lead.email_opened,
          email_opened_at: lead.email_opened_at,
          hubspot_sent: lead.hubspot_sent,
          hubspot_sent_at: lead.hubspot_sent_at,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          source: 'general',
        })),
        
        // Acquisition leads
        ...(acquisitionLeads || []).map(lead => ({
          id: lead.id,
          origin: 'acquisition' as const,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          created_at: lead.created_at,
          status: lead.status,
          sectors_of_interest: lead.sectors_of_interest,
          investment_budget: lead.investment_range,
          target_timeline: lead.target_timeline,
          acquisition_type: lead.acquisition_type,
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          hubspot_sent: lead.hubspot_sent,
          hubspot_sent_at: lead.hubspot_sent_at,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
        })),
        
        // Company acquisition inquiries
        ...(companyAcquisitionLeads || []).map(lead => ({
          id: lead.id,
          origin: 'company_acquisition' as const,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          created_at: lead.created_at,
          status: lead.status,
          sectors_of_interest: lead.sectors_of_interest,
          investment_budget: lead.investment_budget,
          target_timeline: lead.target_timeline,
          acquisition_type: lead.acquisition_type,
          preferred_location: lead.preferred_location,
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          email_opened: lead.email_opened,
          email_opened_at: lead.email_opened_at,
          hubspot_sent: lead.hubspot_sent,
          hubspot_sent_at: lead.hubspot_sent_at,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
        })),
      ];

      // Get all unique assigned_to IDs
      const assignedToIds = new Set(
        unifiedData
          .map(c => c.assigned_to)
          .filter(Boolean) as string[]
      );

      // Fetch admin names if there are any assigned contacts
      let adminNames: Record<string, string> = {};
      if (assignedToIds.size > 0) {
        const { data: admins } = await supabase
          .from('admin_users')
          .select('user_id, full_name')
          .in('user_id', Array.from(assignedToIds));
        
        adminNames = (admins || []).reduce((acc, admin) => {
          acc[admin.user_id] = admin.full_name;
          return acc;
        }, {} as Record<string, string>);
      }

      // Add admin names to each contact
      const unifiedDataWithNames = unifiedData.map(contact => ({
        ...contact,
        assigned_to_name: contact.assigned_to 
          ? adminNames[contact.assigned_to] || null
          : null,
      }));

      // Sort by creation date
      unifiedDataWithNames.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setContacts(unifiedDataWithNames);
      setFilteredContacts(unifiedDataWithNames);
      
      // Calculate stats
      calculateStats(unifiedDataWithNames);

    } catch (error) {
      console.error('Error fetching unified contacts:', error);
      toast({
        title: "Error",
        description: "Error al cargar los contactos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const determinePriority = (lead: any): 'hot' | 'warm' | 'cold' => {
    if (lead.email_opened) return 'hot';
    if (lead.email_sent && !lead.email_opened) return 'warm';
    if (lead.final_valuation && lead.final_valuation > 1000000) return 'hot';
    if (lead.status === 'qualified' || lead.status === 'opportunity') return 'hot';
    if (lead.status === 'contacted') return 'warm';
    return 'cold';
  };

  const isHotLead = (lead: any): boolean => {
    return determinePriority(lead) === 'hot';
  };

  const calculateStats = (contactsList: UnifiedContact[]) => {
    const hotLeads = contactsList.filter(c => c.priority === 'hot').length;
    const qualifiedLeads = contactsList.filter(c => 
      c.status === 'qualified' || c.status === 'opportunity'
    ).length;
    
    const byOrigin = contactsList.reduce((acc, contact) => {
      acc[contact.origin] = (acc[contact.origin] || 0) + 1;
      return acc;
    }, {} as Record<ContactOrigin, number>);

    const potentialValue = contactsList
      .filter(c => c.final_valuation)
      .reduce((sum, c) => sum + (c.final_valuation || 0), 0);

    // Calculate total valuation summing ALL valuations
    const totalValuation = contactsList
      .filter(c => c.final_valuation && c.final_valuation > 0)
      .reduce((sum, c) => sum + (c.final_valuation || 0), 0);

    setStats({
      total: contactsList.length,
      hot: hotLeads,
      qualified: qualifiedLeads,
      byOrigin,
      growth: 0, // TODO: Calculate based on previous period
      potentialValue,
      totalValuation,
    });
  };

  const applyFilters = (newFilters: ContactFilters) => {
    setFilters(newFilters);
    
    let filtered = [...contacts];

    // Search filter
    if (newFilters.search) {
      const search = newFilters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.company?.toLowerCase().includes(search)
      );
    }

    // Origin filter
    if (newFilters.origin && newFilters.origin !== 'all') {
      filtered = filtered.filter(c => c.origin === newFilters.origin);
    }

    // Status filter
    if (newFilters.status && newFilters.status !== 'all') {
      filtered = filtered.filter(c => c.status === newFilters.status);
    }

    // Email status filter
    if (newFilters.emailStatus && newFilters.emailStatus !== 'all') {
      if (newFilters.emailStatus === 'opened') {
        filtered = filtered.filter(c => c.email_opened);
      } else if (newFilters.emailStatus === 'sent') {
        filtered = filtered.filter(c => c.email_sent && !c.email_opened);
      } else if (newFilters.emailStatus === 'not_contacted') {
        filtered = filtered.filter(c => !c.email_sent);
      }
    }

    // Date range filter
    if (newFilters.dateFrom) {
      filtered = filtered.filter(c => 
        new Date(c.created_at) >= new Date(newFilters.dateFrom!)
      );
    }
    if (newFilters.dateTo) {
      filtered = filtered.filter(c => 
        new Date(c.created_at) <= new Date(newFilters.dateTo!)
      );
    }

    // UTM source filter
    if (newFilters.utmSource) {
      filtered = filtered.filter(c => c.utm_source === newFilters.utmSource);
    }

    // Budget filter
    if (newFilters.budget) {
      filtered = filtered.filter(c => c.investment_budget === newFilters.budget);
    }

    // Sector filter
    if (newFilters.sector) {
      filtered = filtered.filter(c => 
        c.industry === newFilters.sector || 
        c.sectors_of_interest?.includes(newFilters.sector!)
      );
    }

    // Company size filter
    if (newFilters.companySize) {
      filtered = filtered.filter(c => 
        c.company_size === newFilters.companySize ||
        c.employee_range === newFilters.companySize
      );
    }

    setFilteredContacts(filtered);
    calculateStats(filtered);
  };

  const updateContactStatus = async (contactId: string, origin: ContactOrigin, newStatus: string) => {
    try {
      const statusField = origin === 'valuation' ? 'valuation_status' : 'status';

      let error = null;
      
      if (origin === 'contact') {
        const result = await supabase
          .from('contact_leads')
          .update({ status: newStatus })
          .eq('id', contactId);
        error = result.error;
      } else if (origin === 'valuation') {
        const result = await supabase
          .from('company_valuations')
          .update({ valuation_status: newStatus })
          .eq('id', contactId);
        error = result.error;
      } else if (origin === 'collaborator') {
        const result = await supabase
          .from('collaborator_applications')
          .update({ status: newStatus })
          .eq('id', contactId);
        error = result.error;
      } else if (origin === 'acquisition') {
        const result = await supabase
          .from('acquisition_leads')
          .update({ status: newStatus })
          .eq('id', contactId);
        error = result.error;
      } else if (origin === 'company_acquisition') {
        const result = await supabase
          .from('company_acquisition_inquiries')
          .update({ status: newStatus })
          .eq('id', contactId);
        error = result.error;
      }

      if (error) throw error;

      await fetchUnifiedContacts();

      toast({
        title: "Estado actualizado",
        description: "El estado del contacto se ha actualizado correctamente",
      });

    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado del contacto",
        variant: "destructive",
      });
    }
  };

  const bulkUpdateStatus = async (contactIds: string[], newStatus: string) => {
    try {
      // Group by origin
      const byOrigin = contacts
        .filter(c => contactIds.includes(c.id))
        .reduce((acc, contact) => {
          if (!acc[contact.origin]) acc[contact.origin] = [];
          acc[contact.origin].push(contact.id);
          return acc;
        }, {} as Record<ContactOrigin, string[]>);

      // Update each origin group
      for (const [origin, ids] of Object.entries(byOrigin)) {
        let error = null;
        
        if (origin === 'contact') {
          const result = await supabase
            .from('contact_leads')
            .update({ status: newStatus })
            .in('id', ids);
          error = result.error;
        } else if (origin === 'valuation') {
          const result = await supabase
            .from('company_valuations')
            .update({ valuation_status: newStatus })
            .in('id', ids);
          error = result.error;
        } else if (origin === 'collaborator') {
          const result = await supabase
            .from('collaborator_applications')
            .update({ status: newStatus })
            .in('id', ids);
          error = result.error;
        } else if (origin === 'acquisition') {
          const result = await supabase
            .from('acquisition_leads')
            .update({ status: newStatus })
            .in('id', ids);
          error = result.error;
        } else if (origin === 'company_acquisition') {
          const result = await supabase
            .from('company_acquisition_inquiries')
            .update({ status: newStatus })
            .in('id', ids);
          error = result.error;
        }

        if (error) throw error;
      }

      await fetchUnifiedContacts();

      toast({
        title: "Estados actualizados",
        description: `${contactIds.length} contactos actualizados correctamente`,
      });

    } catch (error) {
      console.error('Error bulk updating contacts:', error);
      toast({
        title: "Error",
        description: "Error al actualizar los contactos",
        variant: "destructive",
      });
    }
  };

  const exportContacts = (format: 'excel' | 'csv' | 'crm' | 'email') => {
    // TODO: Implement export functionality
    toast({
      title: "Exportar contactos",
      description: `Exportando ${filteredContacts.length} contactos en formato ${format}`,
    });
  };

  useEffect(() => {
    fetchUnifiedContacts();
  }, []);

  return {
    contacts: filteredContacts,
    allContacts: contacts,
    isLoading,
    stats,
    filters,
    applyFilters,
    updateContactStatus,
    bulkUpdateStatus,
    exportContacts,
    refetch: fetchUnifiedContacts,
  };
};
