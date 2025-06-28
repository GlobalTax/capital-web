
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useHubSpotIntegration } from '@/hooks/useHubSpotIntegration';

interface ContactLead {
  fullName: string;
  company: string;
  phone?: string;
  email: string;
  country?: string;
  companySize?: string;
  referral?: string;
}

export const useContactLeads = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { createContact } = useHubSpotIntegration();

  const submitContactLead = async (leadData: ContactLead) => {
    setIsSubmitting(true);
    
    try {
      // Obtener información adicional del navegador
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      
      // Insertar en Supabase
      const { data, error } = await supabase
        .from('contact_leads')
        .insert({
          full_name: leadData.fullName,
          company: leadData.company,
          phone: leadData.phone,
          email: leadData.email,
          country: leadData.country,
          company_size: leadData.companySize,
          referral: leadData.referral,
          ip_address: ipData?.ip,
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Enviar a HubSpot en segundo plano
      try {
        await createContact({
          email: leadData.email,
          firstName: leadData.fullName.split(' ')[0],
          lastName: leadData.fullName.split(' ').slice(1).join(' '),
          phone: leadData.phone,
          company: leadData.company,
        });
        
        // Actualizar estado de HubSpot enviado
        await supabase
          .from('contact_leads')
          .update({ 
            hubspot_sent: true, 
            hubspot_sent_at: new Date().toISOString() 
          })
          .eq('id', data.id);
          
      } catch (hubspotError) {
        console.error('Error enviando a HubSpot:', hubspotError);
        // No fallar el formulario por error de HubSpot
      }

      toast({
        title: "Solicitud enviada",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas para programar tu consulta gratuita.",
      });

      return data;
    } catch (error) {
      console.error('Error enviando lead de contacto:', error);
      toast({
        title: "Error",
        description: "Hubo un problema enviando tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitContactLead,
    isSubmitting,
  };
};
