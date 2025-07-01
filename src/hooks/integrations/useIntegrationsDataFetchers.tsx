
import { supabase } from '@/integrations/supabase/client';
import { 
  ApolloCompany, 
  ApolloContact,
  AdConversion, 
  LinkedInIntelligence, 
  AttributionTouchpoint,
  IntegrationLog,
  IntegrationConfig
} from '@/types/integrations';

export const useIntegrationsDataFetchers = () => {
  const fetchApolloCompanies = async (): Promise<ApolloCompany[]> => {
    try {
      const { data, error } = await supabase
        .from('apollo_companies')
        .select('*')
        .order('last_enriched', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Apollo companies:', error);
      return [];
    }
  };

  const fetchApolloContacts = async (): Promise<ApolloContact[]> => {
    try {
      const { data, error } = await supabase
        .from('apollo_contacts')
        .select('*')
        .order('last_enriched', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Apollo contacts:', error);
      return [];
    }
  };

  const fetchAdConversions = async (): Promise<AdConversion[]> => {
    try {
      const { data, error } = await supabase
        .from('ad_conversions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching ad conversions:', error);
      return [];
    }
  };

  const fetchLinkedinData = async (): Promise<LinkedInIntelligence[]> => {
    try {
      const { data, error } = await supabase
        .from('linkedin_intelligence')
        .select('*')
        .order('last_updated', { ascending: false })
        .limit(100);

      if (error) throw error;
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        decision_makers: Array.isArray(item.decision_makers) ? item.decision_makers : [],
        funding_signals: item.funding_signals || {}
      })) || [];
      return transformedData;
    } catch (error) {
      console.error('Error fetching LinkedIn data:', error);
      return [];
    }
  };

  const fetchTouchpoints = async (): Promise<AttributionTouchpoint[]> => {
    try {
      const { data, error } = await supabase
        .from('attribution_touchpoints')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(200);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching touchpoints:', error);
      return [];
    }
  };

  const fetchIntegrationLogs = async (): Promise<IntegrationLog[]> => {
    try {
      const { data, error } = await supabase
        .from('integration_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        data_payload: item.data_payload || {},
        status: item.status as 'pending' | 'success' | 'error'
      })) || [];
      return transformedData;
    } catch (error) {
      console.error('Error fetching integration logs:', error);
      return [];
    }
  };

  const fetchIntegrationConfigs = async (): Promise<IntegrationConfig[]> => {
    try {
      const { data, error } = await supabase
        .from('integration_configs')
        .select('*')
        .order('integration_name');

      if (error) throw error;
      // Transform the data to match our interface
      const transformedData = data?.map(item => ({
        ...item,
        config_data: item.config_data || {}
      })) || [];
      return transformedData;
    } catch (error) {
      console.error('Error fetching integration configs:', error);
      return [];
    }
  };

  return {
    fetchApolloCompanies,
    fetchApolloContacts,
    fetchAdConversions,
    fetchLinkedinData,
    fetchTouchpoints,
    fetchIntegrationLogs,
    fetchIntegrationConfigs
  };
};
