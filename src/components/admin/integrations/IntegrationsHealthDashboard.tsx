
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Database, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface HealthMetric {
  name: string;
  status: 'healthy' | 'warning' | 'error';
  value: string;
  description: string;
  lastCheck: Date;
}

const IntegrationsHealthDashboard = () => {
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>([]);
  const [isChecking, setIsChecking] = useState(false);

  const checkSystemHealth = async () => {
    setIsChecking(true);
    const metrics: HealthMetric[] = [];

    try {
      // Check Database Health
      const { data: dbTest, error: dbError } = await supabase
        .from('integration_logs')
        .select('count')
        .limit(1);

      metrics.push({
        name: 'Base de Datos',
        status: dbError ? 'error' : 'healthy',
        value: dbError ? 'Error' : 'Operativa',
        description: dbError ? dbError.message : 'Conexión exitosa a Supabase',
        lastCheck: new Date()
      });

      // Check Apollo Companies
      const { data: companies, error: companiesError } = await supabase
        .from('apollo_companies')
        .select('count');

      const companiesCount = companies?.length || 0;
      metrics.push({
        name: 'Apollo Companies',
        status: companiesError ? 'error' : companiesCount > 0 ? 'healthy' : 'warning',
        value: `${companiesCount} empresas`,
        description: companiesError ? companiesError.message : 
          companiesCount > 0 ? 'Datos disponibles' : 'Sin datos de empresas',
        lastCheck: new Date()
      });

      // Check Apollo Contacts
      const { data: contacts, error: contactsError } = await supabase
        .from('apollo_contacts')
        .select('count');

      const contactsCount = contacts?.length || 0;
      metrics.push({
        name: 'Apollo Contacts',
        status: contactsError ? 'error' : contactsCount > 0 ? 'healthy' : 'warning',
        value: `${contactsCount} contactos`,
        description: contactsError ? contactsError.message : 
          contactsCount > 0 ? 'Contactos enriquecidos disponibles' : 'Sin contactos enriquecidos',
        lastCheck: new Date()
      });

      // Check Integration Logs
      const { data: logs, error: logsError } = await supabase
        .from('integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      const recentLogs = logs?.filter(log => 
        new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ) || [];

      const successfulLogs = recentLogs.filter(log => log.status === 'success');
      const errorLogs = recentLogs.filter(log => log.status === 'error');

      metrics.push({
        name: 'Logs de Integración',
        status: logsError ? 'error' : errorLogs.length > successfulLogs.length ? 'warning' : 'healthy',
        value: `${recentLogs.length} últimas 24h`,
        description: logsError ? logsError.message : 
          `${successfulLogs.length} exitosos, ${errorLogs.length} errores`,
        lastCheck: new Date()
      });

      // Check Recent Activity
      const { data: recentActivity, error: activityError } = await supabase
        .from('apollo_companies')
        .select('last_enriched')
        .order('last_enriched', { ascending: false })
        .limit(1);

      const lastEnrichment = recentActivity?.[0]?.last_enriched;
      const hoursSinceLastEnrichment = lastEnrichment ? 
        (Date.now() - new Date(lastEnrichment).getTime()) / (1000 * 60 * 60) : null;

      metrics.push({
        name: 'Actividad Reciente',
        status: activityError ? 'error' : 
          !hoursSinceLastEnrichment ? 'warning' :
          hoursSinceLastEnrichment < 24 ? 'healthy' : 'warning',
        value: lastEnrichment ? 
          `Hace ${Math.round(hoursSinceLastEnrichment || 0)}h` : 'Sin actividad',
        description: activityError ? activityError.message :
          !lastEnrichment ? 'No hay enriquecimientos previos' :
          hoursSinceLastEnrichment < 1 ? 'Actividad muy reciente' :
          hoursSinceLastEnrichment < 24 ? 'Actividad normal' : 'Baja actividad reciente',
        lastCheck: new Date()
      });

      setHealthMetrics(metrics);

    } catch (error) {
      console.error('Error checking system health:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const healthyCount = healthMetrics.filter(m => m.status === 'healthy').length;
  const warningCount = healthMetrics.filter(m => m.status === 'warning').length;
  const errorCount = healthMetrics.filter(m => m.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado General</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {errorCount === 0 ? 'Saludable' : 'Atención'}
            </div>
            <p className="text-xs text-muted-foreground">
              Sistema funcionando {errorCount === 0 ? 'correctamente' : 'con problemas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Servicios OK</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyCount}</div>
            <p className="text-xs text-muted-foreground">
              de {healthMetrics.length} servicios
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Advertencias</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{warningCount}</div>
            <p className="text-xs text-muted-foreground">
              requieren atención
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errores</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{errorCount}</div>
            <p className="text-xs text-muted-foreground">
              necesitan corrección
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Estado Detallado del Sistema
            </CardTitle>
            <Button 
              onClick={checkSystemHealth} 
              disabled={isChecking}
              variant="outline"
              size="sm"
            >
              {isChecking ? 'Verificando...' : 'Actualizar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {healthMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(metric.status)}
                  <div>
                    <h3 className="font-medium">{metric.name}</h3>
                    <p className="text-sm text-gray-600">{metric.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(metric.status)}>
                    {metric.value}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">
                    <Clock className="h-3 w-3 inline mr-1" />
                    {metric.lastCheck.toLocaleTimeString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsHealthDashboard;
