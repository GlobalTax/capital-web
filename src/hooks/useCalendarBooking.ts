import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface BookingData {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  bookingDate: string;
  bookingTime: string;
  meetingType: 'consultation' | 'valuation_review' | 'negotiation';
  notes?: string;
  valuationId?: string;
}

export const useCalendarBooking = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBooking = async (bookingData: BookingData) => {
    setIsSubmitting(true);

    try {
      // Create booking datetime
      const bookingDateTime = new Date(`${bookingData.bookingDate}T${bookingData.bookingTime}`);

      const insertData = {
        client_name: bookingData.clientName,
        client_email: bookingData.clientEmail,
        client_phone: bookingData.clientPhone || null,
        company_name: bookingData.companyName || null,
        booking_date: bookingData.bookingDate,
        booking_time: bookingData.bookingTime,
        booking_datetime: bookingDateTime.toISOString(),
        meeting_type: bookingData.meetingType,
        notes: bookingData.notes || null,
        valuation_id: bookingData.valuationId || null,
        status: 'pending'
      };

      console.log('Creating booking with data:', insertData);

      const { data, error } = await supabase
        .from('calendar_bookings')
        .insert([insertData])
        .select()
        .single();

      if (error) {
        console.error('Error creating booking:', error);
        throw error;
      }

      console.log('Booking created successfully:', data);

      toast.success('¡Cita reservada correctamente!', {
        description: `Tu cita está confirmada para el ${bookingDateTime.toLocaleDateString('es-ES')} a las ${bookingDateTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
      });

      return data;
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      
      let errorMessage = 'Por favor, inténtalo de nuevo';
      
      if (error.message?.includes('rate limit')) {
        errorMessage = 'Has alcanzado el límite de reservas. Contacta directamente con nosotros.';
      } else if (error.message?.includes('violates')) {
        errorMessage = 'Datos inválidos. Verifica la información introducida.';
      }

      toast.error('Error al reservar la cita', {
        description: errorMessage
      });
      
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableTimeSlots = (date: string): string[] => {
    // Morning slots: 9:00-13:00
    const morningSlots = Array.from({ length: 5 }, (_, i) => {
      const hour = 9 + i;
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    // Afternoon slots: 15:00-18:00 (excluding lunch break 14:00-15:00)
    const afternoonSlots = Array.from({ length: 4 }, (_, i) => {
      const hour = 15 + i;
      return `${hour.toString().padStart(2, '0')}:00`;
    });

    return [...morningSlots, ...afternoonSlots];
  };

  const getAvailableDates = (daysAhead = 30): string[] => {
    const dates = [];
    const today = new Date();
    
    for (let i = 1; i <= 45; i++) {  // Check more days to get enough business days
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      // Skip weekends
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        dates.push(date.toISOString().split('T')[0]);
      }
      
      if (dates.length >= daysAhead) break;
    }
    
    return dates;
  };

  return {
    createBooking,
    getAvailableTimeSlots,
    getAvailableDates,
    isSubmitting
  };
};