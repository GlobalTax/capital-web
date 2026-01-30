/**
 * Hook for fetching prospects (leads in prospect stage with linked empresa)
 * Prospects are leads whose status has is_prospect_stage = true
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useContactStatuses } from '@/hooks/useContactStatuses';

export interface Prospect {
  id: string;
  empresa_id: string;
  empresa_nombre: string;
  empresa_sector: string | null;
  empresa_ubicacion: string | null;
  empresa_facturacion: number | null;
  contact_name: string;
  contact_email: string;
  lead_status_crm: string | null;
  source_table: string;
  source_id: string;
  created_at: string;
  updated_at: string | null;
  acquisition_channel: string | null;
  contacts: Array<{
    name: string;
    email: string;
  }>;
}

export interface ProspectFilters {
  search: string;
  statusKey: string | null;
  channel: string | null;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export const useProspects = (filters?: ProspectFilters) => {
  const queryClient = useQueryClient();
  const { statuses } = useContactStatuses();
  
  // Get status keys that are marked as prospect stage
  const prospectStatusKeys = statuses
    .filter(s => (s as any).is_prospect_stage && s.is_active)
    .map(s => s.status_key);

  const query = useQuery({
    queryKey: ['prospects', prospectStatusKeys, filters],
    queryFn: async (): Promise<Prospect[]> => {
      if (prospectStatusKeys.length === 0) {
        return [];
      }

      // Fetch from company_valuations
      const { data: valuationLeads, error: valError } = await supabase
        .from('company_valuations')
        .select(`
          id,
          contact_name,
          email,
          lead_status_crm,
          created_at,
          updated_at,
          empresa_id,
          empresas:empresa_id (
            id,
            nombre,
            sector,
            ubicacion,
            facturacion
          )
        `)
        .in('lead_status_crm', prospectStatusKeys)
        .not('empresa_id', 'is', null)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (valError) {
        console.error('Error fetching valuation prospects:', valError);
      }

      // Fetch from contact_leads
      const { data: contactLeads, error: contactError } = await supabase
        .from('contact_leads')
        .select(`
          id,
          full_name,
          email,
          lead_status_crm,
          created_at,
          updated_at,
          empresa_id,
          company,
          empresas:empresa_id (
            id,
            nombre,
            sector,
            ubicacion,
            facturacion
          )
        `)
        .in('lead_status_crm', prospectStatusKeys)
        .not('empresa_id', 'is', null)
        .eq('is_deleted', false)
        .order('updated_at', { ascending: false });

      if (contactError) {
        console.error('Error fetching contact prospects:', contactError);
      }

      // Unify and group by empresa
      const empresaMap = new Map<string, Prospect>();

      // Process valuation leads
      (valuationLeads || []).forEach((lead: any) => {
        const empresa = lead.empresas;
        if (!empresa) return;

        const empresaId = empresa.id;
        
        if (empresaMap.has(empresaId)) {
          // Add contact to existing empresa
          const existing = empresaMap.get(empresaId)!;
          existing.contacts.push({
            name: lead.contact_name || 'Sin nombre',
            email: lead.email || '',
          });
        } else {
          // Create new prospect entry
          empresaMap.set(empresaId, {
            id: lead.id,
            empresa_id: empresaId,
            empresa_nombre: empresa.nombre || 'Sin nombre',
            empresa_sector: empresa.sector,
            empresa_ubicacion: empresa.ubicacion,
            empresa_facturacion: empresa.facturacion,
            contact_name: lead.contact_name || 'Sin nombre',
            contact_email: lead.email || '',
            lead_status_crm: lead.lead_status_crm,
            source_table: 'company_valuations',
            source_id: lead.id,
            created_at: lead.created_at,
            updated_at: lead.updated_at,
            acquisition_channel: null,
            contacts: [{
              name: lead.contact_name || 'Sin nombre',
              email: lead.email || '',
            }],
          });
        }
      });

      // Process contact leads
      (contactLeads || []).forEach((lead: any) => {
        const empresa = lead.empresas;
        if (!empresa) return;

        const empresaId = empresa.id;
        
        if (empresaMap.has(empresaId)) {
          // Add contact to existing empresa
          const existing = empresaMap.get(empresaId)!;
          existing.contacts.push({
            name: lead.full_name || 'Sin nombre',
            email: lead.email || '',
          });
        } else {
          // Create new prospect entry
          empresaMap.set(empresaId, {
            id: lead.id,
            empresa_id: empresaId,
            empresa_nombre: empresa.nombre || 'Sin nombre',
            empresa_sector: empresa.sector,
            empresa_ubicacion: empresa.ubicacion,
            empresa_facturacion: empresa.facturacion,
            contact_name: lead.full_name || 'Sin nombre',
            contact_email: lead.email || '',
            lead_status_crm: lead.lead_status_crm,
            source_table: 'contact_leads',
            source_id: lead.id,
            created_at: lead.created_at,
            updated_at: lead.updated_at,
            acquisition_channel: null,
            contacts: [{
              name: lead.full_name || 'Sin nombre',
              email: lead.email || '',
            }],
          });
        }
      });

      let prospects = Array.from(empresaMap.values());

      // Apply filters
      if (filters) {
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          prospects = prospects.filter(p =>
            p.empresa_nombre.toLowerCase().includes(searchLower) ||
            p.contact_name.toLowerCase().includes(searchLower) ||
            p.contact_email.toLowerCase().includes(searchLower)
          );
        }

        if (filters.statusKey) {
          prospects = prospects.filter(p => p.lead_status_crm === filters.statusKey);
        }

        if (filters.dateFrom) {
          prospects = prospects.filter(p => new Date(p.created_at) >= filters.dateFrom!);
        }

        if (filters.dateTo) {
          prospects = prospects.filter(p => new Date(p.created_at) <= filters.dateTo!);
        }
      }

      // Sort by updated_at descending
      prospects.sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateB - dateA;
      });

      return prospects;
    },
    enabled: prospectStatusKeys.length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  return {
    prospects: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    prospectStatusKeys,
    invalidate: () => queryClient.invalidateQueries({ queryKey: ['prospects'] }),
  };
};
