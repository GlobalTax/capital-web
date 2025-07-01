
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

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
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      context: context || {},
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('[ERROR]', errorData);

    // En producción, aquí enviarías los errores a un servicio de logging
    // como Sentry, LogRocket, etc.
  }, []);

  const handleError = useCallback((error: Error, context?: ErrorContext) => {
    logError(error, context);
    
    const contextMessage = context?.component 
      ? ` en ${context.component}` 
      : '';
    
    toast({
      title: "Error",
      description: `Error${contextMessage}: ${error.message}`,
      variant: "destructive",
      duration: 5000,
    });
  }, [toast, logError]);

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
