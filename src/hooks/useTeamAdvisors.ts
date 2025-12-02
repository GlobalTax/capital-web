import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TeamAdvisor {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useTeamAdvisors = () => {
  return useQuery({
    queryKey: ['team-advisors'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('email_recipients_config')
        .select('id, name, email, role')
        .eq('is_active', true)
        .in('role', ['asesor', 'direccion'])
        .order('name');
      
      if (error) {
        console.error('Error fetching team advisors:', error);
        return [];
      }
      
      return data as TeamAdvisor[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
