import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/shared/constants/query-keys';
import { CompanyData } from '@/types/valuation';
import { toast } from 'sonner';

export const useValuationLoader = (token: string | null) => {
  return useQuery({
    queryKey: [QUERY_KEYS.VALUATION_BY_TOKEN, token],
    queryFn: async (): Promise<CompanyData | null> => {
      if (!token) return null;

      console.log('🔐 Loading valuation via secure Edge Function...');

      // ✅ SECURE: Usar Edge Function segura en lugar de query directa a la BD
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      const response = await fetch(
        `${supabaseUrl}/functions/v1/get-valuation-by-token?token=${encodeURIComponent(token)}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${anonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error loading valuation:', errorData);
        
        // Mensajes específicos para diferentes errores de seguridad
        if (response.status === 429) {
          toast.error('Demasiados intentos. Por favor, espera unos minutos.');
          throw new Error('RATE_LIMITED');
        }
        
        if (response.status === 404 || errorData.code === 'TOKEN_NOT_FOUND') {
          toast.error('El enlace no es válido o ha expirado.');
          throw new Error('TOKEN_NOT_FOUND');
        }
        
        if (response.status === 403) {
          const messages: Record<string, string> = {
            'TOKEN_EXPIRED': 'Este enlace ha expirado.',
            'TOKEN_REVOKED': 'Este enlace ha sido revocado.',
            'MAX_VIEWS_EXCEEDED': 'Este enlace ha alcanzado el límite de visualizaciones.',
            'NOT_COMPLETED': 'La valoración aún no está disponible.',
          };
          toast.error(messages[errorData.code] || 'Acceso denegado al enlace.');
          throw new Error(errorData.code || 'ACCESS_DENIED');
        }
        
        toast.error('No se pudo cargar la valoración. Contacta con soporte.');
        throw new Error(errorData.error || 'FETCH_ERROR');
      }

      const result = await response.json();
      
      if (!result.success || !result.data) {
        toast.error('Valoración no encontrada.');
        throw new Error('NO_DATA');
      }

      const data = result.data;
      console.log('✅ Valuation loaded securely');

      // Map response to CompanyData format
      return {
        contactName: data.contactName || '',
        companyName: data.companyName || '',
        cif: '', // Not exposed via Edge Function for security
        email: data.email || '',
        phone: '', // Not exposed via Edge Function for security
        phone_e164: '',
        whatsapp_opt_in: false,
        industry: data.industry || '',
        activityDescription: '',
        employeeRange: data.employeeRange || '',
        revenue: data.revenue || 0,
        ebitda: data.ebitda || 0,
        hasAdjustments: data.hasAdjustments || false,
        adjustmentAmount: data.adjustmentAmount || 0,
        location: '',
        ownershipParticipation: '',
        competitiveAdvantage: '',
      };
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // No reintentar en caso de error (tokens limitados)
  });
};