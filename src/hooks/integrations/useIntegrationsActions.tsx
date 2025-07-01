
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { AdConversion, IntegrationConfig } from '@/types/integrations';

export const useIntegrationsActions = () => {
  const { toast } = useToast();

  const enrichCompanyWithApollo = async (domain: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('apollo-company-enrichment', {
        body: { company_domain: domain }
      });

      if (error) throw error;

      toast({
        title: "Enriquecimiento exitoso",
        description: `Datos de ${domain} actualizados con Apollo`,
      });

      return data;
    } catch (error) {
      console.error('Error enriching company:', error);
      toast({
        title: "Error en enriquecimiento",
        description: "No se pudo enriquecer la empresa con datos de Apollo",
        variant: "destructive",
      });
      throw error;
    }
  };

  const enrichContactsForCompany = async (companyDomain: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('apollo-contacts-enrichment', {
        body: { company_domain: companyDomain }
      });

      if (error) throw error;

      toast({
        title: "Contactos enriquecidos",
        description: `Contactos de ${companyDomain} actualizados`,
      });

      return data;
    } catch (error) {
      console.error('Error enriching contacts:', error);
      toast({
        title: "Error en enriquecimiento de contactos",
        description: "No se pudieron enriquecer los contactos",
        variant: "destructive",
      });
      throw error;
    }
  };

  const trackAdConversion = async (conversionData: Omit<AdConversion, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('ad_conversions')
        .insert([{
          ...conversionData,
          conversion_type: conversionData.conversion_type || 'form_submission'
        }])
        .select()
        .single();

      if (error) throw error;

      // También enviar a Google Ads
      if (conversionData.gclid) {
        await supabase.functions.invoke('google-ads-attribution', {
          body: {
            gclid: conversionData.gclid,
            conversion_value: conversionData.conversion_value,
            conversion_name: conversionData.conversion_name
          }
        });
      }

      return data;
    } catch (error) {
      console.error('Error tracking ad conversion:', error);
      throw error;
    }
  };

  const syncLinkedInIntelligence = async (companyDomain: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('linkedin-data-sync', {
        body: { company_domain: companyDomain }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error syncing LinkedIn data:', error);
      throw error;
    }
  };

  const updateIntegrationConfig = async (configId: string, updates: Partial<IntegrationConfig>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('integration_configs')
        .update(updates)
        .eq('id', configId);

      if (error) throw error;

      toast({
        title: "Configuración actualizada",
        description: "Los ajustes de integración se han guardado correctamente",
      });
    } catch (error) {
      console.error('Error updating integration config:', error);
      toast({
        title: "Error en configuración",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    enrichCompanyWithApollo,
    enrichContactsForCompany,
    trackAdConversion,
    syncLinkedInIntelligence,
    updateIntegrationConfig
  };
};
