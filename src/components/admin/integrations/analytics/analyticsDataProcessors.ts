
export const processEnrichmentTrends = (logs: any[]) => {
  const dailyData = logs.reduce((acc, log) => {
    const date = new Date(log.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, empresas: 0, contactos: 0, total: 0 };
    }
    
    if (log.operation === 'enrich_company') acc[date].empresas++;
    if (log.operation === 'enrich_contacts') acc[date].contactos++;
    acc[date].total++;
    
    return acc;
  }, {});

  return Object.values(dailyData).sort((a: any, b: any) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
};

export const processPerformanceMetrics = (logs: any[]) => {
  return logs.filter(log => log.execution_time_ms).map(log => ({
    timestamp: new Date(log.created_at).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    tiempo: log.execution_time_ms,
    operacion: log.operation,
    estado: log.status
  }));
};

export const processSourceDistribution = (companies: any[]) => {
  const industries = companies.reduce((acc, company) => {
    const industry = company.industry || 'Sin categoría';
    acc[industry] = (acc[industry] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(industries).map(([name, value]) => ({
    name,
    value,
    percentage: ((value as number) / companies.length * 100).toFixed(1)
  }));
};

export const processSuccessRates = (logs: any[]) => {
  const operationStats = logs.reduce((acc, log) => {
    if (!acc[log.operation]) {
      acc[log.operation] = { total: 0, success: 0, error: 0 };
    }
    acc[log.operation].total++;
    if (log.status === 'success') acc[log.operation].success++;
    if (log.status === 'error') acc[log.operation].error++;
    return acc;
  }, {});

  return Object.entries(operationStats).map(([operation, stats]: [string, any]) => ({
    operacion: operation.replace('_', ' ').toUpperCase(),
    exitosos: stats.success,
    errores: stats.error,
    tasa_exito: ((stats.success / stats.total) * 100).toFixed(1)
  }));
};

export const processResponseTimes = (logs: any[]) => {
  return logs
    .filter(log => log.execution_time_ms && log.status === 'success')
    .map(log => ({
      hora: new Date(log.created_at).toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      tiempo: log.execution_time_ms,
      operacion: log.operation
    }))
    .slice(-20); // Últimos 20 registros
};

export const processCompanyGrowth = (companies: any[]) => {
  const dailyGrowth = companies.reduce((acc, company) => {
    const date = new Date(company.created_at).toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { 
        fecha: date, 
        nuevas_empresas: 0, 
        target_accounts: 0,
        total_contactos: 0
      };
    }
    acc[date].nuevas_empresas++;
    if (company.is_target_account) acc[date].target_accounts++;
    acc[date].total_contactos += company.contacts_count || 0;
    return acc;
  }, {});

  return Object.values(dailyGrowth).sort((a: any, b: any) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
};
