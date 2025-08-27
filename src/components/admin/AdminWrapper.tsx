import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface AdminWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper seguro para el admin que verifica contextos antes de renderizar
 */
export const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  let authContext;
  
  // Intentar usar el hook de autenticación de forma segura
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('AuthContext not available:', error);
    
    // Redirigir después de un momento
    useEffect(() => {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 2000);
      return () => clearTimeout(timer);
    }, []);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error de contexto de autenticación. Redirigiendo...
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { user, isLoading, isAdmin } = authContext;

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};