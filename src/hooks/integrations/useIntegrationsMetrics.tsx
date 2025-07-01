
import { 
  ApolloCompany, 
  ApolloContact,
  AdConversion, 
  LinkedInIntelligence, 
  AttributionTouchpoint,
  IntegrationLog,
  IntegrationsMetrics 
} from '@/types/integrations';

export const useIntegrationsMetrics = () => {
  const calculateMetrics = (
    apolloCompanies: ApolloCompany[],
    apolloContacts: ApolloContact[],
    adConversions: AdConversion[],
    linkedinData: LinkedInIntelligence[],
    touchpoints: AttributionTouchpoint[],
    integrationLogs: IntegrationLog[]
  ): IntegrationsMetrics => {
    const successLogs = integrationLogs.filter(log => log.status === 'success');
    const totalLogs = integrationLogs.length;
    
    const avgTime = integrationLogs
      .filter(log => log.execution_time_ms)
      .reduce((acc, log) => acc + (log.execution_time_ms || 0), 0) / 
      integrationLogs.filter(log => log.execution_time_ms).length || 0;

    return {
      apolloEnrichments: apolloCompanies.length,
      apolloContacts: apolloContacts.length,
      adConversions: adConversions.length,
      linkedinSignals: linkedinData.length,
      totalTouchpoints: touchpoints.length,
      successRate: totalLogs > 0 ? (successLogs.length / totalLogs) * 100 : 0,
      avgEnrichmentTime: avgTime
    };
  };

  return {
    calculateMetrics
  };
};
