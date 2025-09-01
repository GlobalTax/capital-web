import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface FormData {
  full_name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
}

const SellLeadsForm = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const urlParams = new URLSearchParams(window.location.search);
      
      const { data, error } = await supabase.from('sell_leads').insert({
        full_name: formData.full_name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        revenue_range: null,
        sector: null,
        message: formData.message,
        page_origin: 'venta-empresas',
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content'),
        referrer: document.referrer,
        ip_address: null,
        user_agent: navigator.userAgent
      }).select().single();

      if (error) {
        console.error('Error submitting sell leads form:', error);
        
        if (error.message?.includes('rate limit') || error.message?.includes('check_rate_limit_enhanced')) {
          toast({
            title: "Límite de envíos alcanzado",
            description: "Has alcanzado el máximo de envíos permitidos. Por favor, espera antes de intentar de nuevo.",
            variant: "destructive",
          });
          return;
        }
        
        throw error;
      }

      toast({
        title: "¡Mensaje enviado con éxito!",
        description: "Hemos recibido tu consulta sobre venta de empresa. Nos pondremos en contacto contigo en las próximas 24 horas.",
      });

      setFormData({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        message: ''
      });

    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error al enviar",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo o contacta directamente con nosotros.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contacto" className="py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-6">
            <span className="text-primary">Contacta</span> con Nosotros
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ¿Tienes una empresa que quieres vender? Cuéntanos tu situación 
            y te ayudaremos con asesoramiento profesional y confidencial.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left Content */}
          <div>
            {/* Benefits */}
            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground">Respuesta Rápida</h3>
                  <p className="text-muted-foreground text-sm">Te contestamos en menos de 24 horas para analizar tu consulta</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground">100% Confidencial</h3>
                  <p className="text-muted-foreground text-sm">Tu información está protegida por acuerdos de confidencialidad</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground">Asesoramiento Experto</h3>
                  <p className="text-muted-foreground text-sm">Más de 15 años de experiencia en M&A y venta de empresas</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">¿Prefieres hablar directamente?</h3>
              <div className="space-y-3">
                <a href="tel:+34912345678" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                  <span className="mr-2">📞</span>
                  +34 912 345 678
                </a>
                <a href="mailto:info@capittal.es" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                  <span className="mr-2">✉️</span>
                  info@capittal.es
                </a>
                <a href="#" className="flex items-center text-primary hover:text-primary/80 transition-colors">
                  <span className="mr-2">📅</span>
                  Agendar Reunión
                </a>
              </div>
            </div>
          </div>

          {/* Right Form */}
          <Card className="bg-card border border-border shadow-lg">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Tu nombre y apellidos"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Empresa *
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    placeholder="Cuéntanos sobre tu empresa, sector, facturación aproximada y qué te gustaría saber sobre la venta..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default SellLeadsForm;