
import React, { useState } from 'react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Link } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useLeadMagnetDownloads } from '@/hooks/useLeadMagnets';
import { Download } from 'lucide-react';

const PlanificacionFiscalCTA = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    company: '',
    email: '',
    phone: '',
    sector: '',
    operation_value: '',
    message: ''
  });

  // Estados para el modal de descarga de guía
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadSubmitting, setIsDownloadSubmitting] = useState(false);
  const [downloadFormData, setDownloadFormData] = useState({
    user_name: '',
    user_email: ''
  });

  const { recordDownload } = useLeadMagnetDownloads();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Frontend validation
    const trimmedName = formData.full_name.trim();
    const trimmedCompany = formData.company.trim();
    const trimmedEmail = formData.email.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast({
        title: "Error de validación",
        description: "El nombre debe tener entre 2 y 100 caracteres.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (trimmedCompany.length < 2 || trimmedCompany.length > 100) {
      toast({
        title: "Error de validación", 
        description: "El nombre de la empresa debe tener entre 2 y 100 caracteres.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    if (trimmedEmail.length > 254) {
      toast({
        title: "Error de validación",
        description: "El email no puede superar los 254 caracteres.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const insertData = {
        full_name: trimmedName,
        company: trimmedCompany,
        email: trimmedEmail,
        phone: formData.phone.trim() || null,
        sector: formData.sector || null,
        consultation_type: 'planificacion_fiscal',
        message: `Operación valor: ${formData.operation_value}. ${formData.message}`.trim() || null,
        ip_address: null, // Will be set by database trigger
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign')
      };

      const { error } = await supabase
        .from('legal_leads')
        .insert([insertData]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas.",
      });

      setFormData({
        full_name: '',
        company: '',
        email: '',
        phone: '',
        sector: '',
        operation_value: '',
        message: ''
      });
      setIsFormOpen(false);

    } catch (error: any) {
      console.error('Error al enviar formulario:', error);
      
      // More specific error messages
      let errorMessage = "Por favor, inténtalo de nuevo o contacta directamente.";
      
      if (error?.message?.includes('rate_limit')) {
        errorMessage = "Has enviado demasiadas solicitudes. Espera un momento antes de volver a intentarlo.";
      } else if (error?.message?.includes('email')) {
        errorMessage = "Por favor, verifica que el email sea válido.";
      } else if (error?.message?.includes('full_name') || error?.message?.includes('company')) {
        errorMessage = "Por favor, verifica que el nombre y empresa tengan entre 2 y 100 caracteres.";
      }

      toast({
        title: "Error al enviar solicitud",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadGuide = () => {
    setIsDownloadModalOpen(true);
  };

  const handleDownloadInputChange = (field: string, value: string) => {
    setDownloadFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDownloadFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDownloadSubmitting(true);

    // Frontend validation
    const trimmedName = downloadFormData.user_name.trim();
    const trimmedEmail = downloadFormData.user_email.trim();

    if (trimmedName.length < 2 || trimmedName.length > 100) {
      toast({
        title: "Error de validación",
        description: "El nombre debe tener entre 2 y 100 caracteres.",
        variant: "destructive",
      });
      setIsDownloadSubmitting(false);
      return;
    }

    if (trimmedEmail.length > 254 || !trimmedEmail.includes('@')) {
      toast({
        title: "Error de validación",
        description: "Por favor, introduce un email válido.",
        variant: "destructive",
      });
      setIsDownloadSubmitting(false);
      return;
    }

    try {
      // Registrar el lead usando el hook existente
      await recordDownload('guia-planificacion-fiscal', {
        user_name: trimmedName,
        user_email: trimmedEmail
      });

      toast({
        title: "¡Solicitud enviada exitosamente!",
        description: "Te enviaremos la guía fiscal por email en las próximas horas.",
      });

      // Reset form and close modal
      setDownloadFormData({
        user_name: '',
        user_email: ''
      });
      setIsDownloadModalOpen(false);

    } catch (error: any) {
      console.error('Error al procesar descarga:', error);
      
      let errorMessage = "Error al procesar la solicitud. Por favor, inténtalo de nuevo.";
      
      if (error?.message?.includes('rate_limit')) {
        errorMessage = "Has enviado demasiadas solicitudes. Espera un momento antes de volver a intentarlo.";
      } else if (error?.message?.includes('email')) {
        errorMessage = "Por favor, verifica que el email sea válido.";
      }

      toast({
        title: "Error al procesar solicitud",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsDownloadSubmitting(false);
    }
  };

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              No pagues más impuestos de los necesarios. Nuestras estrategias fiscales 
              pueden ahorrarte cientos de miles de euros en tu próxima operación.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">€180M</div>
              <div className="text-gray-400 text-sm">Ahorro Generado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">23%</div>
              <div className="text-gray-400 text-sm">Ahorro Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">200+</div>
              <div className="text-gray-400 text-sm">Operaciones</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-2">100%</div>
              <div className="text-gray-400 text-sm">Legal</div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <InteractiveHoverButton
                    text="Diagnóstico Fiscal Gratuito"
                    variant="secondary"
                    size="lg"
                    className="bg-white text-black border-white hover:shadow-2xl text-lg px-12 py-4"
                  />
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Solicitar Diagnóstico Fiscal Gratuito</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Nombre completo *</Label>
                        <Input 
                          id="full_name"
                          value={formData.full_name}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Empresa *</Label>
                        <Input 
                          id="company"
                          value={formData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          required 
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input 
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          required 
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input 
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sector">Sector</Label>
                        <Select value={formData.sector} onValueChange={(value) => handleInputChange('sector', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar sector" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="industrial">Industrial y Manufacturero</SelectItem>
                            <SelectItem value="construccion">Construcción</SelectItem>
                            <SelectItem value="retail">Retail y Consumo</SelectItem>
                            <SelectItem value="alimentacion">Alimentación y Bebidas</SelectItem>
                            <SelectItem value="servicios">Servicios B2B</SelectItem>
                            <SelectItem value="automocion">Automoción</SelectItem>
                            <SelectItem value="logistica">Logística y Transporte</SelectItem>
                            <SelectItem value="tecnologia">Tecnología</SelectItem>
                            <SelectItem value="otro">Otro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="operation_value">Importe aproximado</Label>
                        <Select value={formData.operation_value} onValueChange={(value) => handleInputChange('operation_value', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar rango" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0-1M">Menos de €1M</SelectItem>
                            <SelectItem value="1-5M">€1M - €5M</SelectItem>
                            <SelectItem value="5-10M">€5M - €10M</SelectItem>
                            <SelectItem value="10-25M">€10M - €25M</SelectItem>
                            <SelectItem value="25M+">Más de €25M</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="message">Mensaje adicional</Label>
                      <Textarea 
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Cuéntanos sobre tu operación o consulta específica..."
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={isSubmitting} className="flex-1">
                        {isSubmitting ? 'Enviando...' : 'Solicitar Diagnóstico Gratuito'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Dialog open={isDownloadModalOpen} onOpenChange={setIsDownloadModalOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="lg"
                    className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-12 py-4"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Solicitar Guía Fiscal
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[400px]">
                  <DialogHeader>
                    <DialogTitle>Solicitar Guía Fiscal</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleDownloadFormSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="download_name">Nombre completo *</Label>
                      <Input 
                        id="download_name"
                        value={downloadFormData.user_name}
                        onChange={(e) => handleDownloadInputChange('user_name', e.target.value)}
                        required 
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="download_email">Email *</Label>
                      <Input 
                        id="download_email"
                        type="email"
                        value={downloadFormData.user_email}
                        onChange={(e) => handleDownloadInputChange('user_email', e.target.value)}
                        required 
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={isDownloadSubmitting} className="flex-1">
                        {isDownloadSubmitting ? 'Procesando...' : 'Solicitar Guía'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setIsDownloadModalOpen(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-700">
            <p className="text-gray-400 mb-4">
              ¿Tienes una operación en marcha? Contacta con nuestros especialistas fiscales
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <a 
                href="tel:620273552"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>📞 620 273 552</span>
              </a>
              <a 
                href="mailto:samuel@capittal.es"
                className="flex items-center space-x-2 text-white hover:text-gray-300 transition-colors duration-300"
              >
                <span>✉️ samuel@capittal.es</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PlanificacionFiscalCTA;
