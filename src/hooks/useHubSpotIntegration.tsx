
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useHubSpotIntegration = () => {
  const { toast } = useToast();

  const sendToHubSpot = async (type: string, data: any) => {
    try {
      const { data: result, error } = await supabase.functions.invoke('hubspot-integration', {
        body: { type, data }
      });

      if (error) {
        throw error;
      }

      return result;
    } catch (error) {
      console.error('HubSpot integration error:', error);
      throw error;
    }
  };

  const createContact = async (contactData: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    company?: string;
  }) => {
    return await sendToHubSpot('create_contact', contactData);
  };

  const createCompanyValuation = async (valuationData: any) => {
    return await sendToHubSpot('create_company_valuation', valuationData);
  };

  const createToolRating = async (ratingData: any) => {
    return await sendToHubSpot('create_tool_rating', ratingData);
  };

  return {
    createContact,
    createCompanyValuation,
    createToolRating
  };
};
