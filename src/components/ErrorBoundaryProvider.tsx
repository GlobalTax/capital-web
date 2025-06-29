
import React, { ReactNode } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { useToast } from '@/hooks/use-toast';

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

    // Log estructurado para debugging
    console.group('🚨 Error Boundary - Error Details');
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Timestamp:', new Date().toISOString());
    console.error('URL:', window.location.href);
    console.error('User Agent:', navigator.userAgent);
    console.groupEnd();
  };

  return (
    <ErrorBoundary onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundaryProvider;
