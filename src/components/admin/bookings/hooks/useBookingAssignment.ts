import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AssignmentHistory {
  id: string;
  booking_id: string;
  assigned_to: string | null;
  assigned_by: string | null;
  assigned_at: string;
  notes: string | null;
  created_at: string;
  assigned_user?: {
    full_name: string | null;
  };
  assigner?: {
    full_name: string | null;
  };
}

export const useAssignBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      bookingId, 
      assignedTo,
      assignedBy 
    }: { 
      bookingId: string; 
      assignedTo: string | null;
      assignedBy: string;
    }) => {
      const { error } = await supabase
        .from('calendar_bookings')
        .update({ 
          assigned_to: assignedTo,
          assigned_at: assignedTo ? new Date().toISOString() : null,
          assigned_by: assignedTo ? assignedBy : null
        })
        .eq('id', bookingId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-assignment-history'] });
      toast.success('Reserva asignada correctamente');
    },
    onError: () => {
      toast.error('Error al asignar la reserva');
    }
  });
};

export const useAssignmentHistory = (bookingId: string | null) => {
  return useQuery({
    queryKey: ['booking-assignment-history', bookingId],
    queryFn: async () => {
      if (!bookingId) return [];
      
      const { data, error } = await supabase
        .from('booking_assignment_history')
        .select(`
          *,
          assigned_user:admin_users!booking_assignment_history_assigned_to_fkey(full_name),
          assigner:admin_users!booking_assignment_history_assigned_by_fkey(full_name)
        `)
        .eq('booking_id', bookingId)
        .order('assigned_at', { ascending: false });

      if (error) throw error;
      return data as AssignmentHistory[];
    },
    enabled: !!bookingId
  });
};

export const useTeamBookings = () => {
  return useQuery({
    queryKey: ['team-bookings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('calendar_bookings')
        .select(`
          *,
          assigned_user:admin_users!calendar_bookings_assigned_to_fkey(user_id, full_name, email)
        `)
        .gte('booking_date', new Date().toISOString().split('T')[0])
        .order('booking_datetime', { ascending: true });

      if (error) throw error;
      return data;
    }
  });
};
