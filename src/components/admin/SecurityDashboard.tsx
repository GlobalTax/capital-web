/**
 * Dashboard de Seguridad y Emergencia
 * Panel de control para monitoreo y respuesta rápida a incidentes
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSecureLogger } from '@/hooks/useSecureLogger';
import { featureFlags, useFeatureFlag, type FeatureFlagKey } from '@/utils/featureFlags';
import { monitoringSystem } from '@/utils/monitoringSystem';
import { Shield, AlertTriangle, Activity, Settings, Zap, RefreshCw } from 'lucide-react';

export const SecurityDashboard: React.FC = () => {
  const logger = useSecureLogger('SecurityDashboard');
  const [healthReport, setHealthReport] = useState<any>(null);
  const [recentAlerts, setRecentAlerts] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [emergencyMode, setEmergencyMode] = useState(false);
  
  // Feature flags importantes
  const isMaintenanceMode = useFeatureFlag('maintenance_mode');
  const isEnhancedSecurity = useFeatureFlag('enhanced_security');
  const isSecurityMonitoring = useFeatureFlag('security_monitoring');

  useEffect(() => {
    const updateData = () => {
      setHealthReport(logger.getHealthReport());
      setRecentAlerts(monitoringSystem.getRecentAlerts(60)); // última hora
      setRecentLogs(logger.getRecentLogs().filter(log => 
        log.level === 'error' || log.level === 'critical'
      ).slice(-20));
    };

    updateData();
    const interval = setInterval(updateData, 30000); // actualizar cada 30 segundos

    return () => clearInterval(interval);
  }, [logger]);

  const handleEmergencyRollback = async () => {
    logger.critical('Emergency rollback initiated by admin', {
      timestamp: new Date().toISOString(),
      previousState: featureFlags.getEnabledFlags()
    });
    
    featureFlags.emergencyRollback('Manual admin action from security dashboard');
    setEmergencyMode(true);
    
    setTimeout(() => setEmergencyMode(false), 5000);
  };

  const handleMaintenanceToggle = () => {
    if (isMaintenanceMode) {
      featureFlags.disableMaintenanceMode('Admin disabled from security dashboard');
      logger.info('Maintenance mode disabled by admin');
    } else {
      featureFlags.enableMaintenanceMode('Admin enabled from security dashboard');
      logger.critical('Maintenance mode enabled by admin');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getLogLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'error': return 'destructive';
      case 'warn': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con acciones de emergencia */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          {isMaintenanceMode && (
            <Badge variant="destructive" className="ml-2">
              MAINTENANCE MODE
            </Badge>
          )}
        </div>
        
        <div className="flex space-x-2">
          <Button
            variant={isMaintenanceMode ? "default" : "destructive"}
            onClick={handleMaintenanceToggle}
            size="sm"
          >
            <Settings className="h-4 w-4 mr-2" />
            {isMaintenanceMode ? 'Exit Maintenance' : 'Maintenance Mode'}
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleEmergencyRollback}
            disabled={emergencyMode}
            size="sm"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {emergencyMode ? 'Rolling back...' : 'Emergency Rollback'}
          </Button>
        </div>
      </div>

      {/* Alertas críticas */}
      {emergencyMode && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Emergency rollback in progress. All experimental features have been disabled.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas principales */}
      {healthReport && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">System Uptime</p>
                  <p className="text-2xl font-bold">
                    {Math.round(healthReport.system.uptime / 3600000)}h
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Avg Page Load</p>
                  <p className="text-2xl font-bold">
                    {Math.round(healthReport.performance.averagePageLoad)}ms
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Security Alerts</p>
                  <p className="text-2xl font-bold">
                    {healthReport.security.totalAlerts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm font-medium">Critical Events</p>
                  <p className="text-2xl font-bold">
                    {healthReport.security.criticalAlerts}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="logs">Error Logs</TabsTrigger>
          <TabsTrigger value="features">Feature Flags</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              {recentAlerts.length === 0 ? (
                <p className="text-muted-foreground">No recent security alerts</p>
              ) : (
                <div className="space-y-2">
                  {recentAlerts.map((alert, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                        <div>
                          <p className="font-medium">{alert.type.replace(/_/g, ' ')}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{JSON.stringify(alert.details, null, 2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Error Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="text-muted-foreground">No recent error logs</p>
              ) : (
                <div className="space-y-2">
                  {recentLogs.map((log, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 border rounded">
                      <Badge variant={getLogLevelColor(log.level)}>
                        {log.level}
                      </Badge>
                      <div className="flex-1">
                        <p className="font-medium">{log.message}</p>
                        <p className="text-sm text-muted-foreground">
                          {log.component} • {new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.data && (
                          <pre className="text-xs mt-2 p-2 bg-muted rounded">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {featureFlags.getAllFlags().map((flag) => (
                  <div key={flag.key} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{flag.key.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-muted-foreground">{flag.description}</p>
                      <Badge variant="outline" className="mt-1">{flag.environment}</Badge>
                    </div>
                    <Badge variant={flag.isEnabled ? "default" : "secondary"}>
                      {flag.isEnabled ? 'ON' : 'OFF'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              {healthReport && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded">
                    <h3 className="font-medium">Page Load Time</h3>
                    <p className="text-2xl font-bold">
                      {Math.round(healthReport.performance.averagePageLoad)}ms
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-medium">API Response Time</h3>
                    <p className="text-2xl font-bold">
                      {Math.round(healthReport.performance.averageApiResponse)}ms
                    </p>
                  </div>
                  <div className="p-4 border rounded">
                    <h3 className="font-medium">Memory Usage</h3>
                    <p className="text-2xl font-bold">
                      {Math.round(healthReport.performance.memoryUsage / 1024 / 1024)}MB
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SecurityDashboard;