
interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'good' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  target: number;
  history: Array<{ timestamp: string; value: number }>;
}

export const generateHistory = (baseValue: number, variance: number = 0.1): Array<{ timestamp: string; value: number }> => {
  return Array.from({ length: 20 }, (_, i) => ({
    timestamp: new Date(Date.now() - (19 - i) * 60 * 1000).toISOString(),
    value: baseValue + (Math.random() - 0.5) * baseValue * variance
  }));
};

export const calculatePerformanceMetrics = (
  recentLogs: any[], 
  apolloCompanies: any[], 
  apolloContacts: any[]
): PerformanceMetric[] => {
  // Calcular métricas de rendimiento
  const successfulOperations = recentLogs.filter(log => log.status === 'success');
  const failedOperations = recentLogs.filter(log => log.status === 'error');
  
  const avgResponseTime = successfulOperations.length > 0 
    ? successfulOperations.reduce((sum, log) => sum + (log.execution_time_ms || 0), 0) / successfulOperations.length
    : 0;

  const successRate = recentLogs.length > 0 
    ? (successfulOperations.length / recentLogs.length) * 100
    : 100;

  const operationsPerHour = recentLogs.length;
  const errorRate = recentLogs.length > 0 
    ? (failedOperations.length / recentLogs.length) * 100
    : 0;

  const enrichmentRate = (apolloCompanies?.length || 0) + (apolloContacts?.length || 0);

  return [
    {
      name: 'Tiempo de Respuesta Promedio',
      value: Math.round(avgResponseTime),
      unit: 'ms',
      status: avgResponseTime < 2000 ? 'good' : avgResponseTime < 5000 ? 'warning' : 'critical',
      trend: 'stable',
      target: 2000,
      history: generateHistory(avgResponseTime)
    },
    {
      name: 'Tasa de Éxito',
      value: Math.round(successRate),
      unit: '%',
      status: successRate > 95 ? 'good' : successRate > 85 ? 'warning' : 'critical',
      trend: 'up',
      target: 95,
      history: generateHistory(successRate, 0.05)
    },
    {
      name: 'Operaciones por Hora',
      value: operationsPerHour,
      unit: 'ops/h',
      status: operationsPerHour > 10 ? 'good' : operationsPerHour > 5 ? 'warning' : 'critical',
      trend: 'up',
      target: 15,
      history: generateHistory(operationsPerHour, 0.3)
    },
    {
      name: 'Tasa de Error',
      value: Math.round(errorRate * 100) / 100,
      unit: '%',
      status: errorRate < 2 ? 'good' : errorRate < 5 ? 'warning' : 'critical',
      trend: 'down',
      target: 2,
      history: generateHistory(errorRate, 0.2)
    },
    {
      name: 'Rate de Enriquecimiento',
      value: enrichmentRate,
      unit: 'registros',
      status: enrichmentRate > 100 ? 'good' : enrichmentRate > 50 ? 'warning' : 'critical',
      trend: 'up',
      target: 100,
      history: generateHistory(enrichmentRate, 0.15)
    }
  ];
};
