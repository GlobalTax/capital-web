
import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/utils/logger';

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

    // Log estructurado usando logger
    logger.error('Error Boundary caught error', error, {
      context: 'system',
      component: 'ErrorBoundaryProvider',
      data: {
        componentStack: errorInfo.componentStack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
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
