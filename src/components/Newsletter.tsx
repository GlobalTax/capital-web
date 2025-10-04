import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Check } from 'lucide-react';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor, introduce tu email.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get UTM and referrer data
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source') || undefined;
      const utm_medium = urlParams.get('utm_medium') || undefined;
      const utm_campaign = urlParams.get('utm_campaign') || undefined;
      const referrer = document.referrer || undefined;

      // Get IP address
      const ipResponse = await fetch('https://api.ipify.org?format=json').catch(() => null);
      const ipData = ipResponse ? await ipResponse.json() : null;

      // Guardar suscripción en newsletter_subscribers
      const { error } = await supabase.from('newsletter_subscribers').insert({
        email: email,
        source: 'website'
      });

      if (error) throw error;

      setIsSubscribed(true);
      setEmail('');
      
      toast({
        title: "¡Suscripción exitosa!",
        description: "Te has suscrito correctamente a nuestro newsletter.",
      });
    } catch (error) {
      console.error('Error al suscribirse:', error);
      toast({
        title: "Error",
        description: "Error al procesar la suscripción. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubscribed) {
    return (
      <div className="bg-muted/30 p-6 rounded-lg border border-border">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
            <Check className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-xl font-semibold text-center text-foreground mb-2">
          ¡Bienvenido a nuestra comunidad!
        </h3>
        <p className="text-center text-muted-foreground">
          Recibirás insights exclusivos sobre M&A y valoración empresarial.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 p-6 rounded-lg border border-border">
      <div className="flex items-center justify-center mb-4">
        <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
          <Mail className="w-6 h-6" />
        </div>
      </div>
      
      <h3 className="text-xl font-semibold text-center text-foreground mb-2">
        Insights M&A Exclusivos
      </h3>
      
      <p className="text-center text-muted-foreground mb-6">
        Recibe análisis de mercado, tendencias de valoración y oportunidades de inversión directamente en tu bandeja de entrada.
      </p>
      
      <form onSubmit={handleSubscribe} className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
            disabled={isLoading}
          />
          <Button 
            type="submit" 
            disabled={isLoading || !email}
            className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap"
          >
            {isLoading ? 'Suscribiendo...' : 'Suscribirse'}
          </Button>
        </div>
      </form>
      
      <p className="text-xs text-muted-foreground text-center mt-3">
        Sin spam. Cancela cuando quieras. Lee nuestra política de privacidad.
      </p>
    </div>
  );
};

export default Newsletter;