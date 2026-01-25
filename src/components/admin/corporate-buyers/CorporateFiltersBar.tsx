// =============================================
// CORPORATE BUYERS FILTERS BAR
// =============================================

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  CorporateBuyersFilters, 
  CorporateBuyerType, 
  BUYER_TYPE_LABELS 
} from '@/types/corporateBuyers';

interface CorporateFiltersBarProps {
  filters: CorporateBuyersFilters;
  onFiltersChange: (filters: CorporateBuyersFilters) => void;
  countries: string[];
}

const BUYER_TYPES: CorporateBuyerType[] = [
  'corporate',
  'family_office',
  'pe_fund',
  'strategic_buyer',
  'holding',
];

export const CorporateFiltersBar = ({
  filters,
  onFiltersChange,
  countries,
}: CorporateFiltersBarProps) => {
  const hasActiveFilters = !!(filters.search || filters.buyer_type || filters.country);

  const clearFilters = () => {
    onFiltersChange({});
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/30 rounded-lg border border-border">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar comprador..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      {/* Type filter */}
      <Select
        value={filters.buyer_type || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ 
            ...filters, 
            buyer_type: value === 'all' ? undefined : value as CorporateBuyerType 
          })
        }
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Tipo" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los tipos</SelectItem>
          {BUYER_TYPES.map((type) => (
            <SelectItem key={type} value={type}>
              {BUYER_TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Country filter */}
      <Select
        value={filters.country || 'all'}
        onValueChange={(value) => 
          onFiltersChange({ 
            ...filters, 
            country: value === 'all' ? undefined : value 
          })
        }
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="País" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los países</SelectItem>
          {countries.map((country) => (
            <SelectItem key={country} value={country}>
              {country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
          <X className="h-4 w-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
};
