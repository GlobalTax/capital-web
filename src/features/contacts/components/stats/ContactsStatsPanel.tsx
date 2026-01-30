// ============= CONTACTS STATS PANEL =============
// Panel principal de estadísticas con Control de Costes

import React, { useState } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, BarChart3, TrendingUp, Euro, CircleOff, RefreshCw, Table2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

import { useContactsCostAnalysis } from '../../hooks/useContactsCostAnalysis';
import { StatsKPICards } from './StatsKPICards';
import { ChannelCostAnalysis } from './ChannelCostAnalysis';
import { TimeEvolutionChart } from './TimeEvolutionChart';
import { EconomicFunnel } from './EconomicFunnel';
import { QualityVsCostMatrix } from './QualityVsCostMatrix';

// Cost Control components
import { CampaignRegistryTable } from '@/components/admin/campaigns/CampaignRegistryTable';
import { AnalyticsTabs } from '@/components/admin/campaigns/AnalyticsTabs';
import { AdsCostsHistoryTable } from '@/components/admin/campaigns/AdsCostsHistoryTable';
import { MetaAdsAnalyticsDashboard } from '@/components/admin/campaigns/MetaAdsAnalytics';

type PeriodPreset = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: 'today', label: 'Hoy' },
  { value: 'week', label: 'Esta semana' },
  { value: 'month', label: 'Este mes' },
  { value: 'quarter', label: 'Último trimestre' },
  { value: 'year', label: 'Este año' },
  { value: 'custom', label: 'Personalizado' },
];

const getDateRange = (preset: PeriodPreset): { from: string; to: string } => {
  const today = new Date();
  
  switch (preset) {
    case 'today':
      return {
        from: format(today, 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
      };
    case 'week':
      return {
        from: format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        to: format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    case 'month':
      return {
        from: format(startOfMonth(today), 'yyyy-MM-dd'),
        to: format(endOfMonth(today), 'yyyy-MM-dd'),
      };
    case 'quarter':
      return {
        from: format(subMonths(today, 3), 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
      };
    case 'year':
      return {
        from: format(new Date(today.getFullYear(), 0, 1), 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
      };
    default:
      return {
        from: format(subMonths(today, 1), 'yyyy-MM-dd'),
        to: format(today, 'yyyy-MM-dd'),
      };
  }
};

export const ContactsStatsPanel: React.FC = () => {
  const {
    isLoading,
    filters,
    setFilters,
    metrics,
    channelMetrics,
    funnelStages,
    qualityMetrics,
    getTimeSeries,
  } = useContactsCostAnalysis();

  const [selectedPreset, setSelectedPreset] = useState<PeriodPreset>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'costs' | 'meta_ads' | 'google_ads' | 'metrics'>('costs');

  const handlePresetChange = (preset: PeriodPreset) => {
    setSelectedPreset(preset);
    if (preset !== 'custom') {
      const range = getDateRange(preset);
      setFilters(prev => ({
        ...prev,
        dateFrom: range.from,
        dateTo: range.to,
        periodLabel: PERIOD_PRESETS.find(p => p.value === preset)?.label,
      }));
    }
  };

  const handleToggleCosts = () => {
    setFilters(prev => ({ ...prev, showCosts: !prev.showCosts }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Control de costes y métricas de contactos
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Main Tabs: Cost Control vs Contact Metrics */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'costs' | 'metrics')}>
        <TabsList className="grid w-full max-w-2xl grid-cols-4">
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <Table2 className="h-4 w-4" />
            Control de Costes
          </TabsTrigger>
          <TabsTrigger value="meta_ads" className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-blue-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">M</span>
            </div>
            Meta Ads
          </TabsTrigger>
          <TabsTrigger value="google_ads" className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-amber-500 flex items-center justify-center">
              <span className="text-white text-[10px] font-bold">G</span>
            </div>
            Google Ads
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Métricas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Cost Control */}
        <TabsContent value="costs" className="space-y-6 mt-4">
          {/* Campaign Registry Table - PRIMARY INPUT */}
          <CampaignRegistryTable />

          {/* Analytics Tabs (derived from history) */}
          <AnalyticsTabs />
        </TabsContent>

        {/* Tab: Meta Ads - NEW ANALYTICS DASHBOARD */}
        <TabsContent value="meta_ads" className="space-y-6 mt-4">
          <MetaAdsAnalyticsDashboard />
        </TabsContent>

        {/* Tab: Google Ads */}
        <TabsContent value="google_ads" className="space-y-6 mt-4">
          <AdsCostsHistoryTable platform="google_ads" />
        </TabsContent>

        {/* Tab: Contact Metrics (existing content) */}
        <TabsContent value="metrics" className="space-y-6 mt-4">
          {/* Controls for metrics tab */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Toggle costes */}
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-1.5">
              {filters.showCosts ? (
                <Euro className="h-4 w-4 text-amber-600" />
              ) : (
                <CircleOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-xs font-medium">Costes</span>
              <Switch
                checked={filters.showCosts}
                onCheckedChange={handleToggleCosts}
                className="scale-75"
              />
            </div>

            {/* Period selector */}
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <Calendar className="h-3 w-3 mr-1" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_PRESETS.map(preset => (
                  <SelectItem key={preset.value} value={preset.value} className="text-xs">
                    {preset.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Custom date range */}
            {selectedPreset === 'custom' && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    {format(new Date(filters.dateFrom), 'dd MMM', { locale: es })} - {format(new Date(filters.dateTo), 'dd MMM', { locale: es })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="range"
                    selected={{
                      from: new Date(filters.dateFrom),
                      to: new Date(filters.dateTo),
                    }}
                    onSelect={(range) => {
                      if (range?.from && range?.to) {
                        setFilters(prev => ({
                          ...prev,
                          dateFrom: format(range.from!, 'yyyy-MM-dd'),
                          dateTo: format(range.to!, 'yyyy-MM-dd'),
                        }));
                      }
                    }}
                    locale={es}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>

          {/* Period indicator */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Periodo:</span>
            <span className="font-medium text-foreground">
              {format(new Date(filters.dateFrom), 'dd MMM yyyy', { locale: es })} - {format(new Date(filters.dateTo), 'dd MMM yyyy', { locale: es })}
            </span>
            {filters.compareWithPrevious && (
              <span className="text-muted-foreground">
                (comparando con periodo anterior)
              </span>
            )}
          </div>

          {/* KPI Cards */}
          <StatsKPICards 
            metrics={metrics} 
            showCosts={filters.showCosts}
            isLoading={isLoading}
          />

          {/* Main charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Channel Analysis */}
            <ChannelCostAnalysis 
              channelMetrics={channelMetrics}
              showCosts={filters.showCosts}
              isLoading={isLoading}
            />

            {/* Time Evolution */}
            <TimeEvolutionChart 
              getTimeSeries={getTimeSeries}
              showCosts={filters.showCosts}
              isLoading={isLoading}
            />
          </div>

          {/* Secondary charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quality vs Cost */}
            <QualityVsCostMatrix 
              qualityMetrics={qualityMetrics}
              channelMetrics={channelMetrics}
              showCosts={filters.showCosts}
              isLoading={isLoading}
            />

            {/* Economic Funnel */}
            <EconomicFunnel 
              stages={funnelStages}
              showCosts={filters.showCosts}
              isLoading={isLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactsStatsPanel;