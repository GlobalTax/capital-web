export interface UnifiedContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'new' | 'contacted' | 'qualified' | 'opportunity' | 'customer' | 'lost';
  source: 'apollo' | 'lead_score';
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

// Hook simplificado para mantener compatibilidad
export const useUnifiedContacts = () => {
  return {
    contacts: [],
    allContacts: [],
    isLoading: false,
    filters: {},
    currentPage: 1,
    totalContacts: 0,
    hasMore: false,
    applyFilters: (filters: any) => {
      console.log('Unified contacts filtering disabled after cleanup:', filters);
    },
    updateContactStatus: async (id: string, status: string, source: string) => {
      console.log('Contact status update disabled after cleanup:', { id, status, source });
    },
    bulkUpdateStatus: async (ids: string[], status: string) => {
      console.log('Bulk contact update disabled after cleanup:', { ids, status });
    },
    exportContacts: (format: any) => {
      console.log('Contact export disabled after cleanup:', format);
    },
    nextPage: () => {
      console.log('Contact pagination disabled after cleanup');
    },
    prevPage: () => {
      console.log('Contact pagination disabled after cleanup');
    },
    goToPage: (page: number) => {
      console.log('Contact pagination disabled after cleanup:', page);
    },
    refreshContacts: () => {
      console.log('Contact refresh disabled after cleanup');
    },
    refetch: () => {
      console.log('Contact refetch disabled after cleanup');
    }
  };
};