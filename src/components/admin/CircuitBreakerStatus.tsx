import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, Wifi, AlertTriangle } from 'lucide-react';

interface CircuitBreakerStatusProps {
  isOpen: boolean;
  failureCount: number;
  maxFailures: number;
  lastFailureTime: number | null;
  resetTime: number;
}

export const CircuitBreakerStatus: React.FC<CircuitBreakerStatusProps> = ({
  isOpen,
  failureCount,
  maxFailures,
  lastFailureTime,
  resetTime
}) => {
  const getStatusColor = () => {
    if (isOpen) return 'destructive';
    if (failureCount > 0) return 'secondary';
    return 'default';
  };

  const getStatusIcon = () => {
    if (isOpen) return <WifiOff className="h-4 w-4" />;
    if (failureCount > 0) return <AlertTriangle className="h-4 w-4" />;
    return <Wifi className="h-4 w-4" />;
  };

  const getStatusText = () => {
    if (isOpen) return 'Tracking Deshabilitado';
    if (failureCount > 0) return `${failureCount}/${maxFailures} Fallos`;
    return 'Tracking Activo';
  };

  const timeUntilReset = lastFailureTime && isOpen 
    ? Math.max(0, resetTime - (Date.now() - lastFailureTime))
    : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Badge variant={getStatusColor()} className="flex items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
      </div>
      
      {isOpen && timeUntilReset > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Tracking se reactivará en {Math.ceil(timeUntilReset / 1000)}s
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};