import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, Users, TrendingUp } from 'lucide-react';
import { useUnifiedContacts } from '@/hooks/useUnifiedContacts';

export const ContactsHealthDashboard = () => {
  const { allContacts, isLoading } = useUnifiedContacts();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = {
    total: allContacts.length,
    new: allContacts.filter(c => c.status === 'new').length,
    qualified: allContacts.filter(c => c.status === 'qualified').length,
    contacted: allContacts.filter(c => c.status === 'contacted').length,
    hotLeads: allContacts.filter(c => c.is_hot_lead || c.priority === 'hot' || (c.score || 0) >= 80).length,
    recentContacts: allContacts.filter(c => 
      new Date(c.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000)
    ).length
  };

  const getHealthStatus = () => {
    if (stats.total === 0) return { status: 'error', message: 'Sin contactos' };
    if (stats.recentContacts >= 1) return { status: 'success', message: 'Sistema funcionando' };
    if (stats.total > 0) return { status: 'warning', message: 'Sin contactos recientes' };
    return { status: 'error', message: 'Problema detectado' };
  };

  const health = getHealthStatus();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-admin-text-primary">Estado del Sistema de Contactos</h2>
          <p className="text-admin-text-secondary">Monitoreo en tiempo real del sistema de leads</p>
        </div>
        <div className="flex items-center gap-2">
          {health.status === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
          {health.status === 'warning' && <AlertCircle className="h-5 w-5 text-yellow-500" />}
          {health.status === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
          <Badge 
            variant={health.status === 'success' ? 'default' : health.status === 'warning' ? 'secondary' : 'destructive'}
          >
            {health.message}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">
              Total Contactos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-admin-text-primary">
                {stats.total}
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-admin-text-secondary mt-1">
              Todos los leads registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">
              Leads Calientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-admin-text-primary">
                {stats.hotLeads}
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-admin-text-secondary mt-1">
              Score ≥ 80 o marcados como hot
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">
              Nuevos (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-admin-text-primary">
                {stats.recentContacts}
              </div>
              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
            </div>
            <p className="text-xs text-admin-text-secondary mt-1">
              Últimas 24 horas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-admin-text-secondary">
              Tasa Conversión
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold text-admin-text-primary">
                {stats.total > 0 ? ((stats.qualified / stats.total) * 100).toFixed(1) : 0}%
              </div>
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            <p className="text-xs text-admin-text-secondary mt-1">
              Nuevos → Calificados
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>
              Estado actual de todos los contactos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-text-secondary">Nuevos</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="progress-bar-fill bg-blue-500" 
                      style={{ '--progress': `${stats.total > 0 ? (stats.new / stats.total) * 100 : 0}%` } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-admin-text-primary w-8">
                    {stats.new}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-text-secondary">Contactados</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="progress-bar-fill bg-yellow-500" 
                      style={{ '--progress': `${stats.total > 0 ? (stats.contacted / stats.total) * 100 : 0}%` } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-admin-text-primary w-8">
                    {stats.contacted}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-admin-text-secondary">Calificados</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="progress-bar-fill bg-green-500" 
                      style={{ '--progress': `${stats.total > 0 ? (stats.qualified / stats.total) * 100 : 0}%` } as React.CSSProperties}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-admin-text-primary w-8">
                    {stats.qualified}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fuentes de Contactos</CardTitle>
            <CardDescription>
              Origen de los leads registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['contact', 'valuation', 'collaborator', 'acquisition', 'general'].map(originType => {
                const count = allContacts.filter(c => c.origin === originType).length;
                const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                
                const originLabels: Record<string, string> = {
                  contact: 'Comerciales',
                  valuation: 'Valoraciones',
                  collaborator: 'Colaboradores',
                  acquisition: 'Adquisiciones',
                  general: 'Generales'
                };
                
                return (
                  <div key={originType} className="flex items-center justify-between">
                    <span className="text-sm text-admin-text-secondary capitalize">
                      {originLabels[originType]}
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className="progress-bar-fill bg-indigo-500" 
                          style={{ '--progress': `${percentage}%` } as React.CSSProperties}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-admin-text-primary w-8">
                        {count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ContactsHealthDashboard;