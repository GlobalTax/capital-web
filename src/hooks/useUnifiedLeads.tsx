
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedLead {
  id: string;
  origin: 'contact' | 'valuation' | 'collaborator';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  created_at: string;
  status: string;
  lead_status_crm?: string;
  assigned_to?: string;
  assigned_admin?: {
    full_name: string;
    email: string;
  };
  // Campos específicos
  valuation_amount?: number;
  industry?: string;
  profession?: string;
  motivation?: string;
  company_size?: string;
  referral?: string;
  final_valuation?: number;
  experience?: string;
}

export const useUnifiedLeads = () => {
  const [leads, setLeads] = useState<UnifiedLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    contact: 0,
    valuation: 0,
    collaborator: 0,
  });
  const { toast } = useToast();

  const fetchUnifiedLeads = async () => {
    try {
      setIsLoading(true);
      
      // Fetch contact leads with assigned admin
      const { data: contactLeads, error: contactError } = await supabase
        .from('contact_leads')
        .select(`
          *,
          assigned_admin:admin_users!contact_leads_assigned_to_fkey(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (contactError) console.error('Contact leads error:', contactError);

      // Fetch company valuations with assigned admin
      const { data: valuationLeads, error: valuationError } = await supabase
        .from('company_valuations')
        .select(`
          *,
          assigned_admin:admin_users!company_valuations_assigned_to_fkey(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (valuationError) console.error('Valuation leads error:', valuationError);

      // Fetch collaborator applications with assigned admin
      const { data: collaboratorLeads, error: collaboratorError } = await supabase
        .from('collaborator_applications')
        .select(`
          *,
          assigned_admin:admin_users!collaborator_applications_assigned_to_fkey(
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (collaboratorError) console.error('Collaborator leads error:', collaboratorError);

      // Transform and unify data
      const unifiedData: UnifiedLead[] = [
        // Contact leads
        ...(contactLeads || []).map((lead: any) => ({
          id: lead.id,
          origin: 'contact' as const,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          created_at: lead.created_at,
          status: lead.status,
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
          assigned_admin: lead.assigned_admin,
          company_size: lead.company_size,
          referral: lead.referral,
        })),
        
        // Valuation leads
        ...(valuationLeads || []).map((lead: any) => ({
          id: lead.id,
          origin: 'valuation' as const,
          name: lead.contact_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company_name,
          created_at: lead.created_at,
          status: 'pending',
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
          assigned_admin: lead.assigned_admin,
          industry: lead.industry,
          final_valuation: lead.final_valuation,
          valuation_amount: lead.final_valuation,
        })),
        
        // Collaborator applications
        ...(collaboratorLeads || []).map((lead: any) => ({
          id: lead.id,
          origin: 'collaborator' as const,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          created_at: lead.created_at,
          status: lead.status,
          lead_status_crm: lead.lead_status_crm,
          assigned_to: lead.assigned_to,
          assigned_admin: lead.assigned_admin,
          profession: lead.profession,
          motivation: lead.motivation,
          experience: lead.experience,
        })),
      ];

      // Sort by creation date
      unifiedData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setLeads(unifiedData);
      setStats({
        total: unifiedData.length,
        contact: contactLeads?.length || 0,
        valuation: valuationLeads?.length || 0,
        collaborator: collaboratorLeads?.length || 0,
      });

    } catch (error) {
      console.error('Error fetching unified leads:', error);
      toast({
        title: "Error",
        description: "Error al cargar los leads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateLeadStatus = async (leadId: string, origin: string, newStatus: string) => {
    try {
      // Handle each origin type with specific table queries
      if (origin === 'contact') {
        const { error } = await supabase
          .from('contact_leads')
          .update({ status: newStatus })
          .eq('id', leadId);

        if (error) throw error;
      } else if (origin === 'collaborator') {
        const { error } = await supabase
          .from('collaborator_applications')
          .update({ status: newStatus })
          .eq('id', leadId);

        if (error) throw error;
      } else if (origin === 'valuation') {
        // Las valoraciones no tienen status editable
        toast({
          title: "Información",
          description: "Las valoraciones no tienen estado editable",
          variant: "default",
        });
        return;
      } else {
        throw new Error('Origen de lead no válido');
      }

      // Refetch data to update the UI
      await fetchUnifiedLeads();

      toast({
        title: "Estado actualizado",
        description: "El estado del lead se ha actualizado correctamente",
      });

    } catch (error) {
      console.error('Error updating lead status:', error);
      toast({
        title: "Error",
        description: "Error al actualizar el estado del lead",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchUnifiedLeads();
  }, []);

  return {
    leads,
    stats,
    isLoading,
    refetch: fetchUnifiedLeads,
    updateLeadStatus,
  };
};
