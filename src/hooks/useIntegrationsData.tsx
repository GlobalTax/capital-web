
import { useState, useEffect } from 'react';
import { useOptimizedQueries } from './useOptimizedQueries';
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

  const { executeParallelQueries, clearCache } = useOptimizedQueries();
  const { handleAsyncError } = useCentralizedErrorHandler();
  const { executeWithRateLimit } = useRateLimit({ 
    maxRequests: 10, 
    windowMs: 60000 // 10 requests per minute
  });

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

  // Optimized data fetching using direct fetcher functions
  const fetchAllData = async () => {
    setIsLoading(true);
    
    try {
      const results = await executeParallelQueries([
        () => fetchApolloCompanies(),
        () => fetchApolloContacts(),
        () => fetchAdConversions(),
        () => fetchLinkedinData(),
        () => fetchIntegrationLogs(),
        () => fetchIntegrationConfigs()
      ], {
        cacheKey: 'integrations_all_data',
        cacheTtl: 180000 // 3 minutes
      });

      const [
        apolloCompaniesData,
        apolloContactsData,
        adConversionsData,
        linkedinDataResult,
        integrationLogsData,
        integrationConfigsData
      ] = results;

      if (apolloCompaniesData) setApolloCompanies(apolloCompaniesData);
      if (apolloContactsData) setApolloContacts(apolloContactsData);
      if (adConversionsData) setAdConversions(adConversionsData);
      if (linkedinDataResult) setLinkedinData(linkedinDataResult);
      if (integrationLogsData) setIntegrationLogs(integrationLogsData);
      if (integrationConfigsData) setIntegrationConfigs(integrationConfigsData);

    } catch (error) {
      console.error('Error fetching integrations data:', error);
    } finally {
      setIsLoading(false);
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
