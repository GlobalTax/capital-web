import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CalendarBookingData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  bookingDate: string;
  bookingTime: string;
  meetingType: string;
  meetingFormat: string;
  notes?: string;
}

export const useCalendarBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitBooking = async (bookingData: CalendarBookingData) => {
    setIsSubmitting(true);
    
    try {
      // Get IP address and additional data
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      
      // Get UTM and referrer data
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source') || undefined;
      const utm_medium = urlParams.get('utm_medium') || undefined;
      const utm_campaign = urlParams.get('utm_campaign') || undefined;
      const referrer = document.referrer || undefined;

      // Combine date and time for booking_datetime
      const bookingDateTime = new Date(`${bookingData.bookingDate}T${bookingData.bookingTime}`);

      // Insert into calendar_bookings table
      const { data, error } = await supabase
        .from('calendar_bookings')
        .insert({
          client_name: bookingData.clientName,
          client_email: bookingData.clientEmail,
          client_phone: bookingData.clientPhone,
          company_name: bookingData.companyName,
          booking_date: bookingData.bookingDate,
          booking_time: bookingData.bookingTime,
          booking_datetime: bookingDateTime.toISOString(),
          meeting_type: bookingData.meetingType,
          meeting_format: bookingData.meetingFormat,
          notes: bookingData.notes,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Also insert into unified form_submissions table
      await supabase
        .from('form_submissions')
        .insert({
          form_type: 'calendar',
          full_name: bookingData.clientName,
          email: bookingData.clientEmail,
          phone: bookingData.clientPhone,
          company: bookingData.companyName,
          form_data: {
            booking_date: bookingData.bookingDate,
            booking_time: bookingData.bookingTime,
            meeting_type: bookingData.meetingType,
            meeting_format: bookingData.meetingFormat,
            notes: bookingData.notes
          },
          ip_address: ipData?.ip,
          user_agent: navigator.userAgent,
          referrer,
          utm_source,
          utm_medium,
          utm_campaign
        });

      toast({
        title: "Reserva confirmada",
        description: "Hemos recibido tu solicitud de reunión. Te contactaremos pronto.",
      });

      return data;
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu reserva. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitBooking,
    isSubmitting,
  };
};