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
 * Wrapper mejorado para el admin con manejo robusto de errores y recuperación
 */
export const AdminWrapper: React.FC<AdminWrapperProps> = ({ children }) => {
  const [retryCount, setRetryCount] = React.useState(0);
  const [authError, setAuthError] = React.useState<string | null>(null);
  let authContext;
  
  // Intentar usar el hook de autenticación de forma segura
  try {
    authContext = useAuth();
  } catch (error) {
    console.error('AuthContext not available:', error);
    
    // Redirigir después de un momento si no se puede recuperar
    useEffect(() => {
      const timer = setTimeout(() => {
        if (retryCount < 3) {
          setRetryCount(prev => prev + 1);
          window.location.reload();
        } else {
          window.location.href = '/';
        }
      }, 2000);
      return () => clearTimeout(timer);
    }, [retryCount]);
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error de contexto de autenticación. Reintentando... ({retryCount + 1}/3)
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const { user, session, isLoading, isAdmin } = authContext;

  // Loading state mejorado
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
    return <Navigate to="/admin/login" replace />;
  }

  // Si no es admin, mostrar acceso denegado
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Acceso restringido. Solo administradores pueden acceder a esta área.
            <div className="mt-2">
              <button 
                onClick={() => window.location.href = '/'}
                className="text-xs underline"
              >
                Ir al inicio
              </button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
};