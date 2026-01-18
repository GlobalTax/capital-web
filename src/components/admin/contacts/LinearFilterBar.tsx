import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  X, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronDown,
  Building2,
  Mail,
  TrendingUp,
  Euro,
  Megaphone,
  CalendarDays,
} from 'lucide-react';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  startOfQuarter,
  subDays,
} from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { ContactFilters, ContactOrigin } from '@/hooks/useUnifiedContacts';
import { SmartSearchFilters } from '@/hooks/useSmartSearch';
import SmartSearchInput from './SmartSearchInput';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/shared/utils/format';
import { useAcquisitionChannels } from '@/hooks/useAcquisitionChannels';

interface LinearFilterBarProps {
  filters: ContactFilters;
  onFiltersChange: (filters: ContactFilters) => void;
  totalCount: number;
  filteredCount: number;
  selectedCount: number;
  onRefresh: () => void;
  onExport?: () => void;
  isRefreshing?: boolean;
}

// 🔥 Quick presets for financial filters
const REVENUE_PRESETS = [
  { label: '>500k', value: 500000 },
  { label: '>1M', value: 1000000 },
  { label: '>5M', value: 5000000 },
  { label: '>10M', value: 10000000 },
];

const EBITDA_PRESETS = [
  { label: '>100k', value: 100000 },
  { label: '>500k', value: 500000 },
  { label: '>1M', value: 1000000 },
];

const originOptions: { value: ContactOrigin; label: string }[] = [
  { value: 'valuation', label: 'Valoración' },
  { value: 'contact', label: 'Comercial' },
  { value: 'collaborator', label: 'Colaborador' },
  { value: 'acquisition', label: 'Adquisición' },
  { value: 'company_acquisition', label: 'Compra' },
  { value: 'advisor', label: 'Asesor' },
];

const statusOptions = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'contactando', label: 'Contactando' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'en_espera', label: 'En Espera' },
  { value: 'propuesta_enviada', label: 'Propuesta' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
];

const emailStatusOptions = [
  { value: 'opened', label: 'Abiertos' },
  { value: 'sent', label: 'Enviados' },
  { value: 'not_contacted', label: 'Sin contactar' },
];

// 📅 Date period presets
const DATE_PERIOD_PRESETS = [
  { value: 'today', label: 'Hoy' },
  { value: 'this_week', label: 'Esta semana' },
  { value: 'this_month', label: 'Este mes' },
  { value: 'this_quarter', label: 'Este trimestre' },
  { value: 'last_7_days', label: 'Últimos 7 días' },
  { value: 'last_30_days', label: 'Últimos 30 días' },
  { value: 'last_90_days', label: 'Últimos 90 días' },
];

// Helper to calculate date range from period
const getDateRangeFromPeriod = (period: string) => {
  const now = new Date();
  switch (period) {
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'this_week':
      return { from: startOfWeek(now, { weekStartsOn: 1 }), to: endOfDay(now) };
    case 'this_month':
      return { from: startOfMonth(now), to: endOfDay(now) };
    case 'this_quarter':
      return { from: startOfQuarter(now), to: endOfDay(now) };
    case 'last_7_days':
      return { from: subDays(startOfDay(now), 7), to: endOfDay(now) };
    case 'last_30_days':
      return { from: subDays(startOfDay(now), 30), to: endOfDay(now) };
    case 'last_90_days':
      return { from: subDays(startOfDay(now), 90), to: endOfDay(now) };
    default:
      return null;
  }
};

const LinearFilterBar: React.FC<LinearFilterBarProps> = ({
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
  selectedCount,
  onRefresh,
  onExport,
  isRefreshing = false,
}) => {
  const { channels } = useAcquisitionChannels();
  
  const handleFilterChange = (key: keyof ContactFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handleSmartFiltersChange = (smartFilters: SmartSearchFilters) => {
    // Map smart search filters to contact filters
    const newFilters: ContactFilters = {
      ...filters,
      // Text search
      search: smartFilters.text_search || filters.search,
      // Origin mapping
      origin: smartFilters.origin as ContactOrigin || filters.origin,
      // Status mapping
      status: smartFilters.status || smartFilters.lead_status_crm || filters.status,
      // Email status
      emailStatus: smartFilters.email_status as any || filters.emailStatus,
      // Sector
      sector: smartFilters.sector || filters.sector,
      // Advanced filters
      revenueMin: smartFilters.revenue_min,
      revenueMax: smartFilters.revenue_max,
      ebitdaMin: smartFilters.ebitda_min,
      ebitdaMax: smartFilters.ebitda_max,
      employeeMin: smartFilters.employee_min,
      employeeMax: smartFilters.employee_max,
      location: smartFilters.location,
    };

    // Date range handling
    if (smartFilters.date_range) {
      const today = new Date();
      let dateFrom: Date | undefined;
      
      switch (smartFilters.date_range) {
        case 'today':
          dateFrom = new Date(today.setHours(0, 0, 0, 0));
          break;
        case 'last_7_days':
          dateFrom = new Date(today.setDate(today.getDate() - 7));
          break;
        case 'last_30_days':
          dateFrom = new Date(today.setDate(today.getDate() - 30));
          break;
        case 'last_90_days':
          dateFrom = new Date(today.setDate(today.getDate() - 90));
          break;
        case 'this_year':
          dateFrom = new Date(today.getFullYear(), 0, 1);
          break;
      }
      
      if (dateFrom) {
        newFilters.dateFrom = dateFrom.toISOString().split('T')[0];
        newFilters.dateRangeLabel = smartFilters.date_range;
      }
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      origin: 'all',
      emailStatus: 'all',
      acquisitionChannelId: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      dateRangeLabel: undefined,
      showUniqueContacts: filters.showUniqueContacts,
    });
  };

  // 📅 Handle period change
  const handlePeriodChange = (period: string | undefined) => {
    if (!period) {
      onFiltersChange({
        ...filters,
        dateFrom: undefined,
        dateTo: undefined,
        dateRangeLabel: undefined,
      });
      return;
    }
    
    const range = getDateRangeFromPeriod(period);
    if (range) {
      onFiltersChange({
        ...filters,
        dateFrom: range.from.toISOString().split('T')[0],
        dateTo: range.to.toISOString().split('T')[0],
        dateRangeLabel: period,
      });
    }
  };

  // Get selected period label for display
  const selectedPeriodLabel = filters.dateRangeLabel 
    ? DATE_PERIOD_PRESETS.find(p => p.value === filters.dateRangeLabel)?.label 
    : null;

  const activeFilterCount = [
    filters.search,
    filters.origin && filters.origin !== 'all',
    filters.status,
    filters.emailStatus && filters.emailStatus !== 'all',
    filters.dateFrom || filters.dateTo,
    filters.sector,
    filters.revenueMin || filters.revenueMax,
    filters.ebitdaMin || filters.ebitdaMax,
    filters.employeeMin || filters.employeeMax,
    filters.location,
    filters.acquisitionChannelId,
  ].filter(Boolean).length;

  // Get selected channel name for display
  const selectedChannelName = filters.acquisitionChannelId 
    ? channels?.find(c => c.id === filters.acquisitionChannelId)?.name 
    : null;

  // 🔥 Clear revenue filters helper
  const clearRevenueFilters = () => {
    onFiltersChange({
      ...filters,
      revenueMin: undefined,
      revenueMax: undefined,
    });
  };

  // 🔥 Clear EBITDA filters helper
  const clearEbitdaFilters = () => {
    onFiltersChange({
      ...filters,
      ebitdaMin: undefined,
      ebitdaMax: undefined,
    });
  };

  return (
    <div className="space-y-3">
      {/* 🔥 Single Unified Search Bar with AI */}
      <SmartSearchInput
        onFiltersChange={handleSmartFiltersChange}
        onTextSearchChange={(text) => handleFilterChange('search', text)}
        className="w-full"
      />

      {/* Traditional filter dropdowns */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Origin filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]",
                filters.origin && filters.origin !== 'all' && "border-[hsl(var(--accent-primary))] text-[hsl(var(--accent-primary))]"
              )}
            >
              <Building2 className="h-3.5 w-3.5 mr-1.5" />
              Origen
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]">
            <DropdownMenuCheckboxItem
              checked={!filters.origin || filters.origin === 'all'}
              onCheckedChange={() => handleFilterChange('origin', 'all')}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            {originOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.origin === option.value}
                onCheckedChange={() => handleFilterChange('origin', option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]",
                filters.status && "border-[hsl(var(--accent-primary))] text-[hsl(var(--accent-primary))]"
              )}
            >
              <Filter className="h-3.5 w-3.5 mr-1.5" />
              Estado
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]">
            <DropdownMenuCheckboxItem
              checked={!filters.status}
              onCheckedChange={() => handleFilterChange('status', undefined)}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.status === option.value}
                onCheckedChange={() => handleFilterChange('status', option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Email status filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]",
                filters.emailStatus && filters.emailStatus !== 'all' && "border-[hsl(var(--accent-primary))] text-[hsl(var(--accent-primary))]"
              )}
            >
              <Mail className="h-3.5 w-3.5 mr-1.5" />
              Email
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44 bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]">
            <DropdownMenuCheckboxItem
              checked={!filters.emailStatus || filters.emailStatus === 'all'}
              onCheckedChange={() => handleFilterChange('emailStatus', 'all')}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            {emailStatusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={filters.emailStatus === option.value}
                onCheckedChange={() => handleFilterChange('emailStatus', option.value as any)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 📢 Channel filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]",
                filters.acquisitionChannelId && "border-purple-500 text-purple-600 bg-purple-500/5"
              )}
            >
              <Megaphone className="h-3.5 w-3.5 mr-1.5" />
              Canal
              {selectedChannelName && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px] bg-purple-500/20 text-purple-600 max-w-[80px] truncate">
                  {selectedChannelName}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 max-h-80 overflow-y-auto bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]">
            <DropdownMenuCheckboxItem
              checked={!filters.acquisitionChannelId}
              onCheckedChange={() => handleFilterChange('acquisitionChannelId', undefined)}
            >
              Todos los canales
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            {channels?.map((channel) => (
              <DropdownMenuCheckboxItem
                key={channel.id}
                checked={filters.acquisitionChannelId === channel.id}
                onCheckedChange={() => handleFilterChange('acquisitionChannelId', channel.id)}
              >
                {channel.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 📅 Period filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]",
                filters.dateRangeLabel && "border-orange-500 text-orange-600 bg-orange-500/5"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              Período
              {selectedPeriodLabel && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1.5 text-[10px] bg-orange-500/20 text-orange-600">
                  {selectedPeriodLabel}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]">
            <DropdownMenuCheckboxItem
              checked={!filters.dateRangeLabel}
              onCheckedChange={() => handlePeriodChange(undefined)}
            >
              Todo el tiempo
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            {DATE_PERIOD_PRESETS.map((preset) => (
              <DropdownMenuCheckboxItem
                key={preset.value}
                checked={filters.dateRangeLabel === preset.value}
                onCheckedChange={() => handlePeriodChange(preset.value)}
              >
                {preset.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 💰 Revenue filter dropdown - VISIBLE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]",
                (filters.revenueMin || filters.revenueMax) && "border-emerald-500 text-emerald-600 bg-emerald-500/5"
              )}
            >
              <Euro className="h-3.5 w-3.5 mr-1.5" />
              Facturación
              {filters.revenueMin && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px] bg-emerald-500/20 text-emerald-600">
                  {'>'}{formatCurrency(filters.revenueMin)}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]">
            <DropdownMenuCheckboxItem
              checked={!filters.revenueMin && !filters.revenueMax}
              onCheckedChange={() => clearRevenueFilters()}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            {REVENUE_PRESETS.map((preset) => (
              <DropdownMenuCheckboxItem
                key={preset.value}
                checked={filters.revenueMin === preset.value}
                onCheckedChange={() => handleFilterChange('revenueMin', filters.revenueMin === preset.value ? undefined : preset.value)}
              >
                &gt; {preset.label} €
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            <div className="px-2 py-2 space-y-2">
              <Label className="text-xs text-muted-foreground">Rango personalizado</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.revenueMin || ''}
                  onChange={(e) => handleFilterChange('revenueMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-7 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={filters.revenueMax || ''}
                  onChange={(e) => handleFilterChange('revenueMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* 📊 EBITDA filter dropdown - VISIBLE */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm" 
              className={cn(
                "h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]",
                (filters.ebitdaMin || filters.ebitdaMax) && "border-blue-500 text-blue-600 bg-blue-500/5"
              )}
            >
              <TrendingUp className="h-3.5 w-3.5 mr-1.5" />
              EBITDA
              {filters.ebitdaMin && (
                <Badge variant="secondary" className="ml-1.5 h-4 px-1 text-[10px] bg-blue-500/20 text-blue-600">
                  {'>'}{formatCurrency(filters.ebitdaMin)}
                </Badge>
              )}
              <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 bg-[hsl(var(--linear-bg-elevated))] border-[hsl(var(--linear-border))]">
            <DropdownMenuCheckboxItem
              checked={!filters.ebitdaMin && !filters.ebitdaMax}
              onCheckedChange={() => clearEbitdaFilters()}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            {EBITDA_PRESETS.map((preset) => (
              <DropdownMenuCheckboxItem
                key={preset.value}
                checked={filters.ebitdaMin === preset.value}
                onCheckedChange={() => handleFilterChange('ebitdaMin', filters.ebitdaMin === preset.value ? undefined : preset.value)}
              >
                &gt; {preset.label} €
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator className="bg-[hsl(var(--linear-border))]" />
            <div className="px-2 py-2 space-y-2">
              <Label className="text-xs text-muted-foreground">Rango personalizado</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Mín"
                  value={filters.ebitdaMin || ''}
                  onChange={(e) => handleFilterChange('ebitdaMin', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-7 text-xs"
                />
                <Input
                  type="number"
                  placeholder="Máx"
                  value={filters.ebitdaMax || ''}
                  onChange={(e) => handleFilterChange('ebitdaMax', e.target.value ? Number(e.target.value) : undefined)}
                  className="h-7 text-xs"
                />
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear all filters */}
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-sm text-muted-foreground hover:text-foreground"
            onClick={clearAllFilters}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Limpiar ({activeFilterCount})
          </Button>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Unique contacts toggle */}
        <div className="flex items-center gap-2 mr-2">
          <Switch
            id="unique-contacts"
            checked={filters.showUniqueContacts || false}
            onCheckedChange={(checked) => handleFilterChange('showUniqueContacts', checked)}
            className="h-4 w-7"
          />
          <label htmlFor="unique-contacts" className="text-xs text-muted-foreground cursor-pointer">
            Únicos
          </label>
        </div>

        {/* Actions */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={cn("h-3.5 w-3.5 mr-1.5", isRefreshing && "animate-spin")} />
          Actualizar
        </Button>

        {onExport && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-sm border-[hsl(var(--linear-border))] bg-[hsl(var(--linear-bg))]"
            onClick={onExport}
          >
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Exportar
          </Button>
        )}
      </div>

      {/* 🔥 Active Financial Filters Badges */}
      {(filters.revenueMin || filters.revenueMax || filters.ebitdaMin || filters.ebitdaMax || filters.location) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Filtros activos:</span>
          
          {/* Revenue filters */}
          {(filters.revenueMin || filters.revenueMax) && (
            <Badge
              variant="secondary"
              className="gap-1.5 pr-1 bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            >
              <Euro className="h-3 w-3" />
              <span className="text-[10px]">Facturación:</span>
              <span className="font-medium">
                {filters.revenueMin && `>${formatCurrency(filters.revenueMin)}`}
                {filters.revenueMin && filters.revenueMax && ' - '}
                {filters.revenueMax && `<${formatCurrency(filters.revenueMax)}`}
              </span>
              <button
                onClick={clearRevenueFilters}
                className="ml-1 p-0.5 hover:bg-emerald-500/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {/* EBITDA filters */}
          {(filters.ebitdaMin || filters.ebitdaMax) && (
            <Badge
              variant="secondary"
              className="gap-1.5 pr-1 bg-blue-500/10 text-blue-600 border-blue-500/20"
            >
              <TrendingUp className="h-3 w-3" />
              <span className="text-[10px]">EBITDA:</span>
              <span className="font-medium">
                {filters.ebitdaMin && `>${formatCurrency(filters.ebitdaMin)}`}
                {filters.ebitdaMin && filters.ebitdaMax && ' - '}
                {filters.ebitdaMax && `<${formatCurrency(filters.ebitdaMax)}`}
              </span>
              <button
                onClick={clearEbitdaFilters}
                className="ml-1 p-0.5 hover:bg-blue-500/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          {/* Location filter */}
          {filters.location && (
            <Badge
              variant="secondary"
              className="gap-1.5 pr-1 bg-purple-500/10 text-purple-600 border-purple-500/20"
            >
              <span className="text-[10px]">📍</span>
              <span className="font-medium">{filters.location}</span>
              <button
                onClick={() => handleFilterChange('location', undefined)}
                className="ml-1 p-0.5 hover:bg-purple-500/20 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              clearRevenueFilters();
              clearEbitdaFilters();
              handleFilterChange('location', undefined);
            }}
            className="h-5 text-xs px-2 text-muted-foreground hover:text-foreground"
          >
            Limpiar todo
          </Button>
        </div>
      )}

      {/* Results count & selection info */}
      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <span>
          {filteredCount === totalCount 
            ? `${totalCount} contactos` 
            : `${filteredCount} de ${totalCount} contactos`
          }
        </span>
        {selectedCount > 0 && (
          <>
            <span className="text-muted-foreground/50">•</span>
            <span className="text-[hsl(var(--accent-primary))]">
              {selectedCount} seleccionados
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default LinearFilterBar;
