// Hook simplificado para mantener compatibilidad con componentes existentes
export const useProposals = () => {
  // Datos mock simplificados
  const mockStats = {
    total_proposals: 0,
    sent_proposals: 0,
    viewed_proposals: 0,
    approved_proposals: 0,
    total_value: 0,
    conversion_rate: 0,
    avg_response_time: 0
  };

  return {
    proposals: [],
    templates: [],
    sections: [],
    stats: mockStats,
    isLoading: false,
    createProposal: async (data: any) => {
      console.log('Proposals system disabled after cleanup:', data);
      return null;
    },
    updateProposal: async (id: string, data: any) => {
      console.log('Proposals system disabled after cleanup:', { id, data });
      return false;
    },
    sendProposal: async (id: string) => {
      console.log('Proposals system disabled after cleanup:', id);
      return false;
    },
    deleteProposal: async (id: string) => {
      console.log('Proposals system disabled after cleanup:', id);
      return false;
    },
    refetch: () => {
      console.log('Proposals system disabled after cleanup');
    }
  };
};