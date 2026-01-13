import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronDown,
  Building2,
  Mail,
} from 'lucide-react';
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
      showUniqueContacts: filters.showUniqueContacts,
    });
  };

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
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Smart AI Search */}
      <SmartSearchInput
        onFiltersChange={handleSmartFiltersChange}
        onTextSearchChange={(text) => handleFilterChange('search', text)}
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

        {/* Clear filters */}
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
