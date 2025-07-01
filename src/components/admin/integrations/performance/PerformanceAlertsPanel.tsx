
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  CheckCircle,
  Activity
} from 'lucide-react';

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target: number;
  history: Array<{ timestamp: string; value: number }>;
}

interface PerformanceAlertsPanelProps {
  metrics: PerformanceMetric[];
}

const PerformanceAlertsPanel = ({ metrics }: PerformanceAlertsPanelProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas de Rendimiento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.filter(m => m.status !== 'good').map((metric, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
              {getStatusIcon(metric.status)}
              <div className="flex-1">
                <p className="font-medium">{metric.name}</p>
                <p className="text-sm text-gray-600">
                  Valor actual: {metric.value}{metric.unit} | 
                  Objetivo: {metric.target}{metric.unit}
                </p>
              </div>
              <Badge className={getStatusColor(metric.status)}>
                {metric.status.toUpperCase()}
              </Badge>
            </div>
          ))}
          
          {metrics.every(m => m.status === 'good') && (
            <div className="text-center text-green-600 py-4">
              <CheckCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="font-medium">¡Todo funcionando correctamente!</p>
              <p className="text-sm">Todas las métricas están dentro de los parámetros normales.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceAlertsPanel;
