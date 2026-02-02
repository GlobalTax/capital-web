// ============= CONTACTS STATS PANEL =============
// Panel principal de estadísticas con Control de Costes
// Cada tab está protegido con Error Boundary para aislamiento de fallos

import React, { useState, Suspense } from 'react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, BarChart3, TrendingUp, Euro, CircleOff, RefreshCw, Table2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { useContactsCostAnalysis } from '../../hooks/useContactsCostAnalysis';
import { StatsKPICards } from './StatsKPICards';
import { ChannelCostAnalysis } from './ChannelCostAnalysis';
import { TimeEvolutionChart } from './TimeEvolutionChart';
import { EconomicFunnel } from './EconomicFunnel';
import { QualityVsCostMatrix } from './QualityVsCostMatrix';
import { StatsErrorBoundary } from './StatsErrorBoundary';

// Cost Control components
import { CampaignRegistryTable } from '@/components/admin/campaigns/CampaignRegistryTable';
import { AnalyticsTabs } from '@/components/admin/campaigns/AnalyticsTabs';
import { AdsCostsHistoryTable } from '@/components/admin/campaigns/AdsCostsHistoryTable';
import { MetaAdsAnalyticsDashboard } from '@/components/admin/campaigns/MetaAdsAnalytics';
import { LeadMetricsDashboard } from '@/components/admin/metrics';

// Loading fallback for Suspense
const SectionLoading = () => (
  <Card>
    <CardContent className="py-12">
      <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="text-sm">Cargando datos...</span>
      </div>
    </CardContent>
  </Card>
);
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

        {/* Tab: Cost Control - protected with error boundary */}
        <TabsContent value="costs" className="space-y-6 mt-4">
          <StatsErrorBoundary section="Control de Costes">
            <Suspense fallback={<SectionLoading />}>
              {/* Campaign Registry Table - PRIMARY INPUT */}
              <CampaignRegistryTable />

              {/* Analytics Tabs (derived from history) */}
              <AnalyticsTabs />
            </Suspense>
          </StatsErrorBoundary>
        </TabsContent>

        {/* Tab: Meta Ads - protected with error boundary */}
        <TabsContent value="meta_ads" className="space-y-6 mt-4">
          <StatsErrorBoundary section="Meta Ads">
            <Suspense fallback={<SectionLoading />}>
              <MetaAdsAnalyticsDashboard />
            </Suspense>
          </StatsErrorBoundary>
        </TabsContent>

        {/* Tab: Google Ads - protected with error boundary */}
        <TabsContent value="google_ads" className="space-y-6 mt-4">
          <StatsErrorBoundary section="Google Ads">
            <Suspense fallback={<SectionLoading />}>
              <AdsCostsHistoryTable platform="google_ads" />
            </Suspense>
          </StatsErrorBoundary>
        </TabsContent>

        {/* Tab: Lead Metrics - protected with error boundary */}
        <TabsContent value="metrics" className="space-y-6 mt-4">
          <StatsErrorBoundary section="Métricas de Leads">
            <Suspense fallback={<SectionLoading />}>
              <LeadMetricsDashboard />
            </Suspense>
          </StatsErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContactsStatsPanel;