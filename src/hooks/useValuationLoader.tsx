import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { CompanyData } from '@/types/valuation';

export const useValuationLoader = (token: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VALUATION_BY_TOKEN, token],
    queryFn: async (): Promise<CompanyData | null> => {
      if (!token) return null;

      const { data, error } = await supabase
        .from('company_valuations')
        .select('*')
        .eq('unique_token', token)
        .single();

      if (error) {
        console.error('Error loading valuation by token:', error);
        throw error;
      }

      if (!data) return null;

      // Map database fields to CompanyData format
      return {
        contactName: data.contact_name || '',
        companyName: data.company_name || '',
        cif: data.cif || '',
        email: data.email || '',
        phone: data.phone || '',
        phone_e164: data.phone_e164 || '',
        whatsapp_opt_in: data.whatsapp_opt_in || false,
        industry: data.industry || '',
        activityDescription: '', // Not stored in DB yet
        employeeRange: data.employee_range || '',
        revenue: data.revenue || 0,
        ebitda: data.ebitda || 0,
        hasAdjustments: false, // Not stored in DB yet
        adjustmentAmount: 0, // Not stored in DB yet
        location: data.location || '',
        ownershipParticipation: data.ownership_participation || '',
        competitiveAdvantage: data.competitive_advantage || '',
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};