import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getPreferredLang } from '@/shared/i18n/locale';

export const useV4LinkSender = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const sendV4Link = async (valuationId: string, sendEmail: boolean = true) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-v4-link', {
        body: { 
          valuationId,
          sendEmail,
          lang: getPreferredLang()
        }
      });

      if (error) {
        throw error;
      }

      if (data?.success) {
        toast({
          title: "Simulador Enviado",
          description: sendEmail 
            ? "El enlace del simulador V4 ha sido enviado por email"
            : "Enlace del simulador V4 generado correctamente",
        });

        return {
          success: true,
          url: data.v4Url,
          token: data.token,
          emailSent: data.emailSent
        };
      } else {
        throw new Error(data?.error || 'Error desconocido');
      }

    } catch (error: any) {
      console.error('Error sending V4 link:', error);
      toast({
        title: "Error",
        description: error.message || "Error al enviar el simulador",
        variant: "destructive",
      });
      
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendV4Link,
    isLoading
  };
};