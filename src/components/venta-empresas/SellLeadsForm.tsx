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
  revenue_range: string;
  sector: string;
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
    revenue_range: '',
    sector: '',
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
      const { error } = await supabase.from('sell_leads').insert({
        full_name: formData.full_name,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        revenue_range: formData.revenue_range,
        sector: formData.sector,
        message: formData.message,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
        utm_term: new URLSearchParams(window.location.search).get('utm_term'),
        utm_content: new URLSearchParams(window.location.search).get('utm_content'),
        referrer: document.referrer,
        ip_address: null,
        user_agent: navigator.userAgent
      });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada con éxito!",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas para discutir la valoración de tu empresa.",
      });

      setFormData({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        revenue_range: '',
        sector: '',
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
            Solicita tu Valoración <span className="text-primary">Gratuita</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Obtén una valoración profesional de tu empresa sin compromiso. 
            Nuestros expertos analizarán tu caso de forma confidencial.
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
                  <h3 className="font-semibold text-foreground">Análisis Personalizado</h3>
                  <p className="text-muted-foreground text-sm">Valoración detallada basada en tu sector y situación específica</p>
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
                  <h3 className="font-semibold text-foreground">Sin Compromiso</h3>
                  <p className="text-muted-foreground text-sm">Valoración gratuita sin obligaciones ni costes ocultos</p>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Facturación anual *
                    </label>
                    <select
                      name="revenue_range"
                      value={formData.revenue_range}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value="">Selecciona un rango</option>
                      <option value="< 1M">Menos de €1M</option>
                      <option value="1M - 5M">€1M - €5M</option>
                      <option value="5M - 10M">€5M - €10M</option>
                      <option value="10M - 25M">€10M - €25M</option>
                      <option value="25M - 50M">€25M - €50M</option>
                      <option value="> 50M">Más de €50M</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sector *
                    </label>
                    <select
                      name="sector"
                      value={formData.sector}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                    >
                      <option value="">Selecciona un sector</option>
                      <option value="Industrial y Manufacturero">Industrial y Manufacturero</option>
                      <option value="Retail y Consumo">Retail y Consumo</option>
                      <option value="Construcción">Construcción</option>
                      <option value="Alimentación y Bebidas">Alimentación y Bebidas</option>
                      <option value="Automoción">Automoción</option>
                      <option value="Logística y Transporte">Logística y Transporte</option>
                      <option value="Servicios">Servicios</option>
                      <option value="Tecnología">Tecnología</option>
                      <option value="Otros">Otros</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Mensaje adicional
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
                    placeholder="Cuéntanos más sobre tu empresa y tus objetivos..."
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Valoración Gratuita'}
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