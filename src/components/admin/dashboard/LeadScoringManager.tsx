
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdvancedLeadScoring } from '@/hooks/useAdvancedLeadScoring';
import { Target, Users, TrendingUp, AlertCircle, Phone, Mail } from 'lucide-react';

const LeadScoringManager = () => {
  const { 
    hotLeads, 
    allLeads, 
    unreadAlerts, 
    isLoadingHotLeads, 
    isLoadingAllLeads,
    getLeadStats,
    markAlertAsRead 
  } = useAdvancedLeadScoring();

  const stats = getLeadStats();

  if (isLoadingHotLeads || isLoadingAllLeads) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de lead scoring...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Lead Scoring</h1>
        <p className="text-gray-600 mt-2">
          Gestiona y analiza el comportamiento de leads y prospectos
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalLeads}</div>
            <p className="text-xs text-gray-600">leads registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hot Leads</CardTitle>
            <Target className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.hotLeadsCount}</div>
            <p className="text-xs text-gray-600">score {'>'} 80</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Score Promedio</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.averageScore}</div>
            <p className="text-xs text-gray-600">puntos de 100</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alertas</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unreadAlerts?.length || 0}
            </div>
            <p className="text-xs text-gray-600">sin leer</p>
          </CardContent>
        </Card>
      </div>

      {/* Hot Leads Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-red-600" />
            Hot Leads - Acción Inmediata Requerida
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hotLeads || hotLeads.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No hay hot leads en este momento</p>
              <p className="text-sm text-gray-400">Los leads aparecerán aquí cuando superen 80 puntos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hotLeads.slice(0, 10).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {lead.company_name || lead.company_domain || 'Lead Anónimo'}
                      </h3>
                      <Badge className="bg-red-100 text-red-800">
                        {lead.total_score} puntos
                      </Badge>
                      {lead.industry && (
                        <Badge variant="outline">{lead.industry}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      {lead.contact_name && (
                        <p>👤 Contacto: {lead.contact_name}</p>
                      )}
                      {lead.email && (
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {lead.email}
                        </p>
                      )}
                      {lead.phone && (
                        <p className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </p>
                      )}
                      <p>🕐 Última actividad: {new Date(lead.last_activity).toLocaleDateString()}</p>
                      <p>🔄 Visitas: {lead.visit_count}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="bg-red-600 hover:bg-red-700">
                      Contactar Ahora
                    </Button>
                    <Button size="sm" variant="outline">
                      Ver Detalles
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Alerts */}
      {unreadAlerts && unreadAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Alertas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unreadAlerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.message}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(alert.created_at).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markAlertAsRead.mutate(alert.id)}
                  >
                    Marcar Leída
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Leads Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Todos los Leads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.leadsByStatus?.active || 0}
              </div>
              <div className="text-sm text-gray-600">Activos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.leadsByStatus?.converted || 0}
              </div>
              <div className="text-sm text-gray-600">Convertidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {stats.leadsByStatus?.cold || 0}
              </div>
              <div className="text-sm text-gray-600">Fríos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeadScoringManager;
