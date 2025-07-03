
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
    console.log('💼 [ContactLeads] Iniciando envío de lead:', leadData);
    setIsSubmitting(true);
    
    try {
      // Obtener información adicional del navegador
      console.log('🌐 [ContactLeads] Obteniendo IP del usuario...');
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      console.log('📍 [ContactLeads] IP obtenida:', ipData?.ip);
      
      // Insertar en Supabase principal
      console.log('💾 [ContactLeads] Insertando en Supabase...');
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
        console.error('❌ [ContactLeads] Error insertando en Supabase:', error);
        throw error;
      }
      
      console.log('✅ [ContactLeads] Lead insertado exitosamente:', data.id);

      // Enviar a HubSpot en segundo plano
      try {
        console.log('📧 [ContactLeads] Enviando a HubSpot...');
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
          
        console.log('✅ [ContactLeads] Enviado a HubSpot exitosamente');
      } catch (hubspotError) {
        console.error('⚠️ [ContactLeads] Error enviando a HubSpot:', hubspotError);
      }

      // Enviar a segunda base de datos
      try {
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-leads', {
          body: {
            type: 'contact',
            data: {
              ...data,
              ip_address: ipData?.ip,
              user_agent: navigator.userAgent,
            }
          }
        });

        if (syncError) {
          console.error('Error sincronizando con segunda DB:', syncError);
        } else {
          console.log('Lead sincronizado exitosamente:', syncResult);
        }
      } catch (secondaryDbError) {
        console.error('Error enviando a segunda DB:', secondaryDbError);
      }

      console.log('🎉 [ContactLeads] Proceso completado exitosamente');
      toast({
        title: "Solicitud enviada",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas para programar tu consulta gratuita.",
      });

      return data;
    } catch (error) {
      console.error('❌ [ContactLeads] Error enviando lead de contacto:', error);
      
      // Mostrar error más específico si es de permisos
      if (error.message?.includes('permission denied')) {
        toast({
          title: "Error de configuración",
          description: "Error interno del servidor. Por favor, contacta con soporte.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Hubo un problema enviando tu solicitud. Por favor intenta de nuevo.",
          variant: "destructive",
        });
      }
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
