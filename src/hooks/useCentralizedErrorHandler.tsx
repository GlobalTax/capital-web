
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
  handleError: (error: Error, context?: ErrorContext) => void;
  handleAsyncError: <T>(
    asyncFn: () => Promise<T>, 
    context?: ErrorContext
  ) => Promise<T | null>;
  logError: (error: Error, context?: ErrorContext) => void;
}

export const useCentralizedErrorHandler = (): UseErrorHandlerReturn => {
  const { toast } = useToast();

  const logError = useCallback((error: Error, context?: ErrorContext) => {
    logger.error('Application error', error, {
      context: 'system',
      component: context?.component || 'unknown',
      data: {
        action: context?.action,
        userId: context?.userId,
        metadata: context?.metadata
      }
    });
  }, []);

  const handleError = (error: Error, context?: ErrorContext) => {
    logError(error, context);
    
    // Solo mostrar toast para errores críticos, no de tracking
    if (!error.message.toLowerCase().includes('tracking') && 
        !error.message.toLowerCase().includes('404')) {
      const contextMessage = context?.component 
        ? ` en ${context.component}` 
        : '';
      
      toast({
        title: "Error",
        description: `Error${contextMessage}: ${error.message}`,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleAsyncError = useCallback(async <T,>(
    asyncFn: () => Promise<T>, 
    context?: ErrorContext
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
