import React, { ReactNode, useEffect, useState } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorState } from '@/components/EmptyStates';
import { Skeleton } from '@/components/ui/skeleton';

interface SafeAsyncComponentProps {
  children: ReactNode;
  fallback?: ReactNode;
  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  retryable?: boolean;
  onError?: (error: Error) => void;
}

interface AsyncState {
  isLoading: boolean;
  error: Error | null;
  retryCount: number;
}

export const SafeAsyncComponent = ({ 
  children, 
  fallback,
  loadingFallback,
  errorFallback,
  retryable = true,
  onError
}: SafeAsyncComponentProps) => {
  const [state, setState] = useState<AsyncState>({
    isLoading: true,
    error: null,
    retryCount: 0
  });
  
  const { handleError } = useErrorHandler();

  const retry = () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      retryCount: prev.retryCount + 1
    }));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setState(prev => ({ ...prev, isLoading: false }));
    }, 100);

    return () => clearTimeout(timer);
  }, [state.retryCount]);

  // Simular carga asíncrona
  useEffect(() => {
    const handleAsyncError = (error: Error) => {
      setState(prev => ({ ...prev, error, isLoading: false }));
      handleError(error, { component: 'SafeAsyncComponent' });
      onError?.(error);
    };

    // Escuchar errores no capturados
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      handleAsyncError(new Error(event.reason));
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [handleError, onError]);

  if (state.isLoading) {
    return loadingFallback || fallback || <Skeleton className="h-32 w-full" />;
  }

  if (state.error) {
    if (errorFallback) {
      return errorFallback;
    }
    
    return (
      <ErrorState 
        onRetry={retryable ? retry : () => window.location.reload()} 
      />
    );
  }

  return <>{children}</>;
};

export default SafeAsyncComponent;