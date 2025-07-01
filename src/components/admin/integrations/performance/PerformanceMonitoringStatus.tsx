
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface PerformanceMonitoringStatusProps {
  isMonitoring: boolean;
}

const PerformanceMonitoringStatus = ({ isMonitoring }: PerformanceMonitoringStatusProps) => {
  if (!isMonitoring) return null;

  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-4">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-medium text-green-800">
            Monitoreo activo - Actualizando cada 30 segundos
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitoringStatus;
