import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface DynamicImportFallbackProps {
  error: Error;
  componentName?: string;
  onRetry?: () => void;
  showDebug?: boolean;
}

export const DynamicImportFallback: React.FC<DynamicImportFallbackProps> = ({
  error,
  componentName = 'Componente',
  onRetry,
  showDebug = false
}) => {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    if (retryCount >= 3) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    // Wait a bit before retrying
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (onRetry) {
        onRetry();
      } else {
        // Force page reload as last resort
        window.location.reload();
      }
    } catch (retryError) {
      console.error('Retry failed:', retryError);
    } finally {
      setIsRetrying(false);
    }
  };

  useEffect(() => {
    // Auto-retry once after a delay
    if (retryCount === 0) {
      const timer = setTimeout(() => {
        handleRetry();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [retryCount]);

  const isDynamicImportError = error.message.includes('Failed to fetch dynamically imported module');

  return (
    <div className="flex flex-col items-center justify-center p-8 min-h-[200px] bg-muted/50 rounded-lg border">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-6 w-6 text-destructive" />
        <h3 className="text-lg font-semibold">Error al cargar {componentName}</h3>
      </div>
      
      <p className="text-muted-foreground text-center mb-6 max-w-md">
        {isDynamicImportError 
          ? 'No se pudo cargar el componente. Esto puede deberse a una conexión lenta o archivos faltantes.'
          : 'Se produjo un error inesperado al cargar el contenido.'
        }
      </p>

      <div className="flex gap-3">
        <Button
          onClick={handleRetry}
          disabled={isRetrying || retryCount >= 3}
          variant="outline"
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
          {isRetrying ? 'Reintentando...' : retryCount >= 3 ? 'Max intentos' : `Reintentar ${retryCount > 0 ? `(${retryCount}/3)` : ''}`}
        </Button>
        
        <Button
          onClick={() => window.location.reload()}
          variant="default"
          size="sm"
        >
          Recargar página
        </Button>
      </div>

      {showDebug && (
        <details className="mt-4 w-full max-w-md">
          <summary className="text-xs text-muted-foreground cursor-pointer">
            Detalles técnicos
          </summary>
          <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-auto">
            {error.message}
            {error.stack && `\n\nStack:\n${error.stack}`}
          </pre>
        </details>
      )}
    </div>
  );
};