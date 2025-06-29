
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

      // Enviar a segunda base de datos
      try {
        const { data: syncResult, error: syncError } = await supabase.functions.invoke('sync-leads', {
          body: {
            type: 'collaborator',
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
