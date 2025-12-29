import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { BookingsKPIs } from './BookingsKPIs';
import { BookingFilters } from './BookingFilters';
import { BookingsTable } from './BookingsTable';
import { useBookings, BookingFilters as FiltersType } from './hooks/useBookings';

export const BookingsManager = () => {
  const [filters, setFilters] = useState<FiltersType>({
    status: 'all',
    dateRange: 'week',
    search: ''
  });

  const { data: bookings = [], isLoading } = useBookings(filters);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6" />
          Reservas de Llamadas
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona las reservas de llamadas con leads y clientes
        </p>
      </div>

      {/* KPIs */}
      <BookingsKPIs />

      {/* Main Content */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Lista de Reservas</CardTitle>
          <CardDescription>
            {bookings.length} reserva{bookings.length !== 1 ? 's' : ''} encontrada{bookings.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <BookingFilters filters={filters} onFiltersChange={setFilters} />

          {/* Table */}
          <BookingsTable bookings={bookings} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  );
};
