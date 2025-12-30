import { useMemo, useState, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Calendar, Users } from 'lucide-react';
import { Booking } from './hooks/useBookings';
import { useTeamBookings } from './hooks/useBookingAssignment';
import { BookingStatusBadge } from './BookingStatusBadge';
import { BookingDetailModal } from './BookingDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface BookingsCalendarViewProps {
  onSelectBooking?: (booking: Booking) => void;
}

export const BookingsCalendarView = ({ onSelectBooking }: BookingsCalendarViewProps) => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [selectedAdvisor, setSelectedAdvisor] = useState<string>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  
  const { data: bookings = [], isLoading, refetch } = useTeamBookings();
  const { users: adminUsers } = useAdminUsers();

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('calendar-bookings-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_bookings'
        },
        () => {
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const filteredBookings = useMemo(() => {
    if (selectedAdvisor === 'all') return bookings;
    if (selectedAdvisor === 'unassigned') {
      return bookings.filter(b => !b.assigned_to);
    }
    return bookings.filter(b => b.assigned_to === selectedAdvisor);
  }, [bookings, selectedAdvisor]);

  const bookingsByDay = useMemo(() => {
    const grouped: Record<string, typeof bookings> = {};
    weekDays.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      grouped[dateKey] = filteredBookings.filter(b => 
        isSameDay(parseISO(b.booking_date), day)
      );
    });
    return grouped;
  }, [filteredBookings, weekDays]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handlePrevWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  const handleBookingClick = (booking: Booking) => {
    setSelectedBooking(booking);
    onSelectBooking?.(booking);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-8 w-48" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5" />
              Vista de Calendario
            </CardTitle>
            
            <div className="flex items-center gap-2 flex-wrap">
              {/* Advisor filter */}
              <Select value={selectedAdvisor} onValueChange={setSelectedAdvisor}>
                <SelectTrigger className="w-[180px]">
                  <Users className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por asesor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los asesores</SelectItem>
                  <SelectItem value="unassigned">Sin asignar</SelectItem>
                  {adminUsers.filter(u => u.is_active).map(user => (
                    <SelectItem key={user.user_id} value={user.user_id}>
                      {user.full_name || user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Navigation */}
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" onClick={handlePrevWeek}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={handleToday}>
                  Hoy
                </Button>
                <Button variant="outline" size="icon" onClick={handleNextWeek}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mt-2">
            {format(currentWeekStart, "d 'de' MMMM", { locale: es })} — {format(addDays(currentWeekStart, 6), "d 'de' MMMM yyyy", { locale: es })}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayBookings = bookingsByDay[dateKey] || [];
              const isToday = isSameDay(day, new Date());
              
              return (
                <div 
                  key={dateKey} 
                  className={cn(
                    "min-h-[120px] border rounded-lg p-2",
                    isToday && "border-primary bg-primary/5"
                  )}
                >
                  <div className="text-center mb-2">
                    <p className={cn(
                      "text-xs uppercase",
                      isToday ? "text-primary font-semibold" : "text-muted-foreground"
                    )}>
                      {format(day, 'EEE', { locale: es })}
                    </p>
                    <p className={cn(
                      "text-lg font-semibold",
                      isToday && "text-primary"
                    )}>
                      {format(day, 'd')}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    {dayBookings.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">—</p>
                    ) : (
                      dayBookings.map((booking) => (
                        <button
                          key={booking.id}
                          onClick={() => handleBookingClick(booking as Booking)}
                          className={cn(
                            "w-full text-left p-1.5 rounded text-xs transition-colors",
                            "hover:bg-accent cursor-pointer",
                            booking.status === 'pending' && "bg-yellow-50 border-l-2 border-yellow-500",
                            booking.status === 'confirmed' && "bg-blue-50 border-l-2 border-blue-500",
                            booking.status === 'completed' && "bg-green-50 border-l-2 border-green-500",
                            booking.status === 'cancelled' && "bg-gray-50 border-l-2 border-gray-400 opacity-60"
                          )}
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-mono font-medium truncate">
                              {booking.booking_time.substring(0, 5)}
                            </span>
                            {booking.assigned_user && (
                              <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px] bg-primary/20">
                                  {getInitials(booking.assigned_user.full_name)}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                          <p className="font-medium truncate">{booking.client_name}</p>
                          {booking.company_name && (
                            <p className="text-muted-foreground truncate">{booking.company_name}</p>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-yellow-500" />
              <span>Pendiente</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-blue-500" />
              <span>Confirmada</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-green-500" />
              <span>Completada</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gray-400" />
              <span>Cancelada</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <BookingDetailModal
        booking={selectedBooking}
        open={!!selectedBooking}
        onClose={() => setSelectedBooking(null)}
      />
    </>
  );
};
