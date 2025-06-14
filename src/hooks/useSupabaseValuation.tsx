
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompanyData {
  contactName: string;
  companyName: string;
  cif: string;
  email: string;
  phone: string;
  industry: string;
  yearsOfOperation: number;
  employeeRange: string;
  revenue: number;
  ebitda: number;
  netProfitMargin: number;
  growthRate: number;
  location: string;
  ownershipParticipation: string;
  competitiveAdvantage: string;
}

interface ValuationResult {
  ebitdaMultiple: number;
  finalValuation: number;
  valuationRange: {
    min: number;
    max: number;
  };
  multiples: {
    ebitdaMultipleUsed: number;
  };
}

export const useSupabaseValuation = () => {
  const { toast } = useToast();

  const saveValuation = async (companyData: CompanyData, result: ValuationResult) => {
    try {
      console.log('Guardando valoración en Supabase...');
      
      // Obtener información del cliente
      const userAgent = navigator.userAgent;
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      const { data, error } = await supabase
        .from('company_valuations')
        .insert({
          contact_name: companyData.contactName,
          company_name: companyData.companyName,
          cif: companyData.cif,
          email: companyData.email,
          phone: companyData.phone,
          industry: companyData.industry,
          years_of_operation: companyData.yearsOfOperation,
          employee_range: companyData.employeeRange,
          revenue: companyData.revenue,
          ebitda: companyData.ebitda,
          net_profit_margin: companyData.netProfitMargin,
          growth_rate: companyData.growthRate,
          location: companyData.location,
          ownership_participation: companyData.ownershipParticipation,
          competitive_advantage: companyData.competitiveAdvantage,
          final_valuation: result.finalValuation,
          ebitda_multiple_used: result.multiples.ebitdaMultipleUsed,
          valuation_range_min: result.valuationRange.min,
          valuation_range_max: result.valuationRange.max,
          ip_address: ipData.ip,
          user_agent: userAgent,
          hubspot_sent: false // Se actualizará cuando HubSpot confirme
        });

      if (error) {
        console.error('Error guardando valoración en Supabase:', error);
        throw error;
      }

      console.log('Valoración guardada correctamente en Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error en saveValuation:', error);
      toast({
        title: "Error",
        description: "No se pudo guardar la valoración. Los datos se enviarán a HubSpot.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const saveToolRating = async (ratingData: any) => {
    try {
      console.log('Guardando valoración de herramienta en Supabase...');
      
      // Obtener información del cliente
      const userAgent = navigator.userAgent;
      const ipResponse = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipResponse.json();
      
      const { data, error } = await supabase
        .from('tool_ratings')
        .insert({
          ease_of_use: ratingData.ease_of_use,
          result_accuracy: ratingData.result_accuracy,
          recommendation: ratingData.recommendation,
          feedback_comment: ratingData.feedback_comment,
          user_email: ratingData.user_email,
          company_sector: ratingData.company_sector,
          company_size: ratingData.company_size,
          ip_address: ipData.ip,
          user_agent: userAgent
        });

      if (error) {
        console.error('Error guardando valoración de herramienta en Supabase:', error);
        throw error;
      }

      console.log('Valoración de herramienta guardada correctamente en Supabase:', data);
      return data;
    } catch (error) {
      console.error('Error en saveToolRating:', error);
      // No mostramos toast aquí para no interferir con la experiencia del usuario
      throw error;
    }
  };

  return {
    saveValuation,
    saveToolRating
  };
};
