
import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useToast } from '@/hooks/use-toast';
import { logError } from '@/core/logging/ConditionalLogger';

interface ErrorBoundaryProviderProps {
  children: ReactNode;
}

const ErrorBoundaryProvider = ({ children }: ErrorBoundaryProviderProps) => {
  const { toast } = useToast();

  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Mostrar toast de error para el usuario
    toast({
      title: "Error en la aplicación",
      description: `Se ha producido un error: ${error.message}`,
      variant: "destructive",
    });

    // Log estructurado con conditional logger
    logError('Error Boundary caught error', error, {
      context: 'system',
      component: 'ErrorBoundary',
      data: {
        errorInfo,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    });
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryProvider;
