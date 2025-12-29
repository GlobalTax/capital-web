import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  X, 
  Filter, 
  Download, 
  RefreshCw,
  ChevronDown,
  Calendar,
  Building2,
  Mail,
  Users
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { ContactFilters, ContactOrigin } from '@/hooks/useUnifiedContacts';
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
  const [searchFocused, setSearchFocused] = useState(false);

  const handleFilterChange = (key: keyof ContactFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
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
  ].filter(Boolean).length;

  return (
    <div className="space-y-3">
      {/* Main filter bar */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className={cn(
          "relative transition-all duration-200",
          searchFocused ? "w-80" : "w-64"
        )}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar contacto..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="h-8 pl-9 pr-8 text-sm bg-[hsl(var(--linear-bg))] border-[hsl(var(--linear-border))] focus:border-[hsl(var(--accent-primary))]"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
              onClick={() => handleFilterChange('search', '')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

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
