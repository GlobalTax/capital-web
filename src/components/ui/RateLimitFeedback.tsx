
import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface RateLimitFeedbackProps {
  isRateLimited: boolean;
  remainingTime?: number;
  remainingRequests?: number;
  maxRequests?: number;
  onRetry?: () => void;
  onClearLimit?: () => void;
  title?: string;
  message?: string;
  showDevelopmentControls?: boolean;
  className?: string;
}

export const RateLimitFeedback: React.FC<RateLimitFeedbackProps> = ({
  isRateLimited,
  remainingTime = 0,
  remainingRequests = 0,
  maxRequests = 5,
  onRetry,
  onClearLimit,
  title = "Límite de intentos alcanzado",
  message = "Has excedido el número máximo de intentos permitidos.",
  showDevelopmentControls = process.env.NODE_ENV === 'development',
  className = ""
}) => {
  const [countdown, setCountdown] = useState(remainingTime);

  useEffect(() => {
    setCountdown(remainingTime);
  }, [remainingTime]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => Math.max(0, prev - 1000));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [countdown]);

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getVariant = () => {
    if (isRateLimited) return 'destructive';
    if (remainingRequests <= 1) return 'default';
    return 'default';
  };

  if (!isRateLimited && remainingRequests > 1) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Rate limit warning/error */}
      <Alert variant={getVariant()}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center gap-2">
          {title}
          {isRateLimited && countdown > 0 && (
            <Badge variant="secondary" className="ml-auto">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(countdown)}
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription className="space-y-2">
          <p>{message}</p>
          
          {isRateLimited ? (
            <div className="text-sm">
              <p>
                Podrás intentarlo de nuevo en{' '}
                <span className="font-medium text-foreground">
                  {formatTime(countdown)}
                </span>
              </p>
              <p className="text-muted-foreground mt-1">
                Esta medida ayuda a proteger nuestros servicios y garantizar una experiencia óptima para todos los usuarios.
              </p>
            </div>
          ) : (
            <div className="text-sm">
              <p>
                Te quedan{' '}
                <span className="font-medium text-foreground">
                  {remainingRequests} de {maxRequests}
                </span>{' '}
                intentos disponibles.
              </p>
              <p className="text-muted-foreground mt-1">
                Por favor, revisa tu información antes de enviar.
              </p>
            </div>
          )}
        </AlertDescription>
      </Alert>

      {/* Action buttons */}
      <div className="flex gap-2 flex-wrap">
        {!isRateLimited && onRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={onRetry}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-3 w-3" />
            Reintentar
          </Button>
        )}

        {showDevelopmentControls && onClearLimit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearLimit}
            className="text-xs text-muted-foreground"
          >
            🔧 Clear Limit (Dev)
          </Button>
        )}
      </div>

      {/* Usage indicator */}
      {!isRateLimited && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Intentos utilizados</span>
            <span>{maxRequests - remainingRequests} / {maxRequests}</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{
                width: `${((maxRequests - remainingRequests) / maxRequests) * 100}%`
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RateLimitFeedback;
