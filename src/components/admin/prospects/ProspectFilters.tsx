/**
 * Filters component for prospects list
 */

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter } from 'lucide-react';
import { useContactStatuses } from '@/hooks/useContactStatuses';
import { ProspectFilters as ProspectFiltersType } from '@/hooks/useProspects';

interface ProspectFiltersProps {
  filters: ProspectFiltersType;
  onFiltersChange: (filters: ProspectFiltersType) => void;
  prospectStatusKeys: string[];
}

export const ProspectFilters: React.FC<ProspectFiltersProps> = ({
  filters,
  onFiltersChange,
  prospectStatusKeys,
}) => {
  const { statuses } = useContactStatuses();

  // Get only prospect statuses for the filter
  const prospectStatuses = statuses.filter(s => 
    prospectStatusKeys.includes(s.status_key) && s.is_active
  );

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, statusKey: value === 'all' ? null : value });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      search: '',
      statusKey: null,
      channel: null,
      dateFrom: null,
      dateTo: null,
    });
  };

  const hasActiveFilters = filters.search || filters.statusKey || filters.channel;

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar empresa, contacto o email..."
          value={filters.search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Status Filter */}
      <Select
        value={filters.statusKey || 'all'}
        onValueChange={handleStatusChange}
      >
        <SelectTrigger className="w-[180px]">
          <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          {prospectStatuses.map((status) => (
            <SelectItem key={status.id} value={status.status_key}>
              <span className="flex items-center gap-2">
                <span>{status.icon}</span>
                {status.label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="h-10"
        >
          <X className="h-4 w-4 mr-1" />
          Limpiar
        </Button>
      )}
    </div>
  );
};
