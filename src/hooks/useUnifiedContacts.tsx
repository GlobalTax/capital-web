import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'customer' | 'lost';
  source: 'contact_lead' | 'apollo' | 'lead_score';
  score?: number;
  industry?: string;
  location?: string;
  last_activity?: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  notes?: string;
  is_hot_lead?: boolean;
  company_domain?: string;
  title?: string;
  department?: string;
  linkedin_url?: string;
}

export interface ContactFilters {
  search?: string;
  status?: string;
  source?: string;
  minScore?: number;
  maxScore?: number;
  industry?: string;
  isHotLead?: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const useUnifiedContacts = () => {
  const [contacts, setContacts] = useState<UnifiedContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<UnifiedContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<ContactFilters>({});
  const { toast } = useToast();

  // Fetch and unify all contacts from different sources
  const fetchUnifiedContacts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch contact leads
      const { data: contactLeads, error: contactLeadsError } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactLeadsError) throw contactLeadsError;

      // Fetch Apollo contacts
      const { data: apolloContacts, error: apolloError } = await supabase
        .from('apollo_contacts')
        .select('*')
        .order('created_at', { ascending: false });

      if (apolloError) throw apolloError;

      // Fetch lead scores
      const { data: leadScores, error: leadScoresError } = await supabase
        .from('lead_scores')
        .select('*')
        .order('last_activity', { ascending: false });

      if (leadScoresError) throw leadScoresError;

      // Unify contact data
      const unifiedData: UnifiedContact[] = [];

      // Process contact leads
      contactLeads?.forEach(lead => {
        unifiedData.push({
          id: lead.id,
          name: lead.full_name,
          email: lead.email,
          phone: lead.phone,
          company: lead.company,
          status: lead.status as any || 'new',
          source: 'contact_lead',
          location: lead.country,
          created_at: lead.created_at,
          updated_at: lead.updated_at,
          company_domain: extractDomainFromEmail(lead.email)
        });
      });

      // Process Apollo contacts
      apolloContacts?.forEach(contact => {
        unifiedData.push({
          id: contact.id,
          name: contact.full_name || `${contact.first_name} ${contact.last_name}`,
          email: contact.email || '',
          phone: contact.phone,
          company: contact.company_domain,
          status: 'new',
          source: 'apollo',
          score: contact.contact_score || 0,
          location: (contact.apollo_data as any)?.location || '',
          created_at: contact.created_at,
          updated_at: contact.updated_at,
          title: contact.title,
          department: contact.department,
          linkedin_url: contact.linkedin_url,
          company_domain: contact.company_domain || undefined
        });
      });

      // Process lead scores (visitor data)
      leadScores?.forEach(score => {
        if (score.email || score.contact_name) {
          unifiedData.push({
            id: score.id,
            name: score.contact_name || 'Visitante Anónimo',
            email: score.email || '',
            company: score.company_name || score.company_domain,
            status: score.lead_status === 'hot' ? 'qualified' : 'new',
            source: 'lead_score',
            score: score.total_score || 0,
            industry: score.industry,
            location: score.location,
            last_activity: score.last_activity,
            created_at: score.updated_at || new Date().toISOString(),
            is_hot_lead: score.is_hot_lead,
            company_domain: score.company_domain || undefined,
            notes: score.notes
          });
        }
      });

      // Remove duplicates based on email
      const uniqueContacts = unifiedData.filter((contact, index, self) => 
        contact.email && index === self.findIndex(c => c.email === contact.email)
      );

      setContacts(uniqueContacts);
      setFilteredContacts(uniqueContacts);
    } catch (error) {
      console.error('Error fetching unified contacts:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los contactos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters
  const applyFilters = (newFilters: ContactFilters) => {
    setFilters(newFilters);
    
    let filtered = [...contacts];

    // Search filter
    if (newFilters.search) {
      const searchTerm = newFilters.search.toLowerCase();
      filtered = filtered.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm) ||
        contact.email.toLowerCase().includes(searchTerm) ||
        contact.company?.toLowerCase().includes(searchTerm) ||
        contact.phone?.includes(searchTerm)
      );
    }

    // Status filter
    if (newFilters.status && newFilters.status !== 'all') {
      filtered = filtered.filter(contact => contact.status === newFilters.status);
    }

    // Source filter
    if (newFilters.source && newFilters.source !== 'all') {
      filtered = filtered.filter(contact => contact.source === newFilters.source);
    }

    // Score range filter
    if (newFilters.minScore !== undefined) {
      filtered = filtered.filter(contact => (contact.score || 0) >= newFilters.minScore!);
    }
    if (newFilters.maxScore !== undefined) {
      filtered = filtered.filter(contact => (contact.score || 0) <= newFilters.maxScore!);
    }

    // Hot lead filter
    if (newFilters.isHotLead) {
      filtered = filtered.filter(contact => contact.is_hot_lead || (contact.score || 0) >= 80);
    }

    // Industry filter
    if (newFilters.industry && newFilters.industry !== 'all') {
      filtered = filtered.filter(contact => contact.industry === newFilters.industry);
    }

    // Date range filter
    if (newFilters.dateRange) {
      const startDate = new Date(newFilters.dateRange.start);
      const endDate = new Date(newFilters.dateRange.end);
      
      filtered = filtered.filter(contact => {
        const contactDate = new Date(contact.created_at);
        return contactDate >= startDate && contactDate <= endDate;
      });
    }

    setFilteredContacts(filtered);
  };

  // Update contact status
  const updateContactStatus = async (contactId: string, status: string, source: string) => {
    try {
      let error = null;
      
      if (source === 'contact_lead') {
        const { error: updateError } = await supabase
          .from('contact_leads')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', contactId);
        error = updateError;
      } else if (source === 'lead_score') {
        const { error: updateError } = await supabase
          .from('lead_scores')
          .update({ 
            lead_status: status === 'qualified' ? 'hot' : status,
            updated_at: new Date().toISOString() 
          })
          .eq('id', contactId);
        error = updateError;
      }

      if (error) throw error;

      // Update local state
      setContacts(prev => prev.map(contact => 
        contact.id === contactId ? { ...contact, status: status as any } : contact
      ));
      
      // Reapply filters
      applyFilters(filters);

      toast({
        title: "Éxito",
        description: "Estado del contacto actualizado correctamente"
      });
    } catch (error) {
      console.error('Error updating contact status:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado del contacto",
        variant: "destructive"
      });
    }
  };

  // Bulk actions
  const bulkUpdateStatus = async (contactIds: string[], status: string) => {
    try {
      for (const contactId of contactIds) {
        const contact = contacts.find(c => c.id === contactId);
        if (contact) {
          await updateContactStatus(contactId, status, contact.source);
        }
      }
      
      toast({
        title: "Éxito",
        description: `${contactIds.length} contactos actualizados correctamente`
      });
    } catch (error) {
      console.error('Error in bulk update:', error);
      toast({
        title: "Error",
        description: "Error en la actualización masiva",
        variant: "destructive"
      });
    }
  };

  // Export contacts
  const exportContacts = (format: 'csv' | 'excel' = 'csv') => {
    const csvContent = generateCSV(filteredContacts);
    downloadFile(csvContent, `contactos_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // Initial load
  useEffect(() => {
    fetchUnifiedContacts();
  }, []);

  return {
    contacts: filteredContacts,
    allContacts: contacts,
    isLoading,
    filters,
    applyFilters,
    updateContactStatus,
    bulkUpdateStatus,
    exportContacts,
    refetch: fetchUnifiedContacts
  };
};

// Helper functions
const extractDomainFromEmail = (email: string): string => {
  const parts = email.split('@');
  return parts.length > 1 ? parts[1] : '';
};

const generateCSV = (contacts: UnifiedContact[]): string => {
  const headers = ['Nombre', 'Email', 'Teléfono', 'Empresa', 'Estado', 'Fuente', 'Puntuación', 'Fecha Creación'];
  const rows = contacts.map(contact => [
    contact.name,
    contact.email,
    contact.phone || '',
    contact.company || '',
    contact.status,
    contact.source,
    contact.score?.toString() || '0',
    new Date(contact.created_at).toLocaleDateString()
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};