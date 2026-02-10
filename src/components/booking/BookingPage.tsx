import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useBookingSlots, parseBookingToken } from './hooks/useBookingSlots';
import { BookingCalendar } from './BookingCalendar';
import { BookingTimeSlots } from './BookingTimeSlots';
import { BookingConfirmation } from './BookingConfirmation';
import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_CONFIG } from '@/config/supabase';
import { Button } from '@/components/ui/button';
import { Loader2, Calendar, Shield, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Capittal logo component
const CapittalLogo = () => (
  <div className="flex items-center gap-2">
    <img 
      src={`${SUPABASE_CONFIG.url}/storage/v1/object/public/public-assets/logotipo.svg`} 
      alt="Capittal" 
      className="h-8"
    />
  </div>
);

export const BookingPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  // Parse and validate token
  const tokenData = token ? parseBookingToken(token) : null;

  const { availableDays, isLoading, error } = useBookingSlots();

  // Get selected day's slots
  const selectedDay = availableDays.find(d => d.dateString === selectedDate) || null;

  // Handle date selection
  const handleSelectDate = (dateString: string) => {
    setSelectedDate(dateString);
    setSelectedTime(null); // Reset time when date changes
  };

  // Handle time selection
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
  };

  // Handle booking submission
  const handleConfirmBooking = async () => {
    if (!selectedDate || !selectedTime || !tokenData) return;

    setIsSubmitting(true);

    try {
      // Create booking datetime
      const bookingDatetime = `${selectedDate}T${selectedTime}:00`;

      // Insert booking into database
      const { data: booking, error: insertError } = await supabase
        .from('calendar_bookings')
        .insert({
          booking_date: selectedDate,
          booking_time: selectedTime,
          booking_datetime: bookingDatetime,
          client_name: tokenData.name || 'Cliente',
          client_email: tokenData.email,
          client_phone: tokenData.phone || null,
          company_name: tokenData.company || null,
          meeting_type: 'consultation',
          meeting_format: 'call',
          status: 'pending',
          notes: `Reserva creada desde token - Lead ID: ${tokenData.leadId}`
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      // Send notification emails
      const { error: notifyError } = await supabase.functions.invoke('send-booking-notification', {
        body: {
          bookingId: booking.id,
          clientName: tokenData.name || 'Cliente',
          clientEmail: tokenData.email,
          clientPhone: tokenData.phone,
          companyName: tokenData.company,
          bookingDate: selectedDate,
          bookingTime: selectedTime,
          meetingType: 'consultation',
          leadId: tokenData.leadId
        }
      });

      if (notifyError) {
        console.error('Error sending notification:', notifyError);
        // Don't throw - booking was successful, just notification failed
      }

      // Set booking details for confirmation
      setBookingDetails({
        date: selectedDate,
        time: selectedTime,
        name: tokenData.name,
        email: tokenData.email,
        phone: tokenData.phone,
        company: tokenData.company
      });
      setBookingConfirmed(true);

      toast({
        title: "¡Cita reservada!",
        description: "Recibirás un email de confirmación en breve.",
      });

    } catch (err: any) {
      console.error('Error creating booking:', err);
      toast({
        title: "Error al reservar",
        description: err.message || "No se pudo completar la reserva. Inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Invalid or expired token
  if (!tokenData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Shield className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              Enlace no válido
            </h1>
            <p className="text-muted-foreground">
              Este enlace de reserva ha expirado o no es válido. 
              Por favor, contacta con nosotros para obtener un nuevo enlace.
            </p>
          </div>
          <Button asChild>
            <a href="/contacto">Contactar</a>
          </Button>
        </div>
      </div>
    );
  }

  // Booking confirmed
  if (bookingConfirmed && bookingDetails) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <CapittalLogo />
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-8">
          <BookingConfirmation bookingDetails={bookingDetails} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <CapittalLogo />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Title Section */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            Reserva tu llamada
          </h1>
          <p className="text-muted-foreground">
            Selecciona el día y hora que mejor te convenga para hablar con nuestro equipo
          </p>
          {tokenData.name && (
            <p className="text-sm text-primary font-medium">
              Hola {tokenData.name} 👋
            </p>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <Clock className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">30 min</p>
              <p className="text-xs text-muted-foreground">Duración aprox.</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-card border border-border">
            <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">Lun - Vie</p>
              <p className="text-xs text-muted-foreground">9:00 - 19:00</p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-center">
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Calendar Section */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <BookingCalendar
            days={availableDays}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
            isLoading={isLoading}
          />

          <div className="border-t border-border pt-6">
            <BookingTimeSlots
              day={selectedDay}
              selectedTime={selectedTime}
              onSelectTime={handleSelectTime}
            />
          </div>
        </div>

        {/* Confirm Button */}
        {selectedDate && selectedTime && (
          <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm border border-border rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  {new Date(selectedDate).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </p>
                <p className="text-muted-foreground">a las {selectedTime}</p>
              </div>
              <Button
                onClick={handleConfirmBooking}
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reservando...
                  </>
                ) : (
                  'Confirmar cita'
                )}
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Capittal. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default BookingPage;
