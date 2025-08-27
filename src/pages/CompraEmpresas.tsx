
import React, { useState } from 'react';
import { HomeLayout } from '@/shared';
import CompaniesForSale from '@/components/CompaniesForSale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useContactForm } from '@/hooks/useContactForm';
import { useToast } from '@/hooks/use-toast';
import { Search, Target, Users, Award, TrendingUp, Shield, CheckCircle, Building, Euro, Calendar } from 'lucide-react';

const CompraEmpresas = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    email: '',
    phone: '',
    investmentRange: '',
    preferredSectors: '',
    acquisitionType: '',
    timeline: '',
    message: ''
  });

  const { submitContactForm, isSubmitting } = useContactForm();
  const { toast } = useToast();

  const benefits = [
    {
      icon: Search,
      title: 'Identificación de Oportunidades',
      description: 'Acceso exclusivo a empresas en venta que no están en el mercado público'
    },
    {
      icon: Target,
      title: 'Due Diligence Completa',
      description: 'Análisis exhaustivo financiero, legal y operacional antes de la compra'
    },
    {
      icon: Users,
      title: 'Negociación Experta',
      description: 'Representación profesional para obtener las mejores condiciones de compra'
    },
    {
      icon: Award,
      title: 'Integración Post-Compra',
      description: 'Asesoramiento en la integración y optimización de la empresa adquirida'
    }
  ];

  const successStories = [
    {
      title: 'Adquisición en Sector Tecnológico',
      sector: 'Software',
      value: '12M€',
      description: 'Adquisición exitosa de empresa SaaS con integración completa en 6 meses',
      highlights: ['ROI 25% primer año', 'Retención 95% empleados', 'Crecimiento 40% post-adquisición']
    },
    {
      title: 'Consolidación Industrial',
      sector: 'Manufactura',
      value: '8.5M€',
      description: 'Fusión estratégica que generó sinergias operativas inmediatas',
      highlights: ['Reducción costes 15%', 'Expansión 3 mercados', 'Mejora márgenes 20%']
    },
    {
      title: 'Entrada Mercado Internacional',
      sector: 'Servicios',
      value: '5.2M€',
      description: 'Adquisición que facilitó la expansión internacional del cliente',
      highlights: ['Acceso 5 países', 'Crecimiento 60%', 'Nuevos canales distribución']
    }
  ];

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitContactForm({
        fullName: formData.fullName,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        referral: `Compra de Empresas - ${formData.acquisitionType}`,
        companySize: formData.investmentRange
      });

      setFormData({
        fullName: '',
        company: '',
        email: '',
        phone: '',
        investmentRange: '',
        preferredSectors: '',
        acquisitionType: '',
        timeline: '',
        message: ''
      });

      toast({
        title: "Solicitud enviada",
        description: "Te contactaremos en 24h para discutir tu estrategia de adquisición.",
      });
    } catch (error) {
      // Error handled by useContactForm
    }
  };

  return (
    <HomeLayout>
      {/* Hero Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              Adquisiciones Estratégicas
            </h1>
            <p className="text-xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
              Identificamos, evaluamos y ejecutamos adquisiciones que impulsan el crecimiento de tu empresa. 
              Acceso exclusivo a oportunidades fuera del mercado público con asesoramiento integral.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                Ver Oportunidades Actuales
              </Button>
              <Button size="lg" variant="outline">
                Solicitar Consulta
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <CardContent className="p-6 text-center">
                    <div className="bg-primary text-primary-foreground rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-4">{benefit.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Companies for Sale Section */}
      <CompaniesForSale />

      {/* Success Stories Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Casos de Éxito Recientes
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Adquisiciones exitosas que han transformado el crecimiento de nuestros clientes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                      {story.sector}
                    </span>
                    <span className="text-2xl font-bold text-foreground">{story.value}</span>
                  </div>
                  <CardTitle className="text-xl">{story.title}</CardTitle>
                  <CardDescription>{story.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {story.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Proceso de Adquisición
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Metodología probada que minimiza riesgos y maximiza el valor de tu inversión
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Estrategia & Criterios</h3>
                <p className="text-muted-foreground">Definimos juntos tu estrategia de crecimiento y establecemos criterios específicos de búsqueda: sector, tamaño, ubicación y perfil financiero.</p>
              </CardContent>
            </Card>

            <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Identificación & Due Diligence</h3>
                <p className="text-muted-foreground">Búsqueda proactiva de oportunidades y análisis exhaustivo financiero, legal y operacional de los candidatos objetivo.</p>
              </CardContent>
            </Card>

            <Card className="text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <CardContent className="p-8">
                <div className="bg-primary text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-6">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">Negociación & Cierre</h3>
                <p className="text-muted-foreground">Negociación de términos óptimos, structuración de la transacción y acompañamiento hasta el cierre exitoso.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Solicitar Análisis de Oportunidades
              </h2>
              <p className="text-lg text-muted-foreground">
                Cuéntanos tu estrategia de crecimiento y te presentaremos oportunidades exclusivas
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Nombre Completo *
                      </label>
                      <Input
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        required
                        placeholder="Tu nombre completo"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Empresa *
                      </label>
                      <Input
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        required
                        placeholder="Nombre de tu empresa"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email *
                      </label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                        placeholder="tu@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Teléfono
                      </label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="600 000 000"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Rango de Inversión
                      </label>
                      <Select onValueChange={(value) => handleInputChange('investmentRange', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona rango" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-5M">1M€ - 5M€</SelectItem>
                          <SelectItem value="5-15M">5M€ - 15M€</SelectItem>
                          <SelectItem value="15-50M">15M€ - 50M€</SelectItem>
                          <SelectItem value="50M+">50M€+</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Tipo de Adquisición
                      </label>
                      <Select onValueChange={(value) => handleInputChange('acquisitionType', value)}>
                        <SelectTrigger>
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Sectores de Interés
                    </label>
                    <Input
                      value={formData.preferredSectors}
                      onChange={(e) => handleInputChange('preferredSectors', e.target.value)}
                      placeholder="Ej: Tecnología, Industrial, Servicios..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Timeline Objetivo
                    </label>
                    <Select onValueChange={(value) => handleInputChange('timeline', value)}>
                      <SelectTrigger>
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
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Detalles Adicionales
                    </label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      placeholder="Cuéntanos más sobre tu estrategia de crecimiento y objetivos específicos..."
                      rows={4}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Enviando...' : 'Solicitar Análisis de Oportunidades'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

    </HomeLayout>
  );
};

export default CompraEmpresas;
