import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { CompanyData } from '@/types/valuation';
import { toast } from 'sonner';

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
        
        // Mensajes específicos para diferentes errores de seguridad
        if (error.message.includes('rate_limit')) {
          toast.error('Demasiados intentos. Espera una hora e inténtalo de nuevo.');
        } else if (error.message.includes('JWT') || error.message.includes('token')) {
          toast.error('Token inválido o expirado.');
        } else if (error.message.includes('policy')) {
          toast.error('Este enlace ya no es válido. Contacta con soporte si necesitas ayuda.');
        } else {
          toast.error('No se pudo cargar la valoración. Contacta con soporte.');
        }
        
        throw error;
      }

      if (!data) {
        toast.error('Valoración no encontrada o token inválido.');
        return null;
      }

      // Advertencia si el token ya fue usado (primera vez que accede después de ser usado)
      if (data.token_used_at) {
        const usedDate = new Date(data.token_used_at);
        toast.warning(`Este enlace ya fue accedido el ${usedDate.toLocaleDateString()}. Por seguridad, los enlaces son de un solo uso. Contacta con nosotros si necesitas acceso nuevamente.`, {
          duration: 8000,
        });
      }

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
    retry: false, // No reintentar en caso de error (tokens de un solo uso)
  });
};