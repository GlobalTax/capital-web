import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface Booking {
  id: string;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  company_name: string | null;
  booking_date: string;
  booking_time: string;
  booking_datetime: string;
  meeting_type: string;
  meeting_format: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes: string | null;
  valuation_id: string | null;
  confirmed_at: string | null;
  confirmed_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  // Assignment fields
  assigned_to: string | null;
  assigned_at: string | null;
  assigned_by: string | null;
  assigned_user?: {
    user_id: string;
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface BookingFilters {
  status: string;
  dateRange: 'today' | 'week' | 'month' | 'all' | 'past';
  search: string;
}

export interface BookingKPIs {
  todayCount: number;
  weekCount: number;
  pendingCount: number;
  completedCount: number;
  cancelledCount: number;
  confirmationRate: number;
}

export const useBookings = (filters: BookingFilters) => {
  return useQuery({
    queryKey: ['bookings', filters],
    queryFn: async () => {
      let query = supabase
        .from('calendar_bookings')
        .select(`
          *,
          assigned_user:admin_users!calendar_bookings_assigned_to_fkey(user_id, full_name, email)
        `)
        .order('booking_datetime', { ascending: true });

      // Filter by status
      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      // Filter by date range
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      if (filters.dateRange === 'today') {
        query = query.eq('booking_date', today);
      } else if (filters.dateRange === 'week') {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        query = query.gte('booking_date', today).lte('booking_date', weekEnd.toISOString().split('T')[0]);
      } else if (filters.dateRange === 'month') {
        const monthEnd = new Date(now);
        monthEnd.setDate(monthEnd.getDate() + 30);
        query = query.gte('booking_date', today).lte('booking_date', monthEnd.toISOString().split('T')[0]);
      } else if (filters.dateRange === 'past') {
        query = query.lt('booking_date', today);
      }

      // Filter by search
      if (filters.search) {
        query = query.or(`client_name.ilike.%${filters.search}%,client_email.ilike.%${filters.search}%,company_name.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Booking[];
    }
  });
};

export const useBookingKPIs = () => {
  return useQuery({
    queryKey: ['booking-kpis'],
    queryFn: async () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const { data, error } = await supabase
        .from('calendar_bookings')
        .select('status, booking_date');

      if (error) throw error;

      const bookings = data || [];
      
      const todayCount = bookings.filter(b => b.booking_date === today).length;
      const weekCount = bookings.filter(b => {
        const date = new Date(b.booking_date);
        return date >= now && date <= weekEnd;
      }).length;
      const pendingCount = bookings.filter(b => b.status === 'pending').length;
      const completedCount = bookings.filter(b => b.status === 'completed').length;
      const cancelledCount = bookings.filter(b => b.status === 'cancelled').length;
      
      const totalProcessed = completedCount + cancelledCount;
      const confirmationRate = totalProcessed > 0 
        ? Math.round((completedCount / totalProcessed) * 100) 
        : 0;

      return {
        todayCount,
        weekCount,
        pendingCount,
        completedCount,
        cancelledCount,
        confirmationRate
      } as BookingKPIs;
    }
  });
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      status, 
      cancellationReason 
    }: { 
      id: string; 
      status: Booking['status']; 
      cancellationReason?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };

      if (status === 'confirmed') {
        updateData.confirmed_at = new Date().toISOString();
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        if (cancellationReason) {
          updateData.cancellation_reason = cancellationReason;
        }
      }

      const { error } = await supabase
        .from('calendar_bookings')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking-kpis'] });
      toast.success('Estado actualizado correctamente');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    }
  });
};

export const useUpdateBookingNotes = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('calendar_bookings')
        .update({ notes })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Notas guardadas');
    },
    onError: () => {
      toast.error('Error al guardar notas');
    }
  });
};
