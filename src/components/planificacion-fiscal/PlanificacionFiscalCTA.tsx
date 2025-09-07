
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
        .insert({
          full_name: formData.full_name,
          company: formData.company,
          email: formData.email,
          phone: formData.phone,
          sector: formData.sector,
          consultation_type: 'planificacion_fiscal',
          message: `Operación valor: ${formData.operation_value}. ${formData.message}`.trim(),
          lead_source: 'planificacion_fiscal_page',
          status: 'nuevo'
        });

      if (error) throw error;

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

    } catch (error) {
      console.error('Error al enviar formulario:', error);
      toast({
        title: "Error al enviar solicitud",
        description: "Por favor, inténtalo de nuevo o contacta directamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadGuide = () => {
    const link = document.createElement('a');
    link.href = '/docs/guia-planificacion-fiscal.pdf';
    link.download = 'Guia-Planificacion-Fiscal-Capittal.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Descarga iniciada",
      description: "La guía fiscal se está descargando.",
    });
  };

  return (
    <section className="py-20 bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Optimiza tu Fiscalidad y Maximiza el Valor de tu Operación
            </h2>
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

              <Button
                onClick={handleDownloadGuide}
                variant="outline"
                size="lg"
                className="bg-transparent border-white text-white hover:bg-white hover:text-black text-lg px-12 py-4"
              >
                <Download className="w-5 h-5 mr-2" />
                Descargar Guía Fiscal
              </Button>
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
