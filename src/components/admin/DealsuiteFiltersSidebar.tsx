import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronUp, Search } from 'lucide-react';
import type { DealsuiteDeal } from '@/hooks/useDealsuitDeals';

export interface DealsuiteFilters {
  countries: string[];
  sectors: string[];
  revenueMin: number | null;
  revenueMax: number | null;
  searchQuery: string;
}

interface Props {
  deals: DealsuiteDeal[];
  filters: DealsuiteFilters;
  onChange: (filters: DealsuiteFilters) => void;
}

const extractCountries = (deals: DealsuiteDeal[]) => {
  const counts: Record<string, number> = {};
  deals.forEach(d => {
    const c = d.country?.trim();
    if (c) counts[c] = (counts[c] || 0) + 1;
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
};

const extractSectors = (deals: DealsuiteDeal[]) => {
  const counts: Record<string, number> = {};
  deals.forEach(d => {
    d.sector?.split(',').map(s => s.trim()).filter(Boolean).forEach(s => {
      counts[s] = (counts[s] || 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }));
};

const FilterSection = ({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-medium text-foreground hover:text-foreground/80">
        {title}
        <ChevronUp className={`h-4 w-4 text-muted-foreground transition-transform ${open ? '' : 'rotate-180'}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="pb-3">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
};

export const DealsuiteFiltersSidebar = ({ deals, filters, onChange }: Props) => {
  const countries = useMemo(() => extractCountries(deals), [deals]);
  const sectors = useMemo(() => extractSectors(deals), [deals]);
  const [countrySearch, setCountrySearch] = useState('');
  const [sectorSearch, setSectorSearch] = useState('');

  const toggleCountry = (country: string) => {
    const next = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country];
    onChange({ ...filters, countries: next });
  };

  const toggleSector = (sector: string) => {
    const next = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    onChange({ ...filters, sectors: next });
  };

  const filteredCountries = countrySearch
    ? countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase()))
    : countries;

  const filteredSectors = sectorSearch
    ? sectors.filter(s => s.name.toLowerCase().includes(sectorSearch.toLowerCase()))
    : sectors;

  const activeCount = filters.countries.length + filters.sectors.length
    + (filters.revenueMin ? 1 : 0) + (filters.revenueMax ? 1 : 0);

  return (
    <div className="w-64 flex-shrink-0 space-y-1 border rounded-lg p-4 bg-background">
      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={filters.searchQuery}
          onChange={e => onChange({ ...filters, searchQuery: e.target.value })}
          placeholder="Buscar deals..."
          className="pl-8 h-9 text-sm"
        />
      </div>

      <div className="text-xs text-muted-foreground mb-2">
        {activeCount > 0 ? `${activeCount} filtro${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''}` : 'Sin filtros'}
        {activeCount > 0 && (
          <button
            className="ml-2 text-primary hover:underline"
            onClick={() => onChange({ countries: [], sectors: [], revenueMin: null, revenueMax: null, searchQuery: filters.searchQuery })}
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="divide-y divide-border">
        {/* Revenue */}
        <FilterSection title="Ingresos">
          <div className="space-y-2">
            <div>
              <Label className="text-xs text-muted-foreground">Mínimo (€)</Label>
              <Input
                type="number"
                value={filters.revenueMin ?? ''}
                onChange={e => onChange({ ...filters, revenueMin: e.target.value ? Number(e.target.value) : null })}
                placeholder="0"
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Máximo (€)</Label>
              <Input
                type="number"
                value={filters.revenueMax ?? ''}
                onChange={e => onChange({ ...filters, revenueMax: e.target.value ? Number(e.target.value) : null })}
                placeholder="Sin límite"
                className="h-8 text-sm"
              />
            </div>
          </div>
        </FilterSection>

        {/* Country */}
        <FilterSection title="País / Región">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                value={countrySearch}
                onChange={e => setCountrySearch(e.target.value)}
                placeholder="Filtrar país..."
                className="h-7 text-xs pl-7"
              />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredCountries.map(({ name, count }) => (
                <label key={name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5">
                  <Checkbox
                    checked={filters.countries.includes(name)}
                    onCheckedChange={() => toggleCountry(name)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="flex-1 truncate text-xs">{name}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </label>
              ))}
              {!filteredCountries.length && (
                <p className="text-xs text-muted-foreground py-1">Sin resultados</p>
              )}
            </div>
          </div>
        </FilterSection>

        {/* Sector */}
        <FilterSection title="Sector">
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
              <Input
                value={sectorSearch}
                onChange={e => setSectorSearch(e.target.value)}
                placeholder="Filtrar sector..."
                className="h-7 text-xs pl-7"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredSectors.map(({ name, count }) => (
                <label key={name} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/30 rounded px-1 py-0.5">
                  <Checkbox
                    checked={filters.sectors.includes(name)}
                    onCheckedChange={() => toggleSector(name)}
                    className="h-3.5 w-3.5"
                  />
                  <span className="flex-1 truncate text-xs">{name}</span>
                  <span className="text-xs text-muted-foreground">({count})</span>
                </label>
              ))}
              {!filteredSectors.length && (
                <p className="text-xs text-muted-foreground py-1">Sin resultados</p>
              )}
            </div>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export const applyDealFilters = (deals: DealsuiteDeal[], filters: DealsuiteFilters): DealsuiteDeal[] => {
  return deals.filter(deal => {
    // Search query
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const haystack = [deal.title, deal.description, deal.sector, deal.country, deal.advisor, deal.contact_company]
        .filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    // Countries
    if (filters.countries.length > 0) {
      if (!deal.country || !filters.countries.includes(deal.country.trim())) return false;
    }

    // Sectors
    if (filters.sectors.length > 0) {
      const dealSectors = deal.sector?.split(',').map(s => s.trim()).filter(Boolean) || [];
      if (!filters.sectors.some(s => dealSectors.includes(s))) return false;
    }

    // Revenue min
    if (filters.revenueMin != null) {
      const max = deal.revenue_max || deal.revenue_min;
      if (!max || max < filters.revenueMin) return false;
    }

    // Revenue max
    if (filters.revenueMax != null) {
      const min = deal.revenue_min || deal.revenue_max;
      if (!min || min > filters.revenueMax) return false;
    }

    return true;
  });
};

export const emptyFilters: DealsuiteFilters = {
  countries: [],
  sectors: [],
  revenueMin: null,
  revenueMax: null,
  searchQuery: '',
};
