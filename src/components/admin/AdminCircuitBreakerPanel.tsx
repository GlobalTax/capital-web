// ============= ADMIN CIRCUIT BREAKER PANEL =============
// Panel completo de monitoreo y control de Circuit Breakers y Rate Limits

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CircuitBreakerStatus } from './CircuitBreakerStatus';
import { useEmergencyOverride } from '@/hooks/useEmergencyOverride';
import { useConfigurableRateLimit } from '@/hooks/useConfigurableRateLimit';
import { useToast } from '@/hooks/use-toast';
import { 
  WifiOff, 
  Wifi, 
  AlertTriangle, 
  ShieldCheck, 
  Clock, 
  Activity,
  Settings,
  RefreshCw,
  Zap,
  BarChart3
} from 'lucide-react';

interface AdminCircuitBreakerPanelProps {
  className?: string;
}

export const AdminCircuitBreakerPanel: React.FC<AdminCircuitBreakerPanelProps> = ({ 
  className = "" 
}) => {
  const { toast } = useToast();
  
  // Emergency override state
  const { 
    overrideState, 
    isActive: overrideActive,
    timeUntilExpiry,
    disableCircuitBreaker,
    elevateRateLimit,
    enableBothOverrides,
    clearOverride,
    formatExpiryTime
  } = useEmergencyOverride();

  // Rate limiting instances for monitoring
  const trackingRateLimit = useConfigurableRateLimit({
    maxRequests: 10,
    windowMs: 60000,
    category: 'tracking'
  });

  const formRateLimit = useConfigurableRateLimit({
    maxRequests: 5,
    windowMs: 300000,
    category: 'forms'
  });

  const [overrideDuration, setOverrideDuration] = useState(30); // minutes
  const [overrideReason, setOverrideReason] = useState('');

  // Real-time metrics refresh
  const [metricsRefreshKey, setMetricsRefreshKey] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricsRefreshKey(prev => prev + 1);
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleEmergencyOverride = (type: 'circuit' | 'rate' | 'both') => {
    if (!overrideReason.trim()) {
      toast({
        title: "Razón requerida",
        description: "Debe proporcionar una razón para activar el override de emergencia",
        variant: "destructive"
      });
      return;
    }

    const durationMs = overrideDuration * 60 * 1000;
    const activatedBy = 'admin-panel';

    try {
      switch (type) {
        case 'circuit':
          disableCircuitBreaker(overrideReason, durationMs, activatedBy);
          break;
        case 'rate':
          elevateRateLimit(overrideReason, durationMs, activatedBy);
          break;
        case 'both':
          enableBothOverrides(overrideReason, durationMs, activatedBy);
          break;
      }

      toast({
        title: "Override activado",
        description: `${type === 'both' ? 'Ambos sistemas' : type === 'circuit' ? 'Circuit Breaker' : 'Rate Limits'} overridden por ${overrideDuration} minutos`,
        variant: "default"
      });

      setOverrideReason('');
    } catch (error) {
      toast({
        title: "Error al activar override",
        description: (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleClearOverride = () => {
    clearOverride();
    toast({
      title: "Override desactivado",
      description: "Todos los overrides de emergencia han sido desactivados",
      variant: "default"
    });
  };

  const handleResetRateLimits = () => {
    trackingRateLimit.resetBlocks();
    formRateLimit.resetBlocks();
    
    toast({
      title: "Rate Limits reiniciados",
      description: "Todos los bloqueos de rate limiting han sido eliminados",
      variant: "default"
    });
  };

  const getOverrideStatusBadge = () => {
    if (!overrideActive) {
      return <Badge variant="default" className="flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        Normal
      </Badge>;
    }

    return <Badge variant="destructive" className="flex items-center gap-1">
      <AlertTriangle className="h-3 w-3" />
      Override Activo
    </Badge>;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Override Status Alert */}
      {overrideActive && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle className="flex items-center justify-between">
            Sistema en Modo Override de Emergencia
            <Badge variant="secondary">
              <Clock className="h-3 w-3 mr-1" />
              {formatExpiryTime()}
            </Badge>
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <p><strong>Razón:</strong> {overrideState.reason}</p>
            <p><strong>Activado por:</strong> {overrideState.activatedBy}</p>
            <p><strong>Estado:</strong></p>
            <ul className="ml-4 list-disc text-sm">
              {overrideState.circuitBreakerDisabled && <li>Circuit Breaker DESHABILITADO</li>}
              {overrideState.rateLimitElevated && <li>Rate Limits ELEVADOS (3x límites normales)</li>}
            </ul>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleClearOverride}
              className="mt-2"
            >
              Desactivar Override
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="circuit">Circuit Breaker</TabsTrigger>
          <TabsTrigger value="ratelimit">Rate Limits</TabsTrigger>
          <TabsTrigger value="emergency">Emergencia</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estado General</CardTitle>
                {getOverrideStatusBadge()}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Circuit Breaker:</span>
                    <Badge variant={overrideState.circuitBreakerDisabled ? "destructive" : "default"}>
                      {overrideState.circuitBreakerDisabled ? "Deshabilitado" : "Activo"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rate Limits:</span>
                    <Badge variant={overrideState.rateLimitElevated ? "secondary" : "default"}>
                      {overrideState.rateLimitElevated ? "Elevados" : "Normal"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit Tracking</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disponibles:</span>
                    <span className="font-medium">{trackingRateLimit.getRemainingRequests()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Modo:</span>
                    <Badge variant={trackingRateLimit.isElevatedMode ? "secondary" : "default"}>
                      {trackingRateLimit.isElevatedMode ? "Elevado" : "Normal"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rate Limit Forms</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disponibles:</span>
                    <span className="font-medium">{formRateLimit.getRemainingRequests()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Modo:</span>
                    <Badge variant={formRateLimit.isElevatedMode ? "secondary" : "default"}>
                      {formRateLimit.isElevatedMode ? "Elevado" : "Normal"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Circuit Breaker Tab */}
        <TabsContent value="circuit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Estado del Circuit Breaker
              </CardTitle>
              <CardDescription>
                Monitoroe y control del sistema de Circuit Breaker para tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Placeholder for actual circuit breaker status - would need real data */}
              <CircuitBreakerStatus
                isOpen={false}
                failureCount={0}
                maxFailures={5}
                lastFailureTime={null}
                resetTime={300000}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limits Tab */}
        <TabsContent value="ratelimit">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Métricas de Rate Limiting</CardTitle>
                <CardDescription>Estado en tiempo real de los límites de velocidad</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Tracking Rate Limit:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={trackingRateLimit.isElevatedMode ? "secondary" : "default"}>
                        {trackingRateLimit.getRemainingRequests()}/{trackingRateLimit.effectiveLimits.maxRequests}
                      </Badge>
                      {trackingRateLimit.isElevatedMode && (
                        <Badge variant="outline">Elevado</Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span>Forms Rate Limit:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={formRateLimit.isElevatedMode ? "secondary" : "default"}>
                        {formRateLimit.getRemainingRequests()}/{formRateLimit.effectiveLimits.maxRequests}
                      </Badge>
                      {formRateLimit.isElevatedMode && (
                        <Badge variant="outline">Elevado</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handleResetRateLimits}
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Resetear Rate Limits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Emergency Tab */}
        <TabsContent value="emergency">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-destructive" />
                Controles de Emergencia
              </CardTitle>
              <CardDescription>
                Activar overrides temporales para situaciones críticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duración (minutos)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="5"
                    max="180"
                    value={overrideDuration}
                    onChange={(e) => setOverrideDuration(Number(e.target.value))}
                    placeholder="30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Razón del override (requerida)</Label>
                  <Input
                    id="reason"
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Ej: Mantenimiento crítico, alta demanda, troubleshooting..."
                  />
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <Button 
                  variant="destructive" 
                  onClick={() => handleEmergencyOverride('circuit')}
                  disabled={overrideActive || !overrideReason.trim()}
                  className="flex items-center gap-2"
                >
                  <WifiOff className="h-4 w-4" />
                  Deshabilitar Circuit Breaker
                </Button>

                <Button 
                  variant="secondary" 
                  onClick={() => handleEmergencyOverride('rate')}
                  disabled={overrideActive || !overrideReason.trim()}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Elevar Rate Limits
                </Button>

                <Button 
                  variant="destructive" 
                  onClick={() => handleEmergencyOverride('both')}
                  disabled={overrideActive || !overrideReason.trim()}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Override Completo
                </Button>
              </div>

              {overrideActive && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Los overrides están activos. El sistema volverá a la normalidad automáticamente 
                    en {formatExpiryTime()}, o puede desactivarlos manualmente arriba.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};