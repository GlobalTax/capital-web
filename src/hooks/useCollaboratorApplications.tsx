
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useFormSecurity } from '@/hooks/useFormSecurity';

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
  const { getTrackingData, recordSubmissionAttempt } = useFormSecurity();

  const submitApplication = async (applicationData: CollaboratorApplication) => {
    setIsSubmitting(true);
    
    try {
      // Obtener datos de tracking
      const trackingData = await getTrackingData();

      // Insertar en Supabase principal
      const { data, error } = await supabase
        .from('collaborator_applications')
        .insert({
          full_name: applicationData.fullName.trim(),
          email: applicationData.email.trim(),
          phone: applicationData.phone.trim(),
          company: applicationData.company?.trim() || null,
          profession: applicationData.profession.trim(),
          experience: applicationData.experience?.trim() || null,
          motivation: applicationData.motivation?.trim() || null,
          ip_address: trackingData.ip_address,
          user_agent: trackingData.user_agent,
          utm_source: trackingData.utm_source,
          utm_medium: trackingData.utm_medium,
          utm_campaign: trackingData.utm_campaign,
          referrer: trackingData.referrer,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Registrar intento exitoso
      recordSubmissionAttempt(applicationData.email);

      // Enviar a segunda base de datos
      try {
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-leads', {
          body: {
            type: 'collaborator',
            data: {
              ...data,
              ...trackingData,
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
