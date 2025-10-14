import { useState } from 'react';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface RODFiltersState {
  status: 'all' | 'active' | 'inactive' | 'archived';
  dateFrom: string;
  dateTo: string;
  fileType: 'all' | 'pdf' | 'excel';
  minDownloads: string;
  maxDownloads: string;
  sortBy: 'created_at' | 'total_downloads' | 'activated_at';
  sortOrder: 'asc' | 'desc';
  searchQuery: string;
}

interface RODFiltersProps {
  filters: RODFiltersState;
  onFiltersChange: (filters: RODFiltersState) => void;
  totalResults: number;
  filteredResults: number;
}

export const RODFilters = ({ filters, onFiltersChange, totalResults, filteredResults }: RODFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof RODFiltersState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      fileType: 'all',
      minDownloads: '',
      maxDownloads: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      searchQuery: ''
    });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' && value === 'created_at') return false;
    if (key === 'sortOrder' && value === 'desc') return false;
    if (key === 'status' && value === 'all') return false;
    if (key === 'fileType' && value === 'all') return false;
    return value !== '' && value !== 'all';
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
                {activeFiltersCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground">
          Mostrando {filteredResults} de {totalResults} versiones
        </p>
      </div>

      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6 space-y-4">
              {/* Search */}
              <div>
                <Input
                  placeholder="Buscar por título, versión o descripción..."
                  value={filters.searchQuery}
                  onChange={(e) => updateFilter('searchQuery', e.target.value)}
                />
              </div>

              {/* Filters grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado</label>
                  <Select value={filters.status} onValueChange={(v) => updateFilter('status', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Activa</SelectItem>
                      <SelectItem value="inactive">Inactiva</SelectItem>
                      <SelectItem value="archived">Archivada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Tipo</label>
                  <Select value={filters.fileType} onValueChange={(v) => updateFilter('fileType', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pdf">PDF</SelectItem>
                      <SelectItem value="excel">Excel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <Select value={filters.sortBy} onValueChange={(v) => updateFilter('sortBy', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Fecha creación</SelectItem>
                      <SelectItem value="total_downloads">Descargas</SelectItem>
                      <SelectItem value="activated_at">Fecha activación</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Orden</label>
                  <Select value={filters.sortOrder} onValueChange={(v) => updateFilter('sortOrder', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Descendente</SelectItem>
                      <SelectItem value="asc">Ascendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Desde</label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => updateFilter('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Hasta</label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => updateFilter('dateTo', e.target.value)}
                  />
                </div>
              </div>

              {/* Downloads range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Descargas mín.</label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.minDownloads}
                    onChange={(e) => updateFilter('minDownloads', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Descargas máx.</label>
                  <Input
                    type="number"
                    placeholder="Sin límite"
                    value={filters.maxDownloads}
                    onChange={(e) => updateFilter('maxDownloads', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};
