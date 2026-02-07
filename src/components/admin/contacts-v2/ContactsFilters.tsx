// ============= CONTACTS FILTERS =============
// Compact filter bar with stats

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Search, X, TrendingUp, Users, Target, BarChart3, Calendar, Euro } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { ContactFilters as Filters, ContactStats } from './types';
import { cn } from '@/lib/utils';
import { startOfDay, endOfDay, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useContactStatuses, STATUS_COLOR_MAP } from '@/hooks/useContactStatuses';
import { useLeadForms } from '@/hooks/useLeadForms';
import { useAcquisitionChannels } from '@/hooks/useAcquisitionChannels';

interface ContactsFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  stats: ContactStats;
  totalCount: number;
  filteredCount: number;
  onRefresh: () => void;
  isRefreshing: boolean;
  showStats?: boolean;
}

const DATE_PRESETS = [
  { label: 'Última semana', days: 7 },
  { label: 'Último mes', days: 30 },
  { label: 'Últimos 3 meses', days: 90 },
];

const REVENUE_PRESETS = [
  { label: '>500k€', min: 500000 },
  { label: '>1M€', min: 1000000 },
  { label: '>5M€', min: 5000000 },
];

const EBITDA_PRESETS = [
  { label: '>50k€', min: 50000 },
  { label: '>100k€', min: 100000 },
  { label: '>500k€', min: 500000 },
];

const ContactsFilters: React.FC<ContactsFiltersProps> = ({
  filters,
  onFiltersChange,
  stats,
  totalCount,
  filteredCount,
  onRefresh,
  isRefreshing,
  showStats = true,
}) => {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isRevenueOpen, setIsRevenueOpen] = useState(false);
  const [isEbitdaOpen, setIsEbitdaOpen] = useState(false);
  const { activeStatuses } = useContactStatuses();
  const { displayNameGroups } = useLeadForms();
  const { channels } = useAcquisitionChannels();

  const hasActiveFilters = !!(
    filters.search ||
    (filters.status && filters.status !== 'all') ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.revenueMin ||
    filters.revenueMax ||
    filters.ebitdaMin ||
    filters.ebitdaMax ||
    filters.acquisitionChannelId ||
    filters.leadFormId
  );

  const clearFilters = () => {
    onFiltersChange({ emailStatus: 'all' });
  };

  const handleDatePreset = (days: number) => {
    const from = startOfDay(subDays(new Date(), days)).toISOString();
    const to = endOfDay(new Date()).toISOString();
    onFiltersChange({ 
      ...filters, 
      dateFrom: from, 
      dateTo: to,
      dateRangeLabel: DATE_PRESETS.find(p => p.days === days)?.label
    });
  };

  const handleRevenuePreset = (min: number) => {
    onFiltersChange({ ...filters, revenueMin: min, revenueMax: undefined });
    setIsRevenueOpen(false);
  };

  const handleEbitdaPreset = (min: number) => {
    onFiltersChange({ ...filters, ebitdaMin: min, ebitdaMax: undefined });
    setIsEbitdaOpen(false);
  };

  return (
    <div className="flex flex-col gap-1 shrink-0">
      {/* Stats Row (optional) */}
      {showStats && (
        <div className="flex items-center gap-3 text-xs py-0.5">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="h-3 w-3 text-muted-foreground" />
            <span className="text-muted-foreground">Total:</span>
            <span className="font-semibold">{stats.total.toLocaleString()}</span>
          </div>
          <span className="text-muted-foreground/40">|</span>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3 w-3 text-emerald-500" />
            <span className="text-muted-foreground">Valoraciones:</span>
            <span className="font-semibold text-emerald-600">{(stats.byOrigin.valuation || 0).toLocaleString()}</span>
          </div>
          <span className="text-muted-foreground/40">|</span>
          <div className="flex items-center gap-1.5">
            <Users className="h-3 w-3 text-blue-500" />
            <span className="text-muted-foreground">Únicos:</span>
            <span className="font-semibold text-blue-600">{stats.uniqueContacts.toLocaleString()}</span>
          </div>
          <span className="text-muted-foreground/40">|</span>
          <div className="flex items-center gap-1.5">
            <Target className="h-3 w-3 text-amber-500" />
            <span className="text-muted-foreground">Calificados:</span>
            <span className="font-semibold text-amber-600">{stats.qualified.toLocaleString()}</span>
          </div>
        </div>
      )}

      {/* Filter Row */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            value={filters.search || ''}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="h-7 pl-7 text-xs"
          />
        </div>

        {/* Status Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              Estado
              {filters.status && filters.status !== 'all' && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">1</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={!filters.status || filters.status === 'all'}
              onCheckedChange={() => onFiltersChange({ ...filters, status: 'all' })}
            >
              Todos
            </DropdownMenuCheckboxItem>
            {activeStatuses.map(s => {
              const colors = STATUS_COLOR_MAP[s.color] || STATUS_COLOR_MAP['gray'];
              return (
                <DropdownMenuCheckboxItem
                  key={s.status_key}
                  checked={filters.status === s.status_key}
                  onCheckedChange={() => onFiltersChange({ ...filters, status: s.status_key })}
                >
                  <span className={cn('inline-block w-2 h-2 rounded-full mr-1.5', colors.bg)} />
                  {s.label}
                </DropdownMenuCheckboxItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Channel Filter - Dynamic from acquisition_channels */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              Canal
              {filters.acquisitionChannelId && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">1</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={!filters.acquisitionChannelId}
              onCheckedChange={() => onFiltersChange({ ...filters, acquisitionChannelId: undefined })}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {(channels || []).map(ch => (
              <DropdownMenuCheckboxItem
                key={ch.id}
                checked={filters.acquisitionChannelId === ch.id}
                onCheckedChange={() => onFiltersChange({ ...filters, acquisitionChannelId: ch.id })}
              >
                {ch.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Form Filter - Dynamic from lead_forms.display_name */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              Formulario
              {filters.leadFormId && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">1</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={!filters.leadFormId}
              onCheckedChange={() => onFiltersChange({ ...filters, leadFormId: undefined })}
            >
              Todos
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            {displayNameGroups.map(group => (
              <DropdownMenuCheckboxItem
                key={group.displayName}
                checked={filters.leadFormId === group.displayName}
                onCheckedChange={() => onFiltersChange({ ...filters, leadFormId: group.displayName })}
              >
                {group.displayName}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Date Filter */}
        <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Calendar className="h-3 w-3" />
              {filters.dateRangeLabel || 'Fecha'}
              {(filters.dateFrom || filters.dateTo) && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">1</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-3" align="start">
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">Presets</div>
              <div className="flex flex-wrap gap-1">
                {DATE_PRESETS.map(preset => (
                  <Button
                    key={preset.days}
                    variant={filters.dateRangeLabel === preset.label ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => {
                      handleDatePreset(preset.days);
                      setIsDateRangeOpen(false);
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="text-xs font-medium text-muted-foreground pt-2">Rango personalizado</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Desde</label>
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateFrom ? new Date(filters.dateFrom) : undefined}
                    onSelect={(date) => {
                      onFiltersChange({ 
                        ...filters, 
                        dateFrom: date ? startOfDay(date).toISOString() : undefined,
                        dateRangeLabel: undefined
                      });
                    }}
                    disabled={{ after: new Date() }}
                    className="rounded-md border pointer-events-auto"
                    locale={es}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Hasta</label>
                  <CalendarComponent
                    mode="single"
                    selected={filters.dateTo ? new Date(filters.dateTo) : undefined}
                    onSelect={(date) => {
                      onFiltersChange({ 
                        ...filters, 
                        dateTo: date ? endOfDay(date).toISOString() : undefined,
                        dateRangeLabel: undefined
                      });
                    }}
                    disabled={{ after: new Date() }}
                    className="rounded-md border pointer-events-auto"
                    locale={es}
                  />
                </div>
              </div>
              {(filters.dateFrom || filters.dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-6 text-xs"
                  onClick={() => {
                    onFiltersChange({ ...filters, dateFrom: undefined, dateTo: undefined, dateRangeLabel: undefined });
                    setIsDateRangeOpen(false);
                  }}
                >
                  Limpiar fechas
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Revenue Filter */}
        <Popover open={isRevenueOpen} onOpenChange={setIsRevenueOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              <Euro className="h-3 w-3" />
              Fact.
              {(filters.revenueMin || filters.revenueMax) && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">1</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">Presets facturación</div>
              <div className="flex flex-wrap gap-1">
                {REVENUE_PRESETS.map(preset => (
                  <Button
                    key={preset.min}
                    variant={filters.revenueMin === preset.min ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleRevenuePreset(preset.min)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="text-xs font-medium text-muted-foreground pt-2">Rango personalizado</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Mín (€)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.revenueMin || ''}
                    onChange={(e) => onFiltersChange({ ...filters, revenueMin: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Máx (€)</label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.revenueMax || ''}
                    onChange={(e) => onFiltersChange({ ...filters, revenueMax: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              {(filters.revenueMin || filters.revenueMax) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-6 text-xs"
                  onClick={() => {
                    onFiltersChange({ ...filters, revenueMin: undefined, revenueMax: undefined });
                    setIsRevenueOpen(false);
                  }}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* EBITDA Filter */}
        <Popover open={isEbitdaOpen} onOpenChange={setIsEbitdaOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              EBITDA
              {(filters.ebitdaMin || filters.ebitdaMax) && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">1</Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3" align="start">
            <div className="space-y-3">
              <div className="text-xs font-medium text-muted-foreground">Presets EBITDA</div>
              <div className="flex flex-wrap gap-1">
                {EBITDA_PRESETS.map(preset => (
                  <Button
                    key={preset.min}
                    variant={filters.ebitdaMin === preset.min ? 'secondary' : 'outline'}
                    size="sm"
                    className="h-6 text-xs"
                    onClick={() => handleEbitdaPreset(preset.min)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
              <div className="text-xs font-medium text-muted-foreground pt-2">Rango personalizado</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-muted-foreground">Mín (€)</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.ebitdaMin || ''}
                    onChange={(e) => onFiltersChange({ ...filters, ebitdaMin: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-7 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground">Máx (€)</label>
                  <Input
                    type="number"
                    placeholder="∞"
                    value={filters.ebitdaMax || ''}
                    onChange={(e) => onFiltersChange({ ...filters, ebitdaMax: e.target.value ? Number(e.target.value) : undefined })}
                    className="h-7 text-xs"
                  />
                </div>
              </div>
              {(filters.ebitdaMin || filters.ebitdaMax) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full h-6 text-xs"
                  onClick={() => {
                    onFiltersChange({ ...filters, ebitdaMin: undefined, ebitdaMax: undefined });
                    setIsEbitdaOpen(false);
                  }}
                >
                  Limpiar
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-7 text-xs text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" />
            Limpiar
          </Button>
        )}

        <div className="flex-1" />

        {/* Count Badge */}
        <span className="text-xs text-muted-foreground">
          {filteredCount === totalCount ? totalCount : `${filteredCount} de ${totalCount}`}
        </span>

        {/* Refresh */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="h-7 w-7 p-0"
        >
          <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin')} />
        </Button>
      </div>
    </div>
  );
};

export default ContactsFilters;
