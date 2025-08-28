/**
 * Sistema de Notificaciones de Emergencia
 * Muestra alertas críticas del sistema al usuario
 */

import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useFeatureFlag } from '@/utils/featureFlags';
import { useSecureLogger } from '@/hooks/useSecureLogger';
import { AlertTriangle, X, RefreshCw, Shield } from 'lucide-react';

export const EmergencyNotification: React.FC = () => {
  const logger = useSecureLogger('EmergencyNotification');
  const [dismissed, setDismissed] = useState(false);
  const [criticalErrors, setCriticalErrors] = useState<any[]>([]);
  
  // Feature flags críticas
  const isMaintenanceMode = useFeatureFlag('maintenance_mode');
  const isEnhancedSecurity = useFeatureFlag('enhanced_security');

  useEffect(() => {
    // Monitorear logs críticos
    const checkCriticalErrors = () => {
      const recentLogs = logger.getRecentLogs();
      const critical = recentLogs.filter(log => 
        log.level === 'critical' && 
        new Date(log.timestamp).getTime() > Date.now() - 5 * 60 * 1000 // últimos 5 minutos
      );
      
      setCriticalErrors(critical);
    };

    checkCriticalErrors();
    const interval = setInterval(checkCriticalErrors, 10000); // cada 10 segundos

    return () => clearInterval(interval);
  }, [logger]);

  const handleDismiss = () => {
    setDismissed(true);
    logger.info('Emergency notification dismissed by user');
  };

  const handleRefresh = () => {
    logger.info('Page refresh requested from emergency notification');
    window.location.reload();
  };

  // No mostrar si fue descartada y no hay eventos críticos recientes
  if (dismissed && criticalErrors.length === 0 && !isMaintenanceMode) {
    return null;
  }

  // Modo mantenimiento
  if (isMaintenanceMode) {
    return (
      <div className="fixed top-0 left-0 right-0 z-50 bg-destructive text-destructive-foreground p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">
              Sistema en mantenimiento. Funcionalidad limitada disponible.
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-destructive-foreground border-destructive-foreground hover:bg-destructive-foreground hover:text-destructive"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>
    );
  }

  // Errores críticos
  if (criticalErrors.length > 0) {
    const latestError = criticalErrors[0];
    
    return (
      <div className="fixed top-0 left-0 right-0 z-50">
        <Alert variant="destructive" className="rounded-none border-0">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <strong>Error crítico detectado:</strong> {latestError.message}
              {criticalErrors.length > 1 && (
                <span className="ml-2 text-sm">
                  (+{criticalErrors.length - 1} más)
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="text-destructive-foreground border-destructive-foreground hover:bg-destructive-foreground hover:text-destructive"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Recargar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Advertencias de seguridad
  if (!isEnhancedSecurity && !dismissed) {
    return (
      <div className="fixed bottom-4 right-4 z-50 max-w-sm">
        <Alert variant="destructive">
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex-1">
              <strong>Advertencia:</strong> Funciones de seguridad avanzadas deshabilitadas
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-destructive-foreground hover:bg-destructive-foreground hover:text-destructive ml-2"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return null;
};

export default EmergencyNotification;