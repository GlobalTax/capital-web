
import React from 'react';
import { Button } from '@/components/ui/button';
import { Zap, AlertTriangle, RefreshCw } from 'lucide-react';

interface PerformanceMonitorHeaderProps {
  isMonitoring: boolean;
  lastUpdate: Date;
  onStartMonitoring: () => void;
  onStopMonitoring: () => void;
}

const PerformanceMonitorHeader = ({ 
  isMonitoring, 
  lastUpdate, 
  onStartMonitoring, 
  onStopMonitoring 
}: PerformanceMonitorHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          Monitor de Rendimiento
        </h2>
        <p className="text-gray-600">
          Monitoreo en tiempo real del rendimiento de las integraciones
        </p>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500">
          Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
        </span>
        <Button
          onClick={isMonitoring ? onStopMonitoring : onStartMonitoring}
          variant={isMonitoring ? "destructive" : "default"}
          className="flex items-center gap-2"
        >
          {isMonitoring ? (
            <>
              <AlertTriangle className="h-4 w-4" />
              Detener Monitor
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Iniciar Monitor
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default PerformanceMonitorHeader;
