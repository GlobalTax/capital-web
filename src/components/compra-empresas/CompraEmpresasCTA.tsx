import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { useCompraEmpresasForm, type CompraEmpresasFormData } from '@/hooks/useCompraEmpresasForm';

const CompraEmpresasCTA = () => {
  const [formData, setFormData] = useState<CompraEmpresasFormData>({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    investmentBudget: undefined,
    sectorsOfInterest: '',
    acquisitionType: '',
    targetTimeline: '',
    preferredLocation: '',
    message: ''
  });

  const { submitInquiry, isSubmitting } = useCompraEmpresasForm();

  const handleInputChange = (name: keyof CompraEmpresasFormData, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof CompraEmpresasFormData, value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      [name]: value === '' ? undefined : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitInquiry(formData);
    
    if (result.success) {
      // Reset form on success
      setFormData({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        investmentBudget: undefined,
        sectorsOfInterest: '',
        acquisitionType: '',
        targetTimeline: '',
        preferredLocation: '',
        message: ''
      });
    }
  };

  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-normal mb-6">
              Solicitar Análisis de Oportunidades
            </h2>
            <p className="text-lg text-blue-100">
              Cuéntanos tu estrategia de crecimiento y te presentaremos oportunidades exclusivas
            </p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Nombre Completo *
                    </label>
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      required
                      placeholder="Tu nombre completo"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Empresa *
                    </label>
                    <Input
                      value={formData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      required
                      placeholder="Nombre de tu empresa"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Email *
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      required
                      placeholder="tu@email.com"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Teléfono
                    </label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="600 000 000"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Rango de Inversión
                    </label>
                    <Select onValueChange={(value) => handleSelectChange('investmentBudget', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Selecciona rango" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="menos-500k">Menos de 500k€</SelectItem>
                        <SelectItem value="500k-1m">500k€ - 1M€</SelectItem>
                        <SelectItem value="1m-5m">1M€ - 5M€</SelectItem>
                        <SelectItem value="5m-10m">5M€ - 10M€</SelectItem>
                        <SelectItem value="mas-10m">Más de 10M€</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Tipo de Adquisición
                    </label>
                    <Select onValueChange={(value) => handleInputChange('acquisitionType', value)}>
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder="Selecciona tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="strategic">Adquisición Estratégica</SelectItem>
                        <SelectItem value="financial">Inversión Financiera</SelectItem>
                        <SelectItem value="consolidation">Consolidación Sectorial</SelectItem>
                        <SelectItem value="international">Expansión Internacional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Sectores de Interés
                  </label>
                  <Input
                    value={formData.sectorsOfInterest}
                    onChange={(e) => handleInputChange('sectorsOfInterest', e.target.value)}
                    placeholder="Ej: Tecnología, Industrial, Servicios..."
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Timeline Objetivo
                  </label>
                  <Select onValueChange={(value) => handleSelectChange('targetTimeline', value)}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue placeholder="¿Cuándo quieres completar la adquisición?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">Próximos 3 meses</SelectItem>
                      <SelectItem value="6months">Próximos 6 meses</SelectItem>
                      <SelectItem value="12months">Próximos 12 meses</SelectItem>
                      <SelectItem value="flexible">Timeline flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Detalles Adicionales
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    placeholder="Cuéntanos más sobre tu estrategia de crecimiento y objetivos específicos..."
                    rows={4}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full bg-white text-slate-900 hover:bg-gray-100"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Análisis de Oportunidades'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <div className="text-center mt-8">
            <p className="text-blue-100 mb-4">¿Prefieres hablar directamente con nuestros expertos?</p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a href="tel:+34695717490" className="text-white hover:text-blue-200 font-medium">
                📞 +34 695 717 490
              </a>
              <a href="mailto:adquisiciones@capittal.es" className="text-white hover:text-blue-200 font-medium">
                ✉️ adquisiciones@capittal.es
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompraEmpresasCTA;