// ============= LEAD SCORING CARD COMPONENT =============
// Componente para mostrar métricas de lead scoring

import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LeadScoringMetrics } from '@/core/types';

interface LeadScoringCardProps {
  metrics: LeadScoringMetrics;
}

const LeadScoringCard = memo(({ metrics }: LeadScoringCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Scoring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-sm">Leads Calientes</span>
            <Badge variant="destructive">{metrics.hotLeads}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Leads Medios</span>
            <Badge variant="secondary">{metrics.mediumLeads}</Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Leads Fríos</span>
            <Badge variant="outline">{metrics.coldLeads}</Badge>
          </div>
          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tasa de Conversión</span>
              <span className="text-sm">{metrics.conversionRate}%</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Total Eventos</span>
            <span className="text-sm">{metrics.totalEvents.toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

LeadScoringCard.displayName = 'LeadScoringCard';

export { LeadScoringCard };