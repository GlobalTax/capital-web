import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import { formatCurrency } from '@/shared/utils/format';

export type ContactOrigin = 'contact' | 'valuation' | 'collaborator' | 'general' | 'acquisition' | 'company_acquisition' | 'advisor';

export interface UnifiedContact {
  id: string;
  origin: ContactOrigin;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
  status: string;
  
  // Source tracking
  source_project?: string; // 🔥 NEW: Origen específico del lead (lp-calculadora-principal, lp-calculadora-fiscal, etc.)
  
  // Campos específicos por origen
  cif?: string;
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
  lead_status_crm?: 'nuevo' | 'contactado' | 'calificado' | 'descartado' | 'contactando' | 'en_espera' | 'propuesta_enviada' | 'negociacion' | 'ganado' | 'perdido' | 'archivado' | 'fase0_activo' | 'fase0_bloqueado' | 'mandato_propuesto' | 'mandato_firmado' | null;
  assigned_to?: string;
  assigned_to_name?: string | null;
  
  // 🔥 NEW: Recurrence tracking
  valuation_count?: number; // Número de valoraciones del mismo email
  
  // 🔥 NEW: Empresa vinculada
  empresa_id?: string;
  empresa_nombre?: string;
  empresa_facturacion?: number;
  // 🔥 NEW: Origen Valoración Pro
  is_from_pro_valuation?: boolean;
  
  // 🔥 NEW: Canal de adquisición
  acquisition_channel_id?: string;
  acquisition_channel_name?: string;
  acquisition_channel_category?: string;
  
  // 🔥 AI Company Summary
  ai_company_summary?: string;
  ai_company_summary_at?: string;

  // 🔥 NEW: Lead Form (Subcanal/Formulario de origen)
  lead_form?: string;
  lead_form_name?: string;

  // 🔥 Apollo enrichment fields
  apollo_status?: 'none' | 'running' | 'ok' | 'needs_review' | 'error';
  apollo_error?: string;
  apollo_org_id?: string;
  apollo_last_enriched_at?: string;
  apollo_org_data?: any;
  apollo_candidates?: any[];

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
  showUniqueContacts?: boolean;
  // Advanced filters for smart search
  revenueMin?: number;
  revenueMax?: number;
  ebitdaMin?: number;
  ebitdaMax?: number;
  employeeMin?: number;
  employeeMax?: number;
  location?: string;
  // 🔥 NEW: Channel filter
  acquisitionChannelId?: string;
  // 🔥 NEW: Lead Form filter
  leadFormId?: string;
  // 🔥 NEW: Valuation type filter (Pro vs Standard)
  valuationType?: 'all' | 'pro' | 'standard';
}

export interface ContactStats {
  total: number;
  uniqueContacts: number; // 🔥 NEW: Contactos únicos por email
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
    growth: 0,
    potentialValue: 0,
    totalValuation: 0,
  });
  const [filters, setFilters] = useState<ContactFilters>({
    origin: 'all',
    emailStatus: 'all',
    showUniqueContacts: false,
    valuationType: 'all',
  });
  const { toast } = useToast();

  const fetchUnifiedContacts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch contact_leads with linked empresa, acquisition channel, and lead form (exclude soft deleted)
      const { data: contactLeads, error: contactError } = await supabase
        .from('contact_leads')
        .select('*, lead_status_crm, assigned_to, empresa_id, acquisition_channel_id, lead_form, empresas:empresa_id(id, nombre, facturacion), acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name)')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      // Fetch company_valuations (exclude soft deleted) - include Apollo fields, lead form, and empresa data
      const { data: valuationLeads, error: valuationError } = await supabase
        .from('company_valuations')
        .select('*, lead_status_crm, assigned_to, lead_form, empresas:empresa_id(id, nombre, facturacion), acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name), apollo_status, apollo_error, apollo_org_id, apollo_last_enriched_at, apollo_org_data, apollo_candidates')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (valuationError) throw valuationError;

      // Fetch collaborator_applications (exclude soft deleted)
      const { data: collaboratorLeads, error: collaboratorError } = await supabase
        .from('collaborator_applications')
        .select('*, lead_status_crm, assigned_to, lead_form, acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name)')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (collaboratorError) throw collaboratorError;

      // Fetch general_contact_leads (if exists, exclude soft deleted)
      const { data: generalLeads, error: generalError } = await supabase
        .from('general_contact_leads')
        .select('*, lead_form, acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name)')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      // Fetch acquisition_leads (exclude soft deleted)
      const { data: acquisitionLeads, error: acquisitionError } = await supabase
        .from('acquisition_leads')
        .select('*, lead_form, acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name)')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (acquisitionError) throw acquisitionError;

      // Fetch company_acquisition_inquiries (exclude soft deleted)
      const { data: companyAcquisitionLeads, error: companyAcquisitionError } = await supabase
        .from('company_acquisition_inquiries')
        .select('*, lead_form, acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name)')
        .is('is_deleted', false)
        .order('created_at', { ascending: false });

      if (companyAcquisitionError) throw companyAcquisitionError;

      // Fetch advisor_valuations
      const { data: advisorLeads, error: advisorError } = await supabase
        .from('advisor_valuations')
        .select('*, lead_form, acquisition_channel:acquisition_channel_id(id, name, category), lead_form_ref:lead_form(id, name)')
        .order('created_at', { ascending: false });

      if (advisorError) console.error('Error fetching advisor valuations:', advisorError);

      // 🔥 NEW: Fetch professional_valuations linked to contact_leads
      const { data: proValuations, error: proValuationsError } = await supabase
        .from('professional_valuations')
        .select('linked_lead_id, valuation_central, valuation_low, valuation_high, normalized_ebitda, sector')
        .eq('linked_lead_type', 'contact')
        .not('linked_lead_id', 'is', null);

      if (proValuationsError) console.error('Error fetching professional valuations:', proValuationsError);

      // Create map of professional valuations by linked_lead_id
      const proValuationMap = (proValuations || []).reduce((acc, pv) => {
        if (pv.linked_lead_id) {
          acc[pv.linked_lead_id] = pv;
        }
        return acc;
      }, {} as Record<string, { valuation_central: number | null; valuation_low: number | null; valuation_high: number | null; normalized_ebitda: number | null; sector: string | null }>);

      // Transform and unify data
      const unifiedData: UnifiedContact[] = [
        // Contact leads
        ...(contactLeads || []).map(lead => {
          // Check if this contact has a linked professional valuation
          const proValuation = proValuationMap[lead.id];
          
          return {
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
            hubspot_sent: (lead as any).hubspot_sent || false,
            hubspot_sent_at: (lead as any).hubspot_sent_at || null,
            ip_address: lead.ip_address?.toString(),
            user_agent: lead.user_agent,
            priority: determinePriority(lead),
            is_hot_lead: isHotLead(lead),
            lead_status_crm: lead.lead_status_crm,
            assigned_to: lead.assigned_to,
            // 🔥 NEW: Empresa vinculada
            empresa_id: lead.empresa_id,
            empresa_nombre: (lead.empresas as any)?.nombre || null,
            empresa_facturacion: (lead.empresas as any)?.facturacion != null ? Number((lead.empresas as any).facturacion) : undefined,
            // 🔥 NEW: Indicador de origen Valoración Pro
            is_from_pro_valuation: lead.referral === 'Valoración Pro',
            // 🔥 NEW: Canal de adquisición
            acquisition_channel_id: lead.acquisition_channel_id,
            acquisition_channel_name: (lead.acquisition_channel as any)?.name || null,
            acquisition_channel_category: (lead.acquisition_channel as any)?.category || null,
            // 🔥 NEW: Lead Form (Formulario de origen)
            lead_form: lead.lead_form,
            lead_form_name: (lead.lead_form_ref as any)?.name || null,
            // 🔥 NEW: Datos de Valoración Pro vinculada
            final_valuation: proValuation?.valuation_central != null ? Number(proValuation.valuation_central) : undefined,
            ebitda: proValuation?.normalized_ebitda != null ? Number(proValuation.normalized_ebitda) : undefined,
            industry: proValuation?.sector || undefined,
          };
        }),
        
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
          source_project: lead.source_project, // 🔥 NEW: Identificador del origen
          cif: lead.cif,
          industry: lead.industry,
          employee_range: lead.employee_range,
          final_valuation: lead.final_valuation != null ? Number(lead.final_valuation) : undefined,
          ebitda: lead.ebitda != null ? Number(lead.ebitda) : undefined,
          revenue: lead.revenue != null ? Number(lead.revenue) : undefined,
          valuation_amount: lead.final_valuation != null ? Number(lead.final_valuation) : undefined,
          location: lead.location,
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          email_opened: lead.email_opened,
          email_opened_at: lead.email_opened_at,
          email_message_id: lead.email_message_id,
          hubspot_sent: (lead as any).hubspot_sent || false,
          hubspot_sent_at: (lead as any).hubspot_sent_at || null,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
          // Canal de adquisición
          acquisition_channel_id: lead.acquisition_channel_id,
          acquisition_channel_name: (lead.acquisition_channel as any)?.name || null,
          acquisition_channel_category: (lead.acquisition_channel as any)?.category || null,
          // Lead Form (Formulario de origen)
          lead_form: (lead as any).lead_form,
          lead_form_name: (lead.lead_form_ref as any)?.name || null,
          // 🔥 Apollo enrichment fields
          apollo_status: (lead as any).apollo_status || 'none',
          apollo_error: (lead as any).apollo_error,
          apollo_org_id: (lead as any).apollo_org_id,
          apollo_last_enriched_at: (lead as any).apollo_last_enriched_at,
          apollo_org_data: (lead as any).apollo_org_data,
          apollo_candidates: (lead as any).apollo_candidates,
          // 🔥 Empresa vinculada
          empresa_id: (lead as any).empresa_id,
          empresa_nombre: (lead.empresas as any)?.nombre || null,
          empresa_facturacion: (lead.empresas as any)?.facturacion != null ? Number((lead.empresas as any).facturacion) : undefined,
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
          hubspot_sent: (lead as any).hubspot_sent || false,
          hubspot_sent_at: (lead as any).hubspot_sent_at || null,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
          // Canal de adquisición
          acquisition_channel_id: (lead as any).acquisition_channel_id,
          acquisition_channel_name: (lead.acquisition_channel as any)?.name || null,
          acquisition_channel_category: (lead.acquisition_channel as any)?.category || null,
          // Lead Form (Formulario de origen)
          lead_form: (lead as any).lead_form,
          lead_form_name: (lead.lead_form_ref as any)?.name || null,
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
          hubspot_sent: (lead as any).hubspot_sent || false,
          hubspot_sent_at: (lead as any).hubspot_sent_at || null,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          source: 'general',
          // 🔥 NEW: Canal de adquisición
          acquisition_channel_id: (lead as any).acquisition_channel_id,
          acquisition_channel_name: (lead.acquisition_channel as any)?.name || null,
          acquisition_channel_category: (lead.acquisition_channel as any)?.category || null,
          // Lead Form (Formulario de origen)
          lead_form: (lead as any).lead_form,
          lead_form_name: (lead.lead_form_ref as any)?.name || null,
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
          hubspot_sent: (lead as any).hubspot_sent || false,
          hubspot_sent_at: (lead as any).hubspot_sent_at || null,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          // Canal de adquisición
          acquisition_channel_id: (lead as any).acquisition_channel_id,
          acquisition_channel_name: (lead.acquisition_channel as any)?.name || null,
          acquisition_channel_category: (lead.acquisition_channel as any)?.category || null,
          // Lead Form (Formulario de origen)
          lead_form: (lead as any).lead_form,
          lead_form_name: (lead.lead_form_ref as any)?.name || null,
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
          hubspot_sent: (lead as any).hubspot_sent || false,
          hubspot_sent_at: (lead as any).hubspot_sent_at || null,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          utm_source: lead.utm_source,
          utm_medium: lead.utm_medium,
          utm_campaign: lead.utm_campaign,
          referrer: lead.referrer,
          priority: determinePriority(lead),
          is_hot_lead: isHotLead(lead),
          // Canal de adquisición
          acquisition_channel_id: (lead as any).acquisition_channel_id,
          acquisition_channel_name: (lead.acquisition_channel as any)?.name || null,
          acquisition_channel_category: (lead.acquisition_channel as any)?.category || null,
          // Lead Form (Formulario de origen)
          lead_form: (lead as any).lead_form,
          lead_form_name: (lead.lead_form_ref as any)?.name || null,
        })),
        
        // Advisor leads (calculadora de asesores)
        ...(advisorLeads || []).map(lead => ({
          id: lead.id,
          origin: 'advisor' as const,
          name: lead.contact_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company_name,
          created_at: lead.created_at,
          status: lead.email_sent ? 'contacted' : 'new',
          source_project: 'lp-calculadora-asesores',
          cif: lead.cif,
          industry: lead.firm_type,
          employee_range: lead.employee_range,
          revenue: lead.revenue ? Number(lead.revenue) : undefined,
          ebitda: lead.ebitda ? Number(lead.ebitda) : undefined,
          final_valuation: lead.final_valuation ? Number(lead.final_valuation) : undefined,
          valuation_amount: lead.ebitda_valuation ? Number(lead.ebitda_valuation) : undefined,
          email_sent: lead.email_sent,
          email_sent_at: lead.email_sent_at,
          ip_address: lead.ip_address?.toString(),
          user_agent: lead.user_agent,
          priority: (lead.ebitda && Number(lead.ebitda) > 50000 ? 'hot' : 'warm') as 'hot' | 'warm' | 'cold',
          is_hot_lead: lead.ebitda && Number(lead.ebitda) > 50000,
          // Canal de adquisición
          acquisition_channel_id: (lead as any).acquisition_channel_id,
          acquisition_channel_name: (lead.acquisition_channel as any)?.name || null,
          acquisition_channel_category: (lead.acquisition_channel as any)?.category || null,
          // Lead Form (Formulario de origen)
          lead_form: (lead as any).lead_form,
          lead_form_name: (lead.lead_form_ref as any)?.name || null,
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

      // 🔥 NEW: Calculate valuation count per email
      const emailCounts = unifiedData.reduce((acc, contact) => {
        const email = contact.email.toLowerCase();
        acc[email] = (acc[email] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Add admin names and valuation count to each contact
      const unifiedDataWithNames = unifiedData.map(contact => ({
        ...contact,
        assigned_to_name: contact.assigned_to 
          ? adminNames[contact.assigned_to] || null
          : null,
        valuation_count: emailCounts[contact.email.toLowerCase()] || 1,
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

    // 🔥 NEW: Calculate unique contacts by email
    const uniqueEmails = new Set(contactsList.map(c => c.email.toLowerCase()));

    setStats({
      total: contactsList.length,
      uniqueContacts: uniqueEmails.size,
      hot: hotLeads,
      qualified: qualifiedLeads,
      byOrigin,
      growth: 0, // TODO: Calculate based on previous period
      potentialValue,
      totalValuation,
    });
  };

  // 🔥 NEW: Group contacts by email (for unique contacts view)
  const groupContactsByEmail = (contactsList: UnifiedContact[]): UnifiedContact[] => {
    const grouped = new Map<string, UnifiedContact[]>();
    
    contactsList.forEach(contact => {
      const key = contact.email.toLowerCase();
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(contact);
    });
    
    // Return only the most recent contact per email
    return Array.from(grouped.values()).map(group => {
      // Sort by created_at descending
      group.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      return group[0]; // Return most recent
    });
  };

  const applyFilters = (newFilters: ContactFilters) => {
    setFilters(newFilters);
    
    let filtered = [...contacts];

    // 🔥 NEW: Apply unique contacts filter first if enabled
    if (newFilters.showUniqueContacts) {
      filtered = groupContactsByEmail(filtered);
    }

    // Search filter - normalized text search including empresa_nombre
    // 🔥 Improved: Search by individual words for better matching
    if (newFilters.search) {
      // Normalize text: lowercase + remove accents
      const normalizeText = (text: string) => 
        text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
      
      const searchInput = normalizeText(newFilters.search);
      // Split into individual terms for word-based matching
      const searchTerms = searchInput.split(/\s+/).filter(t => t.length >= 2);
      
      filtered = filtered.filter(c => {
        const name = normalizeText(c.name || '');
        const email = normalizeText(c.email || '');
        const company = normalizeText(c.company || '');
        const empresaNombre = normalizeText(c.empresa_nombre || '');
        const industry = normalizeText(c.industry || '');
        const location = normalizeText(c.location || '');
        
        // Concatenate all searchable fields
        const allFields = `${name} ${email} ${company} ${empresaNombre} ${industry} ${location}`;
        
        // Match if ALL search terms are found in any field combination
        // OR if the complete search string is found
        return searchTerms.every(term => allFields.includes(term)) ||
               allFields.includes(searchInput);
      });
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

    // 🔥 Revenue filter - prioritize empresa_facturacion over revenue
    if (newFilters.revenueMin) {
      filtered = filtered.filter(c => {
        const facturacion = c.empresa_facturacion ?? c.revenue ?? 0;
        return facturacion >= newFilters.revenueMin!;
      });
    }
    if (newFilters.revenueMax) {
      filtered = filtered.filter(c => {
        const facturacion = c.empresa_facturacion ?? c.revenue ?? Infinity;
        return facturacion <= newFilters.revenueMax!;
      });
    }

    // 🔥 EBITDA filter
    if (newFilters.ebitdaMin) {
      filtered = filtered.filter(c => 
        (c.ebitda || 0) >= newFilters.ebitdaMin!
      );
    }
    if (newFilters.ebitdaMax) {
      filtered = filtered.filter(c => 
        (c.ebitda || Infinity) <= newFilters.ebitdaMax!
      );
    }

    // 🔥 NEW: Location filter (fuzzy match)
    if (newFilters.location) {
      const loc = newFilters.location.toLowerCase();
      filtered = filtered.filter(c => 
        c.location?.toLowerCase().includes(loc) ||
        c.preferred_location?.toLowerCase().includes(loc) ||
        c.country?.toLowerCase().includes(loc)
      );
    }

    // 🔥 NEW: Employee range filter
    if (newFilters.employeeMin || newFilters.employeeMax) {
      filtered = filtered.filter(c => {
        const empCount = parseEmployeeRange(c.employee_range);
        if (newFilters.employeeMin && empCount < newFilters.employeeMin) return false;
        if (newFilters.employeeMax && empCount > newFilters.employeeMax) return false;
        return true;
      });
    }

    // 🔥 NEW: Acquisition channel filter
    if (newFilters.acquisitionChannelId) {
      filtered = filtered.filter(c => 
        c.acquisition_channel_id === newFilters.acquisitionChannelId
      );
    }

    // 🔥 NEW: Lead Form filter
    if (newFilters.leadFormId) {
      filtered = filtered.filter(c => 
        c.lead_form === newFilters.leadFormId
      );
    }

    // 🔥 NEW: Valuation Type filter (Pro vs Standard)
    if (newFilters.valuationType && newFilters.valuationType !== 'all') {
      if (newFilters.valuationType === 'pro') {
        filtered = filtered.filter(c => c.is_from_pro_valuation === true);
      } else if (newFilters.valuationType === 'standard') {
        filtered = filtered.filter(c => !c.is_from_pro_valuation);
      }
    }

    setFilteredContacts(filtered);
    calculateStats(filtered);
  };

  // Helper to parse employee range strings like "1-10", "11-50", "50+"
  const parseEmployeeRange = (range?: string): number => {
    if (!range) return 0;
    // Extract first number from the range
    const match = range.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
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

  const exportContacts = (exportFormat: 'excel' | 'csv' | 'crm' | 'email') => {
    console.log('✔ Botón Exportar (useUnifiedContacts) pulsado');
    console.log('📊 Formato solicitado:', exportFormat);
    console.log('📋 Contactos filtrados:', filteredContacts.length);
    
    if (!filteredContacts.length) {
      console.warn('⚠ No hay contactos para exportar con los filtros actuales');
      toast({
        title: "Sin contactos",
        description: "No hay contactos para exportar con los filtros actuales",
        variant: "destructive",
      });
      return;
    }

    if (exportFormat !== 'excel') {
      console.log('ℹ Formato no implementado todavía:', exportFormat);
      toast({
        title: "Exportar contactos",
        description: `Exportando ${filteredContacts.length} contactos en formato ${exportFormat}`,
      });
      return;
    }

    try {
      console.log('🔄 Exportando', filteredContacts.length, 'contactos a Excel...');
      console.log('📋 Ejemplo de contacto:', filteredContacts[0]);
      
      // Calculate email-based statistics for each contact
      const emailStats = filteredContacts.reduce((acc, c) => {
        const key = c.email.toLowerCase();
        if (!acc[key]) {
          acc[key] = {
            count: 0,
            valuations: [] as number[],
            dates: [] as Date[],
          };
        }
        acc[key].count++;
        if (c.final_valuation) acc[key].valuations.push(c.final_valuation);
        acc[key].dates.push(new Date(c.created_at));
        return acc;
      }, {} as Record<string, { count: number; valuations: number[]; dates: Date[] }>);
      
      // Preparar datos con validación y nuevas columnas
      const excelData = filteredContacts.map(contact => {
        const stats = emailStats[contact.email.toLowerCase()];
        const sortedDates = stats.dates.sort((a, b) => a.getTime() - b.getTime());
        const maxValuation = stats.valuations.length > 0 ? Math.max(...stats.valuations) : 0;
        const avgValuation = stats.valuations.length > 0 
          ? stats.valuations.reduce((sum, v) => sum + v, 0) / stats.valuations.length 
          : 0;

        return {
          'Origen': contact.origin === 'valuation' ? 'Valoración' :
                   contact.origin === 'contact' ? 'Contacto' :
                   contact.origin === 'collaborator' ? 'Colaborador' :
                   contact.origin === 'general' ? 'General' :
                   contact.origin === 'acquisition' ? 'Adquisición' :
                   contact.origin === 'company_acquisition' ? 'Adq. Empresa' :
                   contact.origin === 'advisor' ? 'Asesor' : contact.origin,
          'Nombre': contact.name || '',
          'Email': contact.email || '',
          'Teléfono': contact.phone || '',
          'Empresa': contact.company || '',
          'CIF': contact.cif || '-',
          'Sector': contact.industry || contact.sectors_of_interest || '',
          'Empleados': contact.employee_range || '',
          'Facturación': contact.revenue 
            ? formatCurrency(contact.revenue, 'EUR')
            : '',
          'EBITDA': contact.ebitda 
            ? formatCurrency(contact.ebitda, 'EUR')
            : '',
          'Valoración': contact.final_valuation 
            ? formatCurrency(contact.final_valuation, 'EUR')
            : '',
          'Nº Valoraciones': stats.count,
          'Primera Valoración': sortedDates.length > 0 
            ? format(sortedDates[0], 'dd/MM/yyyy', { locale: es })
            : '',
          'Última Valoración': sortedDates.length > 0 
            ? format(sortedDates[sortedDates.length - 1], 'dd/MM/yyyy', { locale: es })
            : '',
          'Valoración Máxima': maxValuation > 0 
            ? formatCurrency(maxValuation, 'EUR')
            : '',
          'Valoración Promedio': avgValuation > 0 
            ? formatCurrency(avgValuation, 'EUR')
            : '',
          'Ubicación': contact.location || contact.country || '',
          'Estado CRM': contact.lead_status_crm || contact.status || '',
          'Fecha': contact.created_at 
            ? format(new Date(contact.created_at), 'dd/MM/yyyy', { locale: es })
            : '',
          'Asignado a': contact.assigned_to_name || '',
          'Email Enviado': contact.email_sent ? 'Sí' : 'No',
          'Email Abierto': contact.email_opened ? 'Sí' : 'No',
          'Prioridad': contact.priority || '',
          'Presupuesto': contact.investment_budget || '',
          'Origen Proyecto': contact.source_project || '',
        };
      });

      console.log('📊 Datos preparados:', excelData.length, 'filas');

      // Crear libro de Excel
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contactos');

      // Nombre del archivo con fecha
      const fileName = `contactos_${format(new Date(), 'yyyy-MM-dd_HHmm', { locale: es })}.xlsx`;
      
      console.log('💾 Generando archivo:', fileName);
      
      // Intentar primero writeFile (método simple)
      try {
        XLSX.writeFile(workbook, fileName);
        console.log('✅ Excel descargado con writeFile');
        toast({
          title: "Excel exportado",
          description: `${filteredContacts.length} contactos exportados correctamente`,
        });
        return;
      } catch (writeFileError) {
        console.warn('⚠ writeFile falló, probando método Blob', writeFileError);
      }

      // Fallback: Método Blob para mayor compatibilidad en sandbox
      console.log('🔄 Intentando descarga con Blob...');
      const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      console.log('⬇ Lanzando descarga de', fileName);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Excel exportado correctamente con Blob');
      toast({
        title: "Excel exportado",
        description: `${filteredContacts.length} contactos exportados correctamente`,
      });
    } catch (error) {
      console.error('❌ Error al exportar Excel:', error);
      toast({
        title: "Error al exportar",
        description: "No se pudo exportar el archivo Excel",
        variant: "destructive",
      });
    }
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
    groupContactsByEmail,
  };
};
