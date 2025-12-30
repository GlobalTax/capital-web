import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ContactForBooking {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  status: string | null;
}

export const useContactsForBooking = (searchTerm: string = '') => {
  return useQuery({
    queryKey: ['contacts-for-booking', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('contact_leads')
        .select('id, full_name, email, phone, company, status')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(50);

      if (searchTerm) {
        query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ContactForBooking[];
    },
    staleTime: 30000,
  });
};
