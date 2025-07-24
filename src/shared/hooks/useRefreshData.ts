// ============= REFRESH DATA HOOK =============
// Hook reutilizable para refrescar datos

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export const useRefreshData = () => {
  const queryClient = useQueryClient();

  const refreshAllData = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  const refreshSpecificData = useCallback((queryKey: string[]) => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient]);

  const refreshMarketingData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['marketing_metrics_unified'] });
  }, [queryClient]);

  return {
    refreshAllData,
    refreshSpecificData,
    refreshMarketingData
  };
};