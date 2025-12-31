import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CreateBookingData {
  client_name: string;
  client_email: string;
  client_phone?: string;
  company_name?: string;
  booking_date: string;
  booking_time: string;
  meeting_type: string;
  meeting_format: string;
  assigned_to?: string;
  notes?: string;
  send_confirmation_email?: boolean;
  lead_id?: string;
  lead_type?: string;
}

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateBookingData) => {
      const { send_confirmation_email, ...bookingData } = data;
      
      // Create booking_datetime from date and time
      const booking_datetime = `${data.booking_date}T${data.booking_time}:00`;

      const { data: newBooking, error } = await supabase
        .from('calendar_bookings')
        .insert({
          ...bookingData,
          booking_datetime,
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Optionally send confirmation email
      if (send_confirmation_email && newBooking) {
        try {
          await supabase.functions.invoke('send-booking-notification', {
            body: {
              bookingId: newBooking.id,
              clientName: data.client_name,
              clientEmail: data.client_email,
              bookingDate: data.booking_date,
              bookingTime: data.booking_time,
              meetingType: data.meeting_type,
              meetingFormat: data.meeting_format,
              companyName: data.company_name || '',
            }
          });
        } catch (emailError) {
          console.error('Error sending confirmation email:', emailError);
          // Don't fail the booking creation if email fails
        }
      }

      return newBooking;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-kpis'] });
      toast.success('Reserva creada correctamente');
    },
    onError: (error) => {
      console.error('Error creating booking:', error);
      toast.error('Error al crear la reserva');
    }
  });
};
