import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface BookingConfigItem {
  id: string;
  config_type: string;
  value: string;
  label: string;
  description: string | null;
  icon: string | null;
  duration_minutes: number | null;
  is_active: boolean;
  display_order: number;
}

interface BookingConfig {
  meetingTypes: BookingConfigItem[];
  meetingFormats: BookingConfigItem[];
  timeSlots: BookingConfigItem[];
}

export const useBookingConfig = () => {
  return useQuery({
    queryKey: ['booking-config'],
    queryFn: async (): Promise<BookingConfig> => {
      const { data, error } = await supabase
        .from('booking_config')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) {
        console.error('Error fetching booking config:', error);
        throw error;
      }

      const items = (data || []) as BookingConfigItem[];

      return {
        meetingTypes: items.filter(c => c.config_type === 'meeting_type'),
        meetingFormats: items.filter(c => c.config_type === 'meeting_format'),
        timeSlots: items.filter(c => c.config_type === 'time_slot')
      };
    },
    staleTime: 1000 * 60 * 10, // 10 minutes cache
  });
};
