// ============= CONTACTS FILTERS =============
// Compact filter bar with stats

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Download, Search, X, TrendingUp, Users, Target, BarChart3 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContactFilters as Filters, ContactStats, ContactOrigin } from './types';
import { cn } from '@/lib/utils';

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

const ORIGIN_OPTIONS: { value: ContactOrigin; label: string }[] = [
  { value: 'valuation', label: 'Valoración' },
  { value: 'contact', label: 'Comercial' },
  { value: 'collaborator', label: 'Colaborador' },
  { value: 'acquisition', label: 'Adquisición' },
  { value: 'advisor', label: 'Asesor' },
];

const STATUS_OPTIONS = [
  { value: 'nuevo', label: 'Nuevo' },
  { value: 'contactado', label: 'Contactado' },
  { value: 'calificado', label: 'Calificado' },
  { value: 'propuesta_enviada', label: 'Propuesta' },
  { value: 'negociacion', label: 'Negociación' },
  { value: 'ganado', label: 'Ganado' },
  { value: 'perdido', label: 'Perdido' },
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
  const hasActiveFilters = !!(
    filters.search ||
    (filters.origin && filters.origin !== 'all') ||
    (filters.status && filters.status !== 'all') ||
    filters.dateFrom ||
    filters.revenueMin
  );

  const clearFilters = () => {
    onFiltersChange({ origin: 'all', emailStatus: 'all' });
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

        {/* Origin Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
              Origen
              {filters.origin && filters.origin !== 'all' && (
                <Badge variant="secondary" className="h-4 px-1 text-[10px]">1</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuCheckboxItem
              checked={!filters.origin || filters.origin === 'all'}
              onCheckedChange={() => onFiltersChange({ ...filters, origin: 'all' })}
            >
              Todos
            </DropdownMenuCheckboxItem>
            {ORIGIN_OPTIONS.map(opt => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={filters.origin === opt.value}
                onCheckedChange={() => onFiltersChange({ ...filters, origin: opt.value })}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
            {STATUS_OPTIONS.map(opt => (
              <DropdownMenuCheckboxItem
                key={opt.value}
                checked={filters.status === opt.value}
                onCheckedChange={() => onFiltersChange({ ...filters, status: opt.value })}
              >
                {opt.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

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
