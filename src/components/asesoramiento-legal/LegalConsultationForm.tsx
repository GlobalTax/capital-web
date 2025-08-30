import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useSimpleFormTracking } from '@/hooks/useSimpleFormTracking';
import { Phone, Download } from 'lucide-react';

const LegalConsultationForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    sector: '',
    consultation_type: '',
    company_size: '',
    transaction_stage: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { trackFormSubmission } = useSimpleFormTracking();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('legal_leads')
        .insert([{
          ...formData,
          ip_address: '0.0.0.0', // Will be set by database
          user_agent: navigator.userAgent,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          referrer: document.referrer
        }]);

      if (error) throw error;

      trackFormSubmission('legal_consultation', formData);
      
      toast({
        title: "Consulta Legal Enviada",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas.",
      });

      // Reset form
      setFormData({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        sector: '',
        consultation_type: '',
        company_size: '',
        transaction_stage: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Ha ocurrido un error. Por favor, inténtalo de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Recibe una Consulta Legal Gratuita
          </h2>
          <p className="text-xl text-muted-foreground">
            Protege tu operación desde el primer día con nuestros expertos legales
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Solicitar Consulta Gratuita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nombre Completo *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Empresa *</Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      required
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+34 600 000 000"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sector">Sector</Label>
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => handleInputChange('sector', e.target.value)}
                      placeholder="Ej: Tecnología, Retail..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consultation_type">Tipo de Consulta</Label>
                    <Select value={formData.consultation_type} onValueChange={(value) => handleInputChange('consultation_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due_diligence">Due Diligence Legal</SelectItem>
                        <SelectItem value="documentacion">Documentación M&A</SelectItem>
                        <SelectItem value="derecho_societario">Derecho Societario</SelectItem>
                        <SelectItem value="compliance">Compliance</SelectItem>
                        <SelectItem value="negociacion">Negociación Contractual</SelectItem>
                        <SelectItem value="general">Consulta General</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="company_size">Tamaño de Empresa</Label>
                    <Select value={formData.company_size} onValueChange={(value) => handleInputChange('company_size', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el tamaño" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="startup">Startup (1-10 empleados)</SelectItem>
                        <SelectItem value="pyme">PYME (11-50 empleados)</SelectItem>
                        <SelectItem value="mediana">Mediana (51-250 empleados)</SelectItem>
                        <SelectItem value="grande">Grande (250+ empleados)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="transaction_stage">Etapa de Transacción</Label>
                    <Select value={formData.transaction_stage} onValueChange={(value) => handleInputChange('transaction_stage', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona la etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="exploracion">Exploración inicial</SelectItem>
                        <SelectItem value="negociacion">En negociación</SelectItem>
                        <SelectItem value="due_diligence">Due diligence</SelectItem>
                        <SelectItem value="documentacion">Documentación</SelectItem>
                        <SelectItem value="cierre">Próximo al cierre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensaje</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Cuéntanos sobre tu situación legal..."
                    rows={4}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Obtener Consulta Legal Gratuita'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Alternative Contact & Download */}
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Descargar Pack Legal M&A
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Descarga nuestro pack completo con plantillas legales para M&A:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Plantilla de Letter of Intent (LOI)</li>
                  <li>• Checklist de Due Diligence Legal</li>
                  <li>• Matriz de Riesgos Legales</li>
                  <li>• Guía de Documentación M&A</li>
                </ul>
                <Button variant="outline" className="w-full">
                  Descargar Pack Legal Gratuito
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contacto Directo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-foreground">Llamada Directa</p>
                  <p className="text-muted-foreground">+34 91 000 0000</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Especializado</p>
                  <p className="text-muted-foreground">legal@capittal.es</p>
                </div>
                <div>
                  <p className="font-medium text-foreground">Horario de Atención</p>
                  <p className="text-muted-foreground">Lun - Vie: 9:00 - 18:00</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegalConsultationForm;