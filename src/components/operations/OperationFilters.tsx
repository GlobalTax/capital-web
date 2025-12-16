import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';

export interface OperationFiltersType {
  search: string;
  status: string;
  dealType: string;
  yearFrom?: number;
  yearTo?: number;
  sector?: string;
  valuationMin?: number;
  valuationMax?: number;
  displayLocation?: string;
  projectStatus?: string;
  assignedTo?: string;
  isFeatured?: boolean;
}

interface AdminUser {
  id: string;
  user_id: string;
  full_name?: string | null;
  email?: string | null;
  role: string;
  is_active?: boolean | null;
}

interface OperationFiltersProps {
  filters: OperationFiltersType;
  onFiltersChange: (filters: OperationFiltersType) => void;
  totalOperations: number;
  availableSectors: string[];
  adminUsers?: AdminUser[];
}

export const OperationFilters: React.FC<OperationFiltersProps> = ({
  filters,
  onFiltersChange,
  totalOperations,
  availableSectors,
  adminUsers = [],
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  const handleFilterChange = (key: keyof OperationFiltersType, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      status: 'all',
      dealType: 'all',
    });
  };

  const hasActiveFilters = () => {
    return filters.search ||
      (filters.status && filters.status !== 'all') ||
      (filters.dealType && filters.dealType !== 'all') ||
      filters.yearFrom ||
      filters.yearTo ||
      filters.sector ||
      filters.valuationMin ||
      filters.valuationMax ||
      filters.displayLocation ||
      (filters.projectStatus && filters.projectStatus !== 'all') ||
      (filters.assignedTo && filters.assignedTo !== 'all') ||
      filters.isFeatured !== undefined;
  };

  const getActiveFilterChips = () => {
    const chips: { label: string; key: string }[] = [];
    if (filters.sector) chips.push({ label: `Sector: ${filters.sector}`, key: 'sector' });
    if (filters.yearFrom) chips.push({ label: `Desde: ${filters.yearFrom}`, key: 'yearFrom' });
    if (filters.yearTo) chips.push({ label: `Hasta: ${filters.yearTo}`, key: 'yearTo' });
    if (filters.valuationMin) chips.push({ label: `Min: €${filters.valuationMin}k`, key: 'valuationMin' });
    if (filters.valuationMax) chips.push({ label: `Max: €${filters.valuationMax}k`, key: 'valuationMax' });
    if (filters.displayLocation) chips.push({ label: `Ubicación: ${filters.displayLocation}`, key: 'displayLocation' });
    if (filters.projectStatus && filters.projectStatus !== 'all') {
      const statusLabels: Record<string, string> = {
        'negotiating': 'En negociaciones',
        'in_market': 'En el mercado',
        'in_progress': 'In progress'
      };
      chips.push({ label: `Estado Proy: ${statusLabels[filters.projectStatus] || filters.projectStatus}`, key: 'projectStatus' });
    }
    if (filters.assignedTo && filters.assignedTo !== 'all') {
      const user = adminUsers.find(u => u.user_id === filters.assignedTo);
      chips.push({ label: `Asignado: ${user?.full_name || 'Sin asignar'}`, key: 'assignedTo' });
    }
    if (filters.isFeatured !== undefined) {
      chips.push({ label: filters.isFeatured ? 'Destacados' : 'No destacados', key: 'isFeatured' });
    }
    return chips;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Main Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por empresa, sector o descripción..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="available">Disponible</SelectItem>
                <SelectItem value="under_negotiation">En Negociación</SelectItem>
                <SelectItem value="sold">Vendida</SelectItem>
                <SelectItem value="withdrawn">Retirada</SelectItem>
              </SelectContent>
            </Select>

            {/* Deal Type Filter */}
            <Select
              value={filters.dealType}
              onValueChange={(value) => handleFilterChange('dealType', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Operación" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="sale">Venta</SelectItem>
                <SelectItem value="acquisition">Adquisición</SelectItem>
                <SelectItem value="merger">Fusión</SelectItem>
                <SelectItem value="restructuring">Reestructuración</SelectItem>
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button
              variant="outline"
              onClick={handleClearFilters}
              disabled={!hasActiveFilters()}
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar
            </Button>
          </div>

          {/* Advanced Filters */}
          <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full">
                <Filter className="h-4 w-4 mr-2" />
                Filtros Avanzados
                {isAdvancedOpen ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Project Status Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Estado Proyecto</label>
                  <Select
                    value={filters.projectStatus || 'all'}
                    onValueChange={(value) => handleFilterChange('projectStatus', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="in_market">En el mercado</SelectItem>
                      <SelectItem value="negotiating">En negociaciones</SelectItem>
                      <SelectItem value="in_progress">In progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Assigned To Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Asignado a</label>
                  <Select
                    value={filters.assignedTo || 'all'}
                    onValueChange={(value) => handleFilterChange('assignedTo', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="unassigned">Sin asignar</SelectItem>
                      {adminUsers.filter(u => u.is_active).map(user => (
                        <SelectItem key={user.user_id} value={user.user_id}>
                          {user.full_name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Featured Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Destacados</label>
                  <Select
                    value={filters.isFeatured === undefined ? 'all' : filters.isFeatured ? 'yes' : 'no'}
                    onValueChange={(value) => handleFilterChange('isFeatured', value === 'all' ? undefined : value === 'yes')}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="yes">Solo destacados</SelectItem>
                      <SelectItem value="no">No destacados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Year Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Año Desde</label>
                  <Input
                    type="number"
                    placeholder="2020"
                    value={filters.yearFrom || ''}
                    onChange={(e) => handleFilterChange('yearFrom', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Año Hasta</label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={filters.yearTo || ''}
                    onChange={(e) => handleFilterChange('yearTo', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                {/* Sector */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Sector</label>
                  <Select
                    value={filters.sector || 'all'}
                    onValueChange={(value) => handleFilterChange('sector', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los sectores</SelectItem>
                      {availableSectors.map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Display Location */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Ubicación</label>
                  <Select
                    value={filters.displayLocation || 'all'}
                    onValueChange={(value) => handleFilterChange('displayLocation', value === 'all' ? undefined : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="operaciones">Operaciones</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Valuation Range */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Valoración Mín (€k)</label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={filters.valuationMin || ''}
                    onChange={(e) => handleFilterChange('valuationMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Valoración Máx (€k)</label>
                  <Input
                    type="number"
                    placeholder="5000"
                    value={filters.valuationMax || ''}
                    onChange={(e) => handleFilterChange('valuationMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>
              </div>

              {/* Active Filter Chips */}
              {getActiveFilterChips().length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {getActiveFilterChips().map(chip => (
                    <Badge key={chip.key} variant="secondary" className="gap-1">
                      {chip.label}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterChange(chip.key as keyof OperationFiltersType, undefined)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Mostrando <span className="font-semibold text-foreground">{totalOperations}</span> operaciones
            {hasActiveFilters() && ' (filtradas)'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
