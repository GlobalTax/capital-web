
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Building2, 
  Target, 
  Users, 
  TrendingUp
} from 'lucide-react';
import { IntegrationsMetrics } from '@/types/integrations';

interface IntegrationsKPICardsProps {
  metrics: IntegrationsMetrics | null;
}

const IntegrationsKPICards = ({ metrics }: IntegrationsKPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Empresas Enriquecidas</CardTitle>
          <Building2 className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.apolloEnrichments || 0}</div>
          <p className="text-xs text-muted-foreground">Con datos de Apollo</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversiones Ads</CardTitle>
          <Target className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.adConversions || 0}</div>
          <p className="text-xs text-muted-foreground">Últimos 30 días</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Señales LinkedIn</CardTitle>
          <Users className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.linkedinSignals || 0}</div>
          <p className="text-xs text-muted-foreground">Inteligencia social</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
          <TrendingUp className="h-4 w-4 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics?.successRate.toFixed(1) || 0}%</div>
          <p className="text-xs text-muted-foreground">Integraciones exitosas</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsKPICards;
