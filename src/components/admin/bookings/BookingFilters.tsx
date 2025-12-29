import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { BookingFilters as FiltersType } from './hooks/useBookings';

interface BookingFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export const BookingFilters = ({ filters, onFiltersChange }: BookingFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, email o empresa..."
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="pending">Pendientes</SelectItem>
          <SelectItem value="confirmed">Confirmadas</SelectItem>
          <SelectItem value="completed">Completadas</SelectItem>
          <SelectItem value="cancelled">Canceladas</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.dateRange}
        onValueChange={(value: FiltersType['dateRange']) => onFiltersChange({ ...filters, dateRange: value })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Fecha" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">Hoy</SelectItem>
          <SelectItem value="week">Próximos 7 días</SelectItem>
          <SelectItem value="month">Próximos 30 días</SelectItem>
          <SelectItem value="past">Pasadas</SelectItem>
          <SelectItem value="all">Todas</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
