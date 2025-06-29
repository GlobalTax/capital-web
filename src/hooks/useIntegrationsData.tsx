
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  ApolloCompany, 
  AdConversion, 
  LinkedInIntelligence, 
  AttributionTouchpoint,
  IntegrationLog,
  IntegrationConfig,
  IntegrationsMetrics 
} from '@/types/integrations';

export const useIntegrationsData = () => {
  const [apolloCompanies, setApolloCompanies] = useState<ApolloCompany[]>([]);
  const [adConversions, setAdConversions] = useState<AdConversion[]>([]);
  const [linkedinData, setLinkedinData] = useState<LinkedInIntelligence[]>([]);
  const [touchpoints, setTouchpoints] = useState<AttributionTouchpoint[]>([]);
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig[]>([]);
  const [metrics, setMetrics] = useState<IntegrationsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchApolloCompanies = async () => {
    try {
      const { data, error } = await supabase
        .from('apollo_companies')
        .select('*')
        .order('last_enriched', { ascending: false })
        .limit(100);

      if (error) throw error;
      setApolloCompanies(data || []);
    } catch (error) {
      console.error('Error fetching Apollo companies:', error);
    }
  };

  const fetchAdConversions = async () => {
    try {
      const { data, error } = await supabase
        .from('ad_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAdConversions(data || []);
    } catch (error) {
      console.error('Error fetching ad conversions:', error);
    }
  };

  const fetchLinkedinData = async () => {
    try {
      const { data, error } = await supabase
        .from('linkedin_intelligence')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(100);

      if (error) throw error;
      setLinkedinData(data || []);
    } catch (error) {
      console.error('Error fetching LinkedIn data:', error);
    }
  };

  const fetchTouchpoints = async () => {
    try {
      const { data, error } = await supabase
        .from('attribution_touchpoints')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (error) throw error;
      setTouchpoints(data || []);
    } catch (error) {
      console.error('Error fetching touchpoints:', error);
    }
  };

  const fetchIntegrationLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setIntegrationLogs(data || []);
    } catch (error) {
      console.error('Error fetching integration logs:', error);
    }
  };

  const fetchIntegrationConfigs = async () => {
    try {
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .order('integration_name');

      if (error) throw error;
      setIntegrationConfigs(data || []);
    } catch (error) {
      console.error('Error fetching integration configs:', error);
    }
  };

  const calculateMetrics = () => {
    const successLogs = integrationLogs.filter(log => log.status === 'success');
    const totalLogs = integrationLogs.length;
    
    const avgTime = integrationLogs
      .filter(log => log.execution_time_ms)
      .reduce((acc, log) => acc + (log.execution_time_ms || 0), 0) / 
      integrationLogs.filter(log => log.execution_time_ms).length || 0;

    setMetrics({
      apolloEnrichments: apolloCompanies.length,
      adConversions: adConversions.length,
      linkedinSignals: linkedinData.length,
      totalTouchpoints: touchpoints.length,
      successRate: totalLogs > 0 ? (successLogs.length / totalLogs) * 100 : 0,
      avgEnrichmentTime: avgTime
    });
  };

  const enrichCompanyWithApollo = async (domain: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('apollo-company-enrichment', {
        body: { company_domain: domain }
      });

      if (error) throw error;

      toast({
        title: "Enriquecimiento exitoso",
        description: `Datos de ${domain} actualizados con Apollo`,
      });

      await fetchApolloCompanies();
      return data;
    } catch (error) {
      console.error('Error enriching company:', error);
      toast({
        title: "Error en enriquecimiento",
        description: "No se pudo enriquecer la empresa con datos de Apollo",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const trackAdConversion = async (conversionData: Partial<AdConversion>) => {
    try {
      const { data, error } = await supabase
        .from('ad_conversions')
        .insert([conversionData])
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

      await fetchAdConversions();
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

      await fetchLinkedinData();
      return data;
    } catch (error) {
      console.error('Error syncing LinkedIn data:', error);
      throw error;
    }
  };

  const updateIntegrationConfig = async (configId: string, updates: Partial<IntegrationConfig>) => {
    try {
      const { data, error } = await supabase
        .from('integration_configs')
        .update(updates)
        .eq('id', configId)
        .select()
        .single();

      if (error) throw error;

      await fetchIntegrationConfigs();
      
      toast({
        title: "Configuración actualizada",
        description: "Los ajustes de integración se han guardado correctamente",
      });

      return data;
    } catch (error) {
      console.error('Error updating integration config:', error);
      toast({
        title: "Error en configuración",
        description: "No se pudo actualizar la configuración",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      await Promise.all([
        fetchApolloCompanies(),
        fetchAdConversions(),
        fetchLinkedinData(),
        fetchTouchpoints(),
        fetchIntegrationLogs(),
        fetchIntegrationConfigs()
      ]);
      setIsLoading(false);
    };

    fetchAllData();
  }, []);

  useEffect(() => {
    calculateMetrics();
  }, [apolloCompanies, adConversions, linkedinData, touchpoints, integrationLogs]);

  return {
    // Data
    apolloCompanies,
    adConversions,
    linkedinData,
    touchpoints,
    integrationLogs,
    integrationConfigs,
    metrics,
    isLoading,
    
    // Actions
    enrichCompanyWithApollo,
    trackAdConversion,
    syncLinkedInIntelligence,
    updateIntegrationConfig,
    
    // Refresh functions
    fetchApolloCompanies,
    fetchAdConversions,
    fetchLinkedinData,
    fetchTouchpoints,
    fetchIntegrationLogs,
    fetchIntegrationConfigs
  };
};
