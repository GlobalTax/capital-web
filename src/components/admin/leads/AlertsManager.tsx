import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Bell, Target, TrendingUp } from 'lucide-react';

const AlertsManager = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Alertas del Sistema</h1>
        <p className="text-gray-600 mt-2">
          Centro de alertas y notificaciones críticas
        </p>
      </div>

      {/* Alertas Críticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Alertas Críticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                <strong>Hot Leads Detectados:</strong> 3 leads han superado 80 puntos en las últimas 2 horas.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <TrendingUp className="h-4 w-4" />
              <AlertDescription>
                <strong>Pico de Actividad:</strong> Se ha detectado un incremento del 150% en visitas a la calculadora de valoración.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Bell className="h-4 w-4" />
              <AlertDescription>
                <strong>Sistema Operativo:</strong> Todas las funcionalidades del panel admin están disponibles y funcionando correctamente.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Estado del Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-green-700 mt-1">Lead Scoring</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-green-700 mt-1">Marketing Hub</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">✓</div>
              <div className="text-sm text-green-700 mt-1">Content Management</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas en Tiempo Real */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas en Tiempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">47</div>
              <div className="text-sm text-gray-600">Visitantes Online</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Conversiones Hoy</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">3</div>
              <div className="text-sm text-gray-600">Hot Leads</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">89%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AlertsManager;