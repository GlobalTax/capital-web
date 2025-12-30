import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, List, LayoutGrid } from 'lucide-react';
import { BookingsKPIs } from './BookingsKPIs';
import { BookingFilters } from './BookingFilters';
import { BookingsTable } from './BookingsTable';
import { BookingsCalendarView } from './BookingsCalendarView';
import { useBookings, BookingFilters as FiltersType } from './hooks/useBookings';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const BookingsManager = () => {
  const [filters, setFilters] = useState<FiltersType>({
    status: 'all',
    dateRange: 'week',
    search: ''
  });
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

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

      {/* View Switcher & Content */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'list' | 'calendar')}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="list" className="flex items-center gap-2">
              <List className="w-4 h-4" />
              Lista
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <LayoutGrid className="w-4 h-4" />
              Calendario
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-0">
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
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <BookingsCalendarView />
        </TabsContent>
      </Tabs>
    </div>
  );
};
