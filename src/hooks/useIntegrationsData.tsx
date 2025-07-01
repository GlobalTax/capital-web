
import { useState, useEffect } from 'react';
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

  // Wrapper functions that also refresh data
  const enrichCompanyWithApollo = async (domain: string) => {
    try {
      setIsLoading(true);
      const result = await enrichCompanyAction(domain);
      await refreshApolloData();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const enrichContactsForCompany = async (companyDomain: string) => {
    try {
      setIsLoading(true);
      const result = await enrichContactsAction(companyDomain);
      await refreshApolloData();
      return result;
    } finally {
      setIsLoading(false);
    }
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

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [
        companies,
        contacts,
        conversions,
        linkedin,
        touchpointData,
        logs,
        configs
      ] = await Promise.all([
        fetchApolloCompanies(),
        fetchApolloContacts(),
        fetchAdConversions(),
        fetchLinkedinData(),
        fetchTouchpoints(),
        fetchIntegrationLogs(),
        fetchIntegrationConfigs()
      ]);

      setApolloCompanies(companies);
      setApolloContacts(contacts);
      setAdConversions(conversions);
      setLinkedinData(linkedin);
      setTouchpoints(touchpointData);
      setIntegrationLogs(logs);
      setIntegrationConfigs(configs);
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
