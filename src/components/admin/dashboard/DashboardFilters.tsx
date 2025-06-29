
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CalendarIcon, 
  Search, 
  X, 
  Filter,
  RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DashboardFilters, FilterOptions } from '@/types/filters';

interface DashboardFiltersProps {
  filters: DashboardFilters;
  filterOptions: FilterOptions;
  onDateRangeChange: (start: Date, end: Date) => void;
  onSectorsChange: (sectors: string[]) => void;
  onSearchChange: (query: string) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
}

const DashboardFilters = ({
  filters,
  filterOptions,
  onDateRangeChange,
  onSectorsChange,
  onSearchChange,
  onReset,
  hasActiveFilters
}: DashboardFiltersProps) => {
  const handleSectorToggle = (sector: string) => {
    const newSectors = filters.sectors.includes(sector)
      ? filters.sectors.filter(s => s !== sector)
      : [...filters.sectors, sector];
    onSectorsChange(newSectors);
  };

  const removeSector = (sector: string) => {
    onSectorsChange(filters.sectors.filter(s => s !== sector));
  };

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Filtros del Dashboard</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="ml-auto text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Rango de Fechas */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Rango de Fechas</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal text-xs",
                    !filters.dateRange && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3 w-3" />
                  {format(filters.dateRange.start, "dd/MM/yy")} - {format(filters.dateRange.end, "dd/MM/yy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={{
                    from: filters.dateRange.start,
                    to: filters.dateRange.end
                  }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      onDateRangeChange(range.from, range.to);
                    }
                  }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Sectores */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Sectores</label>
            <Select>
              <SelectTrigger className="text-xs">
                <SelectValue placeholder="Seleccionar sectores" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.availableSectors.map((sector) => (
                  <SelectItem
                    key={sector}
                    value={sector}
                    onClick={() => handleSectorToggle(sector)}
                    className="text-xs cursor-pointer"
                  >
                    <div className="flex items-center justify-between w-full">
                      {sector}
                      {filters.sectors.includes(sector) && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full ml-2" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Sectores seleccionados */}
            {filters.sectors.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.sectors.map((sector) => (
                  <Badge
                    key={sector}
                    variant="secondary"
                    className="text-xs px-2 py-1 flex items-center gap-1"
                  >
                    {sector}
                    <X
                      className="h-3 w-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeSector(sector)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Búsqueda */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Búsqueda</label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-3 w-3 text-gray-400" />
              <Input
                placeholder="Buscar en contenido..."
                value={filters.searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-7 text-xs"
              />
              {filters.searchQuery && (
                <X
                  className="absolute right-2 top-2.5 h-3 w-3 cursor-pointer text-gray-400 hover:text-gray-600"
                  onClick={() => onSearchChange('')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Indicadores de filtros activos */}
        {hasActiveFilters && (
          <div className="mt-4 p-2 bg-blue-50 rounded-md">
            <p className="text-xs text-blue-700">
              Filtros activos aplicados al dashboard
              {filters.sectors.length > 0 && ` • ${filters.sectors.length} sectores`}
              {filters.searchQuery && ` • Búsqueda: "${filters.searchQuery}"`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardFilters;
