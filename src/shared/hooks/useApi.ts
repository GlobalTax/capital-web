// ============= API HOOK =============
// Standardized API interaction hook

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import type { ApiResponse } from '@/shared/types';

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  showToast?: boolean;
}

export const useApi = <T = unknown>(options: UseApiOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = useCallback(async (
    operation: () => Promise<{ data?: T; error?: any }>
  ): Promise<ApiResponse<T>> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await operation();

      if (result.error) {
        const errorMessage = result.error.message || 'Ha ocurrido un error';
        setError(errorMessage);
        options.onError?.(errorMessage);
        
        logger.error('API operation failed', result.error, { 
          context: 'api', 
          component: 'useApi' 
        });

        return { success: false, error: errorMessage };
      }

      setData(result.data || null);
      options.onSuccess?.(result.data);
      
      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      options.onError?.(errorMessage);
      
      logger.error('API operation exception', err as Error, { 
        context: 'api', 
        component: 'useApi' 
      });

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [options]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    isLoading,
    error,
    data,
    execute,
    reset,
  };
};