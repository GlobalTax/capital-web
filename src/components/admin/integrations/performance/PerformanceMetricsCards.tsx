
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown
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

interface PerformanceMetricsCardsProps {
  metrics: PerformanceMetric[];
}

const PerformanceMetricsCards = ({ metrics }: PerformanceMetricsCardsProps) => {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-600" />;
      default:
        return <Activity className="h-3 w-3 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric, index) => (
        <Card key={index} className="relative">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              {getStatusIcon(metric.status)}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Valor principal */}
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                {metric.value}{metric.unit}
              </div>
              <div className="flex items-center gap-1">
                {getTrendIcon(metric.trend)}
                <Badge className={getStatusColor(metric.status)}>
                  {metric.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Progreso hacia objetivo */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>Objetivo: {metric.target}{metric.unit}</span>
                <span>{Math.round((metric.value / metric.target) * 100)}%</span>
              </div>
              <Progress 
                value={Math.min((metric.value / metric.target) * 100, 100)} 
                className="h-2"
              />
            </div>

            {/* Mini gráfico de tendencia */}
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metric.history}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={
                      metric.status === 'good' ? '#22c55e' : 
                      metric.status === 'warning' ? '#f59e0b' : 
                      '#ef4444'
                    }
                    strokeWidth={2}
                    dot={false}
                  />
                  <Tooltip 
                    labelFormatter={(value) => new Date(value).toLocaleTimeString('es-ES')}
                    formatter={(value: any) => [`${Math.round(value)}${metric.unit}`, metric.name]}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PerformanceMetricsCards;
