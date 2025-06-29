
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseErrorHandlerReturn {
  handleError: (error: Error, context?: string) => void;
  handleAsyncError: (asyncFn: () => Promise<void>, context?: string) => Promise<void>;
}

export const useErrorHandler = (): UseErrorHandlerReturn => {
  const { toast } = useToast();

  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error ${context ? `in ${context}` : ''}:`, error);
    
    toast({
      title: "Error",
      description: context 
        ? `Error en ${context}: ${error.message}`
        : error.message,
      variant: "destructive",
    });
  }, [toast]);

  const handleAsyncError = useCallback(async (
    asyncFn: () => Promise<void>, 
    context?: string
  ) => {
    try {
      await asyncFn();
    } catch (error) {
      handleError(error as Error, context);
    }
  }, [handleError]);

  return {
    handleError,
    handleAsyncError
  };
};
