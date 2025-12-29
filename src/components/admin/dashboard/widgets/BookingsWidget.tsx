import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Calendar, 
  Clock, 
  Phone, 
  Video, 
  MapPin, 
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Timer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format, formatDistanceToNow, isToday, isTomorrow, isPast, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  company_name: string | null;
  booking_datetime: string;
  meeting_type: string;
  meeting_format: string;
  status: string;
}

interface BookingsWidgetProps {
  widget: {
    id: string;
    title: string;
    config: {
      limit?: number;
      showPast?: boolean;
    };
  };
  isEditing?: boolean;
}

export function BookingsWidget({ widget, isEditing }: BookingsWidgetProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextBookingCountdown, setNextBookingCountdown] = useState<string | null>(null);
  const navigate = useNavigate();
  const limit = widget.config?.limit || 5;

  useEffect(() => {
    fetchBookings();
    
    // Subscribe to realtime changes
    const channel = supabase
      .channel('bookings-widget')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'calendar_bookings' },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  // Update countdown every minute
  useEffect(() => {
    const updateCountdown = () => {
      if (bookings.length > 0) {
        const nextBooking = bookings.find(b => !isPast(new Date(b.booking_datetime)) && b.status !== 'cancelled');
        if (nextBooking) {
          const minutes = differenceInMinutes(new Date(nextBooking.booking_datetime), new Date());
          if (minutes <= 0) {
            setNextBookingCountdown('¡Ahora!');
          } else if (minutes < 60) {
            setNextBookingCountdown(`En ${minutes} min`);
          } else {
            setNextBookingCountdown(null);
          }
        } else {
          setNextBookingCountdown(null);
        }
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, [bookings]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const now = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('calendar_bookings')
        .select('id, client_name, client_email, client_phone, company_name, booking_datetime, meeting_type, meeting_format, status')
        .gte('booking_datetime', widget.config?.showPast ? '1970-01-01' : now)
        .order('booking_datetime', { ascending: true })
        .limit(limit);

      if (error) throw error;
      setBookings(data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string, datetime: string) => {
    const bookingDate = new Date(datetime);
    const isUpcoming = !isPast(bookingDate);
    
    if (status === 'cancelled') {
      return <Badge variant="destructive" className="text-xs">Cancelada</Badge>;
    }
    if (status === 'completed') {
      return <Badge className="bg-green-100 text-green-700 text-xs">Completada</Badge>;
    }
    if (status === 'confirmed') {
      return <Badge className="bg-blue-100 text-blue-700 text-xs">Confirmada</Badge>;
    }
    if (isUpcoming) {
      return <Badge variant="secondary" className="text-xs">Pendiente</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Sin confirmar</Badge>;
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'video':
        return <Video className="h-3 w-3" />;
      case 'phone':
        return <Phone className="h-3 w-3" />;
      case 'in_person':
        return <MapPin className="h-3 w-3" />;
      default:
        return <Calendar className="h-3 w-3" />;
    }
  };

  const getDateLabel = (datetime: string) => {
    const date = new Date(datetime);
    if (isToday(date)) return 'Hoy';
    if (isTomorrow(date)) return 'Mañana';
    return format(date, "d 'de' MMMM", { locale: es });
  };

  const handleBookingClick = (booking: Booking) => {
    navigate(`/admin/bookings/${booking.id}`);
  };

  const handleQuickAction = (e: React.MouseEvent, action: 'call' | 'email', booking: Booking) => {
    e.stopPropagation();
    if (action === 'call' && booking.client_phone) {
      window.open(`tel:${booking.client_phone}`, '_blank');
    } else if (action === 'email') {
      window.open(`mailto:${booking.client_email}`, '_blank');
    }
  };

  return (
    <Card className={cn("h-full", isEditing && "ring-2 ring-primary ring-offset-2")}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            {widget.title || 'Próximas Reservas'}
          </CardTitle>
          {nextBookingCountdown && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-700 flex items-center gap-1 text-xs">
              <Timer className="h-3 w-3" />
              {nextBookingCountdown}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse flex items-center gap-3 p-2">
                <div className="h-10 w-10 rounded-lg bg-muted" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-muted rounded w-3/4" />
                  <div className="h-2 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay reservas próximas</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2"
              onClick={() => navigate('/admin/bookings')}
            >
              Ver todas las reservas
            </Button>
          </div>
        ) : (
          <ScrollArea className="h-[240px]">
            <div className="space-y-2">
              {bookings.map((booking) => {
                const bookingDate = new Date(booking.booking_datetime);
                const isUpcoming = !isPast(bookingDate);
                
                return (
                  <div
                    key={booking.id}
                    onClick={() => handleBookingClick(booking)}
                    className={cn(
                      "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border",
                      "hover:bg-muted/50 hover:border-muted-foreground/20",
                      isUpcoming && isToday(bookingDate) && "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-800",
                      !isUpcoming && "opacity-60"
                    )}
                  >
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex flex-col items-center justify-center text-xs",
                      isUpcoming ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                    )}>
                      <span className="font-bold text-lg leading-none">{format(bookingDate, 'd')}</span>
                      <span className="text-[10px] uppercase">{format(bookingDate, 'MMM', { locale: es })}</span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium truncate">{booking.client_name}</p>
                        {getStatusBadge(booking.status, booking.booking_datetime)}
                      </div>
                      
                      {booking.company_name && (
                        <p className="text-xs text-muted-foreground truncate">{booking.company_name}</p>
                      )}
                      
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(bookingDate, 'HH:mm')}
                        </span>
                        <span className="flex items-center gap-1">
                          {getFormatIcon(booking.meeting_format)}
                          {booking.meeting_type}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      {booking.client_phone && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => handleQuickAction(e, 'call', booking)}
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={(e) => handleQuickAction(e, 'email', booking)}
                      >
                        <Mail className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-2 text-xs"
          onClick={() => navigate('/admin/bookings')}
        >
          Ver todas las reservas
          <ArrowRight className="h-3 w-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
