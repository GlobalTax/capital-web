
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLeadScoringCore } from '@/hooks/useLeadScoringCore';
import HotLeadsSection from '@/components/admin/leads/HotLeadsSection';
import LeadAlertsSection from '@/components/admin/leads/LeadAlertsSection';
import LeadStatsCards from '@/components/admin/leads/LeadStatsCards';

const LeadScoringManager = () => {
  const { 
    hotLeads, 
    allLeads, 
    unreadAlerts, 
    isLoadingHotLeads, 
    isLoadingAllLeads,
    getLeadStats,
    markAlertAsRead 
  } = useLeadScoringCore();

  const stats = getLeadStats();

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
      <LeadStatsCards 
        stats={stats}
        unreadAlertsCount={unreadAlerts?.length || 0}
        isLoading={isLoadingAllLeads}
      />

      {/* Hot Leads Section */}
      <HotLeadsSection 
        hotLeads={hotLeads || []}
        isLoading={isLoadingHotLeads}
      />

      {/* Alerts Section */}
      <LeadAlertsSection 
        unreadAlerts={unreadAlerts}
        onMarkAsRead={(alertId) => markAlertAsRead.mutate(alertId)}
      />

      {/* Summary Section */}
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
