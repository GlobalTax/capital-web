
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollaboratorApplication {
  fullName: string;
  email: string;
  phone: string;
  company?: string;
  profession: string;
  experience?: string;
  motivation?: string;
}

export const useCollaboratorApplications = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const submitApplication = async (applicationData: CollaboratorApplication) => {
    setIsSubmitting(true);
    
    try {
      // Obtener información adicional del navegador
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;
      
      // Get UTM and referrer data
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source') || undefined;
      const utm_medium = urlParams.get('utm_medium') || undefined;
      const utm_campaign = urlParams.get('utm_campaign') || undefined;
      const referrer = document.referrer || undefined;

      // Insertar en Supabase principal
      const { data, error } = await supabase
        .from('collaborator_applications')
        .insert({
          full_name: applicationData.fullName,
          email: applicationData.email,
          phone: applicationData.phone,
          company: applicationData.company,
          profession: applicationData.profession,
          experience: applicationData.experience,
          motivation: applicationData.motivation,
          ip_address: ipData?.ip,
          user_agent: navigator.userAgent,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Also insert into unified form_submissions table
      await supabase
        .from('form_submissions')
        .insert({
          form_type: 'collaborator',
          full_name: applicationData.fullName,
          email: applicationData.email,
          phone: applicationData.phone,
          company: applicationData.company,
          form_data: {
            profession: applicationData.profession,
            experience: applicationData.experience,
            motivation: applicationData.motivation
          },
          ip_address: ipData?.ip,
          user_agent: navigator.userAgent,
          referrer,
          utm_source,
          utm_medium,
          utm_campaign
        });

      // Enviar a segunda base de datos
      try {
        // Enriquecer con UTM y referrer
        const urlParams = new URLSearchParams(window.location.search);
        const utm_source = urlParams.get('utm_source') || undefined;
        const utm_medium = urlParams.get('utm_medium') || undefined;
        const utm_campaign = urlParams.get('utm_campaign') || undefined;
        const referrer = document.referrer || undefined;

        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-leads', {
          body: {
            type: 'collaborator',
            data: {
              ...data,
              ip_address: ipData?.ip,
              user_agent: navigator.userAgent,
              utm_source,
              utm_medium,
              utm_campaign,
              referrer,
              source: 'web-collaborators'
            }
          }
        });

        if (syncError) {
          console.error('Error sincronizando con segunda DB:', syncError);
        } else {
          console.log('Solicitud de colaborador sincronizada exitosamente:', syncResult);
        }
      } catch (secondaryDbError) {
        console.error('Error enviando a segunda DB:', secondaryDbError);
      }

      toast({
        title: "Solicitud enviada",
        description: "Hemos recibido tu solicitud para el programa de colaboradores. Te contactaremos pronto.",
      });

      return data;
    } catch (error) {
      console.error('Error enviando solicitud de colaborador:', error);
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
    submitApplication,
    isSubmitting,
  };
};
