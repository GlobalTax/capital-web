import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Phone } from 'lucide-react';

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

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
        ip_address: null, // Will be set by the database
        user_agent: navigator.userAgent
      });

      if (error) throw error;

      toast({
        title: "¡Solicitud enviada con éxito!",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas para discutir la valoración de tu empresa.",
      });

      // Reset form
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
    <section id="contacto" className="py-20 bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Solicita una valoración gratuita y descubre el valor real de tu empresa
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Nuestros expertos analizarán tu empresa y te proporcionarán una valoración 
            detallada sin compromiso. El primer paso hacia la venta exitosa de tu negocio.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Form */}
          <Card className="bg-white text-gray-900 border-0 shadow-2xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center text-gray-900">
                Solicitar Valoración Gratuita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="full_name">Nombre y Apellidos *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => handleInputChange('full_name', e.target.value)}
                    placeholder="Tu nombre completo"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="company">Empresa *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Nombre de tu empresa"
                    required
                    className="mt-1"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="600 000 000"
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="revenue_range">Rango de Facturación *</Label>
                  <Select value={formData.revenue_range} onValueChange={(value) => handleInputChange('revenue_range', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecciona un rango" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<1M">Menos de 1M€</SelectItem>
                      <SelectItem value="1-5M">1M€ - 5M€</SelectItem>
                      <SelectItem value="5-10M">5M€ - 10M€</SelectItem>
                      <SelectItem value=">10M">Más de 10M€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="sector">Sector</Label>
                  <Input
                    id="sector"
                    value={formData.sector}
                    onChange={(e) => handleInputChange('sector', e.target.value)}
                    placeholder="Ej: Tecnología, Retail, Industrial..."
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="message">Mensaje (opcional)</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Cuéntanos más sobre tu empresa y objetivos..."
                    className="mt-1 h-24 resize-none"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
                >
                  {isSubmitting ? '📊 Enviando...' : '📊 Recibir Valoración Gratuita'}
                </Button>

                <p className="text-sm text-gray-500 text-center">
                  Al enviar este formulario, aceptas que nos pongamos en contacto contigo 
                  para discutir la venta de tu empresa de forma confidencial.
                </p>
              </form>
            </CardContent>
          </Card>

          {/* Alternative contact options */}
          <div className="space-y-8">
            <div className="bg-gray-800 rounded-2xl p-8">
              <h3 className="text-2xl font-bold mb-6">¿Prefieres hablar directamente?</h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-600 rounded-full p-3">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Llamada telefónica</h4>
                    <p className="text-gray-300">+34 620 27 35 52</p>
                    <p className="text-sm text-gray-400">L-V 9:00 - 18:00</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="bg-green-600 rounded-full p-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-lg">Agendar reunión</h4>
                    <p className="text-gray-300">Videollamada 30 min</p>
                    <Button 
                      variant="outline" 
                      className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      Agendar ahora
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Benefits of free valuation */}
            <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6">¿Qué incluye tu valoración gratuita?</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                  Análisis financiero detallado
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                  Comparación con múltiplos de mercado
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                  Identificación de puntos de mejora
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                  Estrategia de maximización de valor
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3" />
                  Timeline estimado de venta
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SellLeadsForm;