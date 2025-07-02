
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, Users, TrendingUp, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { useRealTimeLeads } from '@/hooks/useRealTimeLeads';
import CriticalLeadsPanel from './CriticalLeadsPanel';
import LeadActivityFeed from './LeadActivityFeed';
import LeadScoringErrorBoundary from './ErrorBoundary';

const RealTimeLeadsDashboard = memo(() => {
  const { getLeadStats, hotLeads, isLoadingHotLeads } = useAdvancedLeadScoring();
  const { 
    recentUpdates, 
    clearUpdates, 
    getLeadsPriority, 
    totalHotLeads, 
    totalLeads, 
    isConnected 
  } = useRealTimeLeads();
  
  const stats = getLeadStats();

  const handleRefresh = () => {
    window.location.reload();
  };

  if (isLoadingHotLeads) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Cargando dashboard de leads en tiempo real...</p>
        </div>
      </div>
    );
  }

  return (
    <LeadScoringErrorBoundary fallbackTitle="Dashboard de Leads en Tiempo Real" onRetry={handleRefresh}>
      <div className="space-y-6">
      {/* Header con estado de conexión */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🎯 LEADS EN TIEMPO REAL</h1>
          <p className="text-gray-600 mt-1">Monitoreo automático y alertas instantáneas</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPIs en tiempo real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Leads Críticos</p>
                <p className="text-3xl font-bold text-red-700">{totalHotLeads}</p>
                <p className="text-xs text-red-500 mt-1">Requieren acción inmediata</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Leads</p>
                <p className="text-3xl font-bold">{totalLeads}</p>
                <p className="text-xs text-gray-500 mt-1">En seguimiento activo</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Score Promedio</p>
                <p className="text-3xl font-bold text-orange-600">{stats.averageScore}</p>
                <p className="text-xs text-gray-500 mt-1">Calidad general</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa Conversión</p>
                <p className="text-3xl font-bold text-green-600">{stats.conversionRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Leads a clientes</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paneles principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CriticalLeadsPanel 
          getLeadsPriority={getLeadsPriority}
          isConnected={isConnected}
          totalHotLeads={totalHotLeads}
        />
        <LeadActivityFeed 
          recentUpdates={recentUpdates}
          clearUpdates={clearUpdates}
          isConnected={isConnected}
        />
      </div>

      {/* Acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-20 flex-col gap-2" 
              variant="outline"
              onClick={() => window.open('/admin/lead-scoring', '_blank')}
            >
              <Target className="h-6 w-6" />
              <span>Configurar Scoring</span>
            </Button>
            
            <Button 
              className="h-20 flex-col gap-2" 
              variant="outline"
              onClick={() => window.open('/admin/marketing-automation', '_blank')}
            >
              <RefreshCw className="h-6 w-6" />
              <span>Automatización</span>
            </Button>
            
            <Button 
              className="h-20 flex-col gap-2" 
              variant="outline"
              onClick={() => window.open('/admin/contact-leads', '_blank')}
            >
              <Users className="h-6 w-6" />
              <span>Ver Todos los Leads</span>
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </LeadScoringErrorBoundary>
  );
});

RealTimeLeadsDashboard.displayName = 'RealTimeLeadsDashboard';

export default RealTimeLeadsDashboard;
