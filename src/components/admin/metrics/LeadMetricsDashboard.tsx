// ============= LEAD METRICS DASHBOARD =============
// Dashboard principal de métricas de leads

import React, { useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { RefreshCw, Calendar, BarChart3, ChevronDown, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { cn } from '@/lib/utils';

import { useLeadMetrics } from './useLeadMetrics';
import { MetricsKPISummary } from './MetricsKPISummary';
import { StatusDistributionBlock } from './StatusDistributionBlock';
import { ConversionFunnelBlock } from './ConversionFunnelBlock';
import { CampaignQualityBlock } from './CampaignQualityBlock';
import { TemporalEvolutionBlock } from './TemporalEvolutionBlock';
import { ChannelConversionBlock } from './ChannelConversionBlock';
import { FormConversionBlock } from './FormConversionBlock';
import { ChannelEvolutionBlock } from './ChannelEvolutionBlock';

type PeriodPreset = 'all' | 'week' | 'month' | 'quarter' | 'custom';

const PERIOD_PRESETS: { value: PeriodPreset; label: string }[] = [
  { value: 'all', label: 'Todo el histórico' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
  { value: 'quarter', label: 'Último trimestre' },
  { value: 'custom', label: 'Personalizado' },
];

export const LeadMetricsDashboard: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodPreset>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate date filters based on period
  const getDateFilters = () => {
    const now = new Date();
    
    switch (selectedPeriod) {
      case 'week':
        return { dateFrom: subDays(now, 7), dateTo: now };
      case 'month':
        return { dateFrom: subMonths(now, 1), dateTo: now };
      case 'quarter':
        return { dateFrom: subMonths(now, 3), dateTo: now };
      case 'custom':
        return { 
          dateFrom: dateRange?.from, 
          dateTo: dateRange?.to || dateRange?.from 
        };
      default:
        return {};
    }
  };

  const { metrics, isLoading, refetch, totalLeads, filteredCount } = useLeadMetrics(getDateFilters());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handlePeriodChange = (value: PeriodPreset) => {
    setSelectedPeriod(value);
    if (value !== 'custom') {
      setDateRange(undefined);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Métricas de Leads
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            Análisis de conversión y calidad de leads
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <Select value={selectedPeriod} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-44 h-9">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_PRESETS.map(preset => (
                <SelectItem key={preset.value} value={preset.value}>
                  {preset.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Custom Date Range Picker */}
          {selectedPeriod === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-9 gap-2">
                  {dateRange?.from ? (
                    dateRange.to ? (
                      `${format(dateRange.from, 'dd MMM', { locale: es })} - ${format(dateRange.to, 'dd MMM', { locale: es })}`
                    ) : (
                      format(dateRange.from, 'dd MMM', { locale: es })
                    )
                  ) : (
                    'Seleccionar fechas'
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <CalendarComponent
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  locale={es}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          )}

          {/* Refresh */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Period Indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Mostrando:</span>
        <span className="font-medium text-foreground">
          {filteredCount.toLocaleString('es-ES')} leads
        </span>
        {filteredCount !== totalLeads && (
          <span>de {totalLeads.toLocaleString('es-ES')} totales</span>
        )}
      </div>

      <Separator />

      {/* KPI Summary */}
      <MetricsKPISummary 
        totals={metrics.totals} 
        isLoading={isLoading} 
      />

      <Separator />

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <StatusDistributionBlock 
          data={metrics.statusDistribution}
          totalLeads={metrics.totals.totalLeads}
          isLoading={isLoading}
        />

        {/* Conversion Funnel */}
        <ConversionFunnelBlock 
          data={metrics.funnel}
          isLoading={isLoading}
        />
      </div>

      <Separator />

      {/* Campaign Quality */}
      <CampaignQualityBlock 
        data={metrics.campaignQuality}
        isLoading={isLoading}
      />

      <Separator />

      {/* Temporal Evolution */}
      <TemporalEvolutionBlock 
        data={metrics.temporalEvolution}
        isLoading={isLoading}
      />

      <Separator />

      {/* Channel Conversion */}
      <ChannelConversionBlock
        data={metrics.conversionMetrics?.byChannel || []}
        isLoading={isLoading}
      />

      <Separator />

      {/* Form Conversion */}
      <FormConversionBlock
        data={metrics.conversionMetrics?.byForm || []}
        isLoading={isLoading}
      />

      <Separator />

      {/* Channel Evolution */}
      <ChannelEvolutionBlock
        data={metrics.conversionMetrics?.channelTimeSeries || []}
        isLoading={isLoading}
      />

      {/* Footer */}
      <div className="text-xs text-muted-foreground text-center pt-4 border-t">
        <p>
          💡 Las métricas se calculan en tiempo real a partir de los leads del CRM.
          Los datos se actualizan automáticamente al cambiar estados o añadir nuevos leads.
        </p>
      </div>
    </div>
  );
};

export default LeadMetricsDashboard;
