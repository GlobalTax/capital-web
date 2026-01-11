import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SFPersonWithFund, SFPeopleFilters } from '@/types/searchFunds';

const SF_PEOPLE_WITH_FUNDS_KEY = 'sf_people_with_funds';

export const useSFPeopleWithFunds = (filters?: SFPeopleFilters) => {
  return useQuery({
    queryKey: [SF_PEOPLE_WITH_FUNDS_KEY, filters],
    queryFn: async () => {
      let query = supabase
        .from('sf_people')
        .select(`
          *,
          fund:sf_funds(id, name, country_base, status, sector_focus)
        `)
        .order('full_name');

      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      if (filters?.role && filters.role !== 'all') {
        query = query.eq('role', filters.role);
      }

      if (filters?.fund_id) {
        query = query.eq('fund_id', filters.fund_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter by country if specified (need to do client-side due to nested join)
      let result = data as SFPersonWithFund[];
      if (filters?.country) {
        result = result.filter(p => p.fund?.country_base === filters.country);
      }

      return result;
    },
  });
};
