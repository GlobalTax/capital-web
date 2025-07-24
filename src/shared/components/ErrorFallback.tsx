// ============= ERROR FALLBACK COMPONENT =============
// Componente reutilizable para estados de error

import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorFallbackProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

const ErrorFallback = memo(({ 
  title = "Error al cargar los datos",
  message = "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
  onRetry,
  showRetry = true,
  className = ""
}: ErrorFallbackProps) => (
  <Card className={className}>
    <CardContent className="pt-6">
      <div className="text-center space-y-4">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {message}
          </p>
        </div>
        {showRetry && onRetry && (
          <Button 
            onClick={onRetry}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        )}
      </div>
    </CardContent>
  </Card>
));

ErrorFallback.displayName = 'ErrorFallback';

export { ErrorFallback };