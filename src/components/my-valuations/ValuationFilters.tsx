import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface ValuationFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const ValuationFilters: React.FC<ValuationFiltersProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  sortOrder,
  onSortChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Buscar por empresa o contacto..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {/* Status Filter */}
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Filtrar por estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los estados</SelectItem>
          <SelectItem value="completed">Completadas</SelectItem>
          <SelectItem value="in_progress">En progreso</SelectItem>
          <SelectItem value="started">Iniciadas</SelectItem>
          <SelectItem value="abandoned">Abandonadas</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Options */}
      <Select 
        value={`${sortBy}-${sortOrder}`} 
        onValueChange={(value) => {
          const [field, order] = value.split('-');
          onSortChange(field, order as 'asc' | 'desc');
        }}
      >
        <SelectTrigger className="w-full sm:w-48">
          <SelectValue placeholder="Ordenar por" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="created_at-desc">Más reciente</SelectItem>
          <SelectItem value="created_at-asc">Más antiguo</SelectItem>
          <SelectItem value="company_name-asc">Empresa A-Z</SelectItem>
          <SelectItem value="company_name-desc">Empresa Z-A</SelectItem>
          <SelectItem value="final_valuation-desc">Mayor valor</SelectItem>
          <SelectItem value="final_valuation-asc">Menor valor</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default ValuationFilters;