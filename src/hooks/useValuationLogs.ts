import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface MessageLog {
  id: string;
  type: string;
  status: string;
  recipient: string | null;
  provider_name: string | null;
  error_details: string | null;
  created_at: string;
  retry_count: number | null;
}

interface ValuationLogData {
  whatsappLogs: MessageLog[];
  emailLogs: MessageLog[];
  hubspotLogs: MessageLog[];
  latestWhatsapp: MessageLog | null;
  latestEmail: MessageLog | null; 
  latestHubspot: MessageLog | null;
}

export const useValuationLogs = (valuationId: string) => {
  return useQuery({
    queryKey: ['valuation-logs', valuationId],
    queryFn: async (): Promise<ValuationLogData> => {
      const { data, error } = await supabase
        .from('message_logs')
        .select('*')
        .eq('valuation_id', valuationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching valuation logs:', error);
        throw error;
      }

      const logs = data || [];
      
      // Separar logs por tipo
      const whatsappLogs = logs.filter(log => log.type === 'whatsapp');
      const emailLogs = logs.filter(log => log.type === 'email');
      const hubspotLogs = logs.filter(log => log.type === 'hubspot');

      return {
        whatsappLogs,
        emailLogs,
        hubspotLogs,
        latestWhatsapp: whatsappLogs[0] || null,
        latestEmail: emailLogs[0] || null,
        latestHubspot: hubspotLogs[0] || null,
      };
    },
    enabled: !!valuationId,
    staleTime: 30 * 1000, // 30 segundos
  });
};