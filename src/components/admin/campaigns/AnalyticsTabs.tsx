import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, AlertTriangle, LineChart, RefreshCw } from 'lucide-react';
import { EvolutionTable } from './EvolutionTable';
import { CampaignSummaryTable } from './CampaignSummaryTable';
import { AlertsTable } from './AlertsTable';
import { CPLEvolutionChart } from './CPLEvolutionChart';
import { LeadsVsSpendChart } from './LeadsVsSpendChart';
import { StatusDistributionChart } from './StatusDistributionChart';
import { useCampaignHistory, type PeriodFilter } from '@/hooks/useCampaignHistory';

export const AnalyticsTabs: React.FC = () => {
  const [period, setPeriod] = useState<PeriodFilter>('30d');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');

  const {
    isLoading,
    error,
    refetch,
    evolutionData,
    campaignSummaries,
    alertsData,
    cplEvolutionData,
    leadsVsSpendData,
    statusDistributionData,
    uniqueCampaigns,
    hasEnoughData,
  } = useCampaignHistory(period, campaignFilter);

  // Handle query error with fallback UI
  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center space-y-4">
            <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                No se pudieron cargar los datos de análisis
              </h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Ha ocurrido un error al obtener el histórico de campañas. Puedes reintentar o continuar con las otras secciones.
              </p>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            Análisis Histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Período:</span>
              <Select
                value={period}
                onValueChange={(value) => setPeriod(value as PeriodFilter)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 días</SelectItem>
                  <SelectItem value="30d">30 días</SelectItem>
                  <SelectItem value="90d">90 días</SelectItem>
                  <SelectItem value="all">Todo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Campaña:</span>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las campañas</SelectItem>
                  {uniqueCampaigns.map((campaign) => (
                    <SelectItem key={campaign} value={campaign}>
                      {campaign}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="evolution" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="evolution" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Evolución</span>
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Resumen</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="hidden sm:inline">Alertas</span>
          </TabsTrigger>
        </TabsList>

        {/* Evolution Tab */}
        <TabsContent value="evolution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <EvolutionTable data={evolutionData} isLoading={isLoading} />
            {hasEnoughData && (
              <CPLEvolutionChart data={cplEvolutionData} isLoading={isLoading} />
            )}
          </div>
        </TabsContent>

        {/* Summary Tab */}
        <TabsContent value="summary" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <CampaignSummaryTable data={campaignSummaries} isLoading={isLoading} />
            {hasEnoughData && (
              <LeadsVsSpendChart data={leadsVsSpendData} isLoading={isLoading} />
            )}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AlertsTable data={alertsData} isLoading={isLoading} />
            {hasEnoughData && (
              <StatusDistributionChart data={statusDistributionData} isLoading={isLoading} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
