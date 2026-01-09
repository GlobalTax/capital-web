import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

interface UseErrorHandlerReturn {
  handleError: (error: Error, context?: ErrorContext | string) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>, 
    context?: ErrorContext | string
  ) => Promise<T | null>;
  logError: (error: Error, context?: ErrorContext | string) => void;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { toast } = useToast();

  const logError = useCallback((error: Error, context?: ErrorContext | string) => {
    const errorContext = typeof context === 'string' ? { component: context } : context;
    
    logger.error('Application error', error, {
      context: 'system',
      component: errorContext?.component || 'unknown',
      data: {
        action: errorContext?.action,
        userId: errorContext?.userId,
        metadata: errorContext?.metadata
      }
    });
  }, []);

  const handleError = useCallback((error: Error, context?: ErrorContext | string) => {
    logError(error, context);
    
    // Solo mostrar toast para errores críticos, no de tracking
    const errorMessage = (error.message || error.toString() || '').toLowerCase();
    if (!errorMessage.includes('tracking') && !errorMessage.includes('404')) {
      const errorContext = typeof context === 'string' ? { component: context } : context;
      const contextMessage = errorContext?.component 
        ? ` en ${errorContext.component}` 
        : '';
      
      toast({
        title: "Error",
        description: `Error${contextMessage}: ${error.message}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [logError, toast]);

  const handleAsyncError = useCallback(async <T,>(
    asyncFn: () => Promise<T>, 
    context?: ErrorContext | string
  ): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError,
    logError
  };
};