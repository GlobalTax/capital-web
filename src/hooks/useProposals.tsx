
import { logger } from '@/utils/logger';

export const useProposals = () => {
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
      logger.info('Proposals system disabled after cleanup', data, { context: 'system', component: 'useProposals' });
      return null;
    },
    updateProposal: async (id: string, data: any) => {
      logger.info('Proposals system disabled after cleanup', { id, data }, { context: 'system', component: 'useProposals' });
      return false;
    },
    sendProposal: async (id: string) => {
      logger.info('Proposals system disabled after cleanup', { id }, { context: 'system', component: 'useProposals' });
      return false;
    },
    deleteProposal: async (id: string) => {
      logger.info('Proposals system disabled after cleanup', { id }, { context: 'system', component: 'useProposals' });
      return false;
    },
    refetch: () => {
      logger.debug('Proposals system disabled after cleanup', undefined, { context: 'system', component: 'useProposals' });
    }
  };
};
