
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { Target, Users, TrendingUp, AlertCircle, Activity } from 'lucide-react';

const AdminDashboard = () => {
  const { 
    hotLeads, 
    allLeads, 
    unreadAlerts, 
    isLoadingHotLeads, 
    isLoadingAllLeads,
    getLeadStats 
  } = useAdvancedLeadScoring();

  const stats = getLeadStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Resumen general del sistema de marketing y lead scoring
        </p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {isLoadingAllLeads ? '...' : stats.totalLeads}
            </div>
            <p className="text-xs text-gray-600">leads registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Prospects</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {isLoadingHotLeads ? '...' : stats.hotLeadsCount}
            </div>
            <p className="text-xs text-gray-600">requieren acción inmediata</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {isLoadingAllLeads ? '...' : stats.averageScore}
            </div>
            <p className="text-xs text-gray-600">puntos de 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas Activas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unreadAlerts?.length || 0}
            </div>
            <p className="text-xs text-gray-600">pendientes de revisar</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Actividad Reciente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingHotLeads ? (
                <p className="text-gray-500">Cargando actividad...</p>
              ) : hotLeads && hotLeads.length > 0 ? (
                hotLeads.slice(0, 3).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-sm">
                        {lead.company_name || lead.company_domain || 'Lead Anónimo'}
                      </p>
                      <p className="text-xs text-gray-600">
                        Score: {lead.total_score} - Última actividad: {new Date(lead.last_activity).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay actividad reciente</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Acciones Requeridas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.hotLeadsCount > 0 && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="font-medium text-red-800">
                    {stats.hotLeadsCount} hot leads requieren contacto inmediato
                  </p>
                </div>
              )}
              {(unreadAlerts?.length || 0) > 0 && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <p className="font-medium text-orange-800">
                    {unreadAlerts?.length} alertas pendientes de revisar
                  </p>
                </div>
              )}
              {stats.hotLeadsCount === 0 && (unreadAlerts?.length || 0) === 0 && (
                <p className="text-gray-500">No hay acciones pendientes</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado del Sistema</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Lead Scoring</p>
              <p className="text-xs text-gray-600">Funcionando</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Base de Datos</p>
              <p className="text-xs text-gray-600">Conectada</p>
            </div>
            <div className="text-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
              <p className="text-sm font-medium">Alertas</p>
              <p className="text-xs text-gray-600">Activas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
