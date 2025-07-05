
import { useState, useEffect } from 'react';
import { useCentralizedErrorHandler } from './useCentralizedErrorHandler';
import { useRateLimit } from './useRateLimit';
import { 
  ApolloCompany, 
  ApolloContact,
  AdConversion, 
  LinkedInIntelligence, 
  AttributionTouchpoint,
  IntegrationLog,
  IntegrationConfig,
  IntegrationsMetrics 
} from '@/types/integrations';
import { useIntegrationsDataFetchers } from './integrations/useIntegrationsDataFetchers';
import { useIntegrationsActions } from './integrations/useIntegrationsActions';
import { useIntegrationsMetrics } from './integrations/useIntegrationsMetrics';

export const useIntegrationsData = () => {
  const [apolloCompanies, setApolloCompanies] = useState<ApolloCompany[]>([]);
  const [apolloContacts, setApolloContacts] = useState<ApolloContact[]>([]);
  const [adConversions, setAdConversions] = useState<AdConversion[]>([]);
  const [linkedinData, setLinkedinData] = useState<LinkedInIntelligence[]>([]);
  const [touchpoints, setTouchpoints] = useState<AttributionTouchpoint[]>([]);
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>([]);
  const [integrationConfigs, setIntegrationConfigs] = useState<IntegrationConfig[]>([]);
  const [metrics, setMetrics] = useState<IntegrationsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    fetchApolloCompanies,
    fetchApolloContacts,
    fetchAdConversions,
    fetchLinkedinData,
    fetchTouchpoints,
    fetchIntegrationLogs,
    fetchIntegrationConfigs
  } = useIntegrationsDataFetchers();

  const {
    enrichCompanyWithApollo: enrichCompanyAction,
    enrichContactsForCompany: enrichContactsAction,
    trackAdConversion,
    syncLinkedInIntelligence,
    updateIntegrationConfig: updateConfigAction
  } = useIntegrationsActions();

  const { calculateMetrics } = useIntegrationsMetrics();

  const { handleAsyncError } = useCentralizedErrorHandler();
  const { executeWithRateLimit } = useRateLimit({ 
    maxRequests: 10, 
    windowMs: 60000 // 10 requests per minute
  });

  // Cache simple
  const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  const clearCache = (pattern?: string) => {
    if (pattern) {
      const keysToDelete = Array.from(cache.keys()).filter(key => key.includes(pattern));
      keysToDelete.forEach(key => cache.delete(key));
    } else {
      cache.clear();
    }
  };

  // Wrapper functions that also refresh data
  const enrichCompanyWithApollo = async (domain: string) => {
    return executeWithRateLimit(async () => {
      return handleAsyncError(async () => {
        const result = await enrichCompanyAction(domain);
        clearCache('apollo_companies'); // Invalidate cache after update
        return result;
      }, { component: 'useIntegrationsData', action: 'enrichCompanyWithApollo' });
    }, `enrich_company_${domain}`);
  };

  const enrichContactsForCompany = async (companyDomain: string) => {
    return executeWithRateLimit(async () => {
      return handleAsyncError(async () => {
        const result = await enrichContactsAction(companyDomain);
        clearCache('apollo_contacts'); // Invalidate cache after update
        return result;
      }, { component: 'useIntegrationsData', action: 'enrichContactsForCompany' });
    }, `enrich_contacts_${companyDomain}`);
  };

  const updateIntegrationConfig = async (configId: string, updates: Partial<IntegrationConfig>): Promise<void> => {
    await updateConfigAction(configId, updates);
    await refreshIntegrationConfigs();
  };

  // Refresh functions
  const refreshApolloData = async () => {
    const [companies, contacts] = await Promise.all([
      fetchApolloCompanies(),
      fetchApolloContacts()
    ]);
    setApolloCompanies(companies);
    setApolloContacts(contacts);
  };

  const refreshIntegrationConfigs = async () => {
    const configs = await fetchIntegrationConfigs();
    setIntegrationConfigs(configs);
  };

  // Simplified data fetching with better error handling
  const fetchAllData = async () => {
    setIsLoading(true);
    console.log('🔄 Iniciando carga de datos de integraciones...');
    
    try {
      const [
        apolloCompaniesData,
        apolloContactsData,
        adConversionsData,
        linkedinDataResult,
        integrationLogsData,
        integrationConfigsData
      ] = await Promise.all([
        fetchApolloCompanies().catch(err => {
          console.warn('Error fetching Apollo companies:', err);
          return [];
        }),
        fetchApolloContacts().catch(err => {
          console.warn('Error fetching Apollo contacts:', err);
          return [];
        }),
        fetchAdConversions().catch(err => {
          console.warn('Error fetching ad conversions:', err);
          return [];
        }),
        fetchLinkedinData().catch(err => {
          console.warn('Error fetching LinkedIn data:', err);
          return [];
        }),
        fetchIntegrationLogs().catch(err => {
          console.warn('Error fetching integration logs:', err);
          return [];
        }),
        fetchIntegrationConfigs().catch(err => {
          console.error('Error fetching integration configs:', err);
          return [];
        })
      ]);

      console.log('✅ Datos cargados:', {
        companies: apolloCompaniesData.length,
        contacts: apolloContactsData.length,
        conversions: adConversionsData.length,
        configs: integrationConfigsData.length
      });

      setApolloCompanies(apolloCompaniesData);
      setApolloContacts(apolloContactsData);
      setAdConversions(adConversionsData);
      setLinkedinData(linkedinDataResult);
      setIntegrationLogs(integrationLogsData);
      setIntegrationConfigs(integrationConfigsData);

    } catch (error) {
      console.error('❌ Error crítico cargando datos de integraciones:', error);
      handleAsyncError(async () => { throw error }, { 
        component: 'useIntegrationsData', 
        action: 'fetchAllData' 
      });
    } finally {
      setIsLoading(false);
      console.log('🏁 Carga de integraciones completada');
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    const newMetrics = calculateMetrics(
      apolloCompanies,
      apolloContacts,
      adConversions,
      linkedinData,
      touchpoints,
      integrationLogs
    );
    setMetrics(newMetrics);
  }, [apolloCompanies, apolloContacts, adConversions, linkedinData, touchpoints, integrationLogs, calculateMetrics]);

  return {
    // Data
    apolloCompanies,
    apolloContacts,
    adConversions,
    linkedinData,
    touchpoints,
    integrationLogs,
    integrationConfigs,
    metrics,
    isLoading,
    
    // Actions
    enrichCompanyWithApollo,
    enrichContactsForCompany,
    trackAdConversion,
    syncLinkedInIntelligence,
    updateIntegrationConfig,
    
    // Refresh functions
    fetchApolloCompanies: refreshApolloData,
    fetchApolloContacts: refreshApolloData,
    fetchAdConversions: async () => {
      const conversions = await fetchAdConversions();
      setAdConversions(conversions);
    },
    fetchLinkedinData: async () => {
      const linkedin = await fetchLinkedinData();
      setLinkedinData(linkedin);
    },
    fetchTouchpoints: async () => {
      const touchpointData = await fetchTouchpoints();
      setTouchpoints(touchpointData);
    },
    fetchIntegrationLogs: async () => {
      const logs = await fetchIntegrationLogs();
      setIntegrationLogs(logs);
    },
    fetchIntegrationConfigs: refreshIntegrationConfigs
  };
};
