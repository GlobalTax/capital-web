// ============= CR FUND FILTERS BAR =============
import React, { memo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CRFundType, CRFundStatus, CR_FUND_TYPE_LABELS, CR_FUND_STATUS_LABELS } from '@/types/capitalRiesgo';

export interface CRFundFiltersState {
  search: string;
  fundType: CRFundType | 'all';
  status: CRFundStatus | 'all';
  country: string;
  aumRange: 'all' | '<100M' | '100M-500M' | '500M-1B' | '>1B';
  hasPortfolio: boolean | null;
}

interface CRFundFiltersBarProps {
  filters: CRFundFiltersState;
  onFiltersChange: (filters: CRFundFiltersState) => void;
  countries: string[];
  totalCount: number;
  filteredCount: number;
}

// Quick filter chips configuration (removed status-based chips)
const QUICK_CHIPS = [
  { key: 'fundType', value: 'private_equity', label: 'PE', color: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
  { key: 'fundType', value: 'venture_capital', label: 'VC', color: 'bg-teal-500/10 text-teal-600 border-teal-500/20' },
  { key: 'hasPortfolio', value: true, label: 'Con Portfolio', color: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
] as const;

// AUM range options
const AUM_RANGES = [
  { value: 'all', label: 'Todos' },
  { value: '<100M', label: '< 100M' },
  { value: '100M-500M', label: '100M - 500M' },
  { value: '500M-1B', label: '500M - 1B' },
  { value: '>1B', label: '> 1B' },
] as const;

export const CRFundFiltersBar = memo<CRFundFiltersBarProps>(({
  filters,
  onFiltersChange,
  countries,
  totalCount,
  filteredCount,
}) => {
  const hasActiveFilters = 
    filters.search ||
    filters.fundType !== 'all' ||
    filters.status !== 'all' ||
    filters.country !== 'all' ||
    filters.aumRange !== 'all' ||
    filters.hasPortfolio !== null;

  const handleChipClick = (key: string, value: any) => {
    if (key === 'status') {
      onFiltersChange({
        ...filters,
        status: filters.status === value ? 'all' : value,
      });
    } else if (key === 'fundType') {
      onFiltersChange({
        ...filters,
        fundType: filters.fundType === value ? 'all' : value,
      });
    } else if (key === 'hasPortfolio') {
      onFiltersChange({
        ...filters,
        hasPortfolio: filters.hasPortfolio === value ? null : value,
      });
    }
  };

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      fundType: 'all',
      status: 'all',
      country: 'all',
      aumRange: 'all',
      hasPortfolio: null,
    });
  };

  const isChipActive = (key: string, value: any) => {
    if (key === 'status') return filters.status === value;
    if (key === 'fundType') return filters.fundType === value;
    if (key === 'hasPortfolio') return filters.hasPortfolio === value;
    return false;
  };

  return (
    <div className="space-y-2">
      {/* Main filter bar */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar fondo..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-10 h-9"
          />
        </div>

        {/* Country select */}
        <Select 
          value={filters.country} 
          onValueChange={(v) => onFiltersChange({ ...filters, country: v })}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="País" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los países</SelectItem>
            {countries.map(country => (
              <SelectItem key={country} value={country}>{country}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AUM range select */}
        <Select 
          value={filters.aumRange} 
          onValueChange={(v) => onFiltersChange({ ...filters, aumRange: v as CRFundFiltersState['aumRange'] })}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="AUM" />
          </SelectTrigger>
          <SelectContent>
            {AUM_RANGES.map(range => (
              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1">
            <X className="h-3.5 w-3.5" />
            Limpiar
          </Button>
        )}

        {/* Count indicator */}
        <span className="text-xs text-muted-foreground ml-auto">
          {filteredCount === totalCount 
            ? `${totalCount} fondos`
            : `${filteredCount} de ${totalCount} fondos`
          }
        </span>
      </div>

      {/* Quick filter chips */}
      <div className="flex items-center gap-2">
        {QUICK_CHIPS.map((chip) => (
          <Badge
            key={`${chip.key}-${chip.value}`}
            variant="outline"
            className={`cursor-pointer transition-all text-xs h-6 ${
              isChipActive(chip.key, chip.value)
                ? chip.color + ' border-current'
                : 'hover:bg-muted/50'
            }`}
            onClick={() => handleChipClick(chip.key, chip.value)}
          >
            {chip.label}
          </Badge>
        ))}
      </div>
    </div>
  );
});

CRFundFiltersBar.displayName = 'CRFundFiltersBar';
