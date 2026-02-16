import React, { useState, useEffect } from 'react';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import { SEOHead } from '@/components/seo';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Shield, Download, CheckCircle, Building2, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFormSecurity } from '@/hooks/useFormSecurity';
import { useQuery } from '@tanstack/react-query';

const INVESTOR_TYPES = [
  { value: 'individual', label: 'Inversor particular' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'venture_capital', label: 'Venture Capital' },
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'corporate', label: 'Corporativo / Estratégico' },
  { value: 'search_fund', label: 'Search Fund' },
  { value: 'other', label: 'Otro' },
];

const INVESTMENT_RANGES = [
  { value: '<1M', label: 'Menos de 1M€' },
  { value: '1-5M', label: '1M€ - 5M€' },
  { value: '5-15M', label: '5M€ - 15M€' },
  { value: '15-50M', label: '15M€ - 50M€' },
  { value: '>50M', label: 'Más de 50M€' },
];

const LandingOpenDeals: React.FC = () => {
  const { getTrackingData } = useFormSecurity();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    investorType: '',
    investmentRange: '',
    language: 'es',
    gdprConsent: false,
  });

  // Fetch available languages
  const { data: availableLanguages = ['es'] } = useQuery({
    queryKey: ['rod-available-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('language')
        .eq('is_active', true)
        .eq('is_deleted', false);
      
      if (error) throw error;
      const languages = [...new Set(data?.map(d => d.language as 'es' | 'en') || [])];
      return languages.length > 0 ? languages : ['es'];
    },
  });

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Landing Open Deals Meta',
        page_location: window.location.href,
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.gdprConsent) {
      toast.error('Debes aceptar la política de privacidad');
      return;
    }

    setIsSubmitting(true);

    try {
      const trackingData = getTrackingData();
      
      // Call edge function to generate and send ROD
      const { data: result, error } = await supabase.functions.invoke('generate-rod-document', {
        body: {
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || undefined,
          company: formData.company.trim() || undefined,
          investor_type: formData.investorType || undefined,
          investment_range: formData.investmentRange || undefined,
          document_format: 'pdf',
          language: formData.language,
          gdpr_consent: formData.gdprConsent,
          page_origin: 'lp-open-deals-meta',
          ...trackingData,
        },
      });

      if (error) throw error;

      // Track conversion
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'form',
          event_label: 'open_deals_download_meta',
          value: 1,
        });
      }

      // Download the PDF
      if (result?.downloadUrl) {
        window.open(result.downloadUrl, '_blank');
      }

      setIsSubmitted(true);
      toast.success('¡Documento descargado correctamente!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al descargar el documento. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { value: '+50', label: 'empresas en venta' },
    { value: '12', label: 'sectores cubiertos' },
    { value: '1-100M€', label: 'rango de valoración' },
  ];

  if (isSubmitted) {
    return (
      <>
        <SEOHead
          title="Descarga Completada | Capittal"
          noindex={true}
        />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-normal text-slate-900 mb-4">
              ¡Descarga Completada!
            </h1>
            <p className="text-slate-600 mb-6">
              Hemos enviado la Relación de Open Deals a tu email. También puedes acceder directamente a nuestro marketplace para ver las oportunidades en detalle.
            </p>
            <div className="space-y-3">
              <Link to="/oportunidades" className="block">
                <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                  Ver Oportunidades Activas
                </Button>
              </Link>
              <Link to="/compra-empresas" className="block">
                <Button variant="outline" className="w-full">
                  Saber Más sobre Compra de Empresas
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEOHead
        title="Descargar Relación de Open Deals | Empresas en Venta | Capittal"
        description="Descarga gratis la relación de empresas en venta con mandato directo. +50 oportunidades de inversión en diversos sectores."
        canonical="https://capittal.es/lp/open-deals"
        noindex={true}
      />

      <LandingHeaderMinimal />

      {/* Hero Section */}
      <section className="min-h-screen bg-white pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* Left - Copy */}
            <div className="space-y-8">
              <div>
                <span className="inline-block px-4 py-2 bg-slate-900/5 text-slate-700 text-sm font-medium rounded-full mb-6">
                  Documento Exclusivo
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-slate-900 mb-6 leading-tight">
                  Relación de<br />
                  <span className="text-slate-700">Open Deals</span>
                </h1>
                <p className="text-xl text-slate-600 leading-relaxed">
                  Descarga la lista completa de empresas en venta con mandato directo. Información exclusiva para inversores cualificados.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-8 border-y border-slate-200">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl md:text-3xl font-bold text-slate-900">{stat.value}</div>
                    <div className="text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* What's included */}
              <div className="space-y-4">
                <h3 className="font-medium text-slate-900">Qué incluye el documento:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Descripción de cada empresa</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Sector y ubicación</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Rango de facturación</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Rango de valoración</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Tipo de operación</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Estado del proceso</span>
                  </div>
                </div>
              </div>

              {/* Preview Image */}
              <div className="relative">
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center gap-4 mb-4">
                    <FileText className="w-10 h-10 text-slate-700" />
                    <div>
                      <p className="font-medium text-slate-900">Open_Deals_Capittal.pdf</p>
                      <p className="text-sm text-slate-500">Actualizado mensualmente</p>
                    </div>
                  </div>
                  <div className="space-y-2 blur-sm">
                    <div className="h-3 bg-slate-300 rounded w-full"></div>
                    <div className="h-3 bg-slate-300 rounded w-4/5"></div>
                    <div className="h-3 bg-slate-300 rounded w-3/4"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200">
              <div className="mb-6">
                <h2 className="text-2xl font-medium text-slate-900 mb-2">
                  Descarga Gratuita
                </h2>
                <p className="text-slate-600">
                  Completa el formulario para recibir el documento
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="fullName" className="text-slate-700">Nombre completo *</Label>
                  <Input
                    id="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className="bg-white border-slate-200 text-slate-900"
                    placeholder="Tu nombre"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-slate-700">Email corporativo *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="bg-white border-slate-200 text-slate-900"
                    placeholder="tu@empresa.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone" className="text-slate-700">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-white border-slate-200 text-slate-900"
                      placeholder="+34 600..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="company" className="text-slate-700">Empresa / Fondo</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-white border-slate-200 text-slate-900"
                      placeholder="Nombre"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-700">Tipo de inversor</Label>
                    <Select
                      value={formData.investorType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, investorType: value }))}
                    >
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTOR_TYPES.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-slate-700">Ticket inversión</Label>
                    <Select
                      value={formData.investmentRange}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, investmentRange: value }))}
                    >
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue placeholder="Selecciona..." />
                      </SelectTrigger>
                      <SelectContent>
                        {INVESTMENT_RANGES.map((range) => (
                          <SelectItem key={range.value} value={range.value}>
                            {range.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {availableLanguages.length > 1 && (
                  <div>
                    <Label className="text-slate-700">Idioma del documento</Label>
                    <Select
                      value={formData.language}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}
                    >
                      <SelectTrigger className="bg-white border-slate-200 text-slate-900">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.includes('es') && (
                          <SelectItem value="es">🇪🇸 Español</SelectItem>
                        )}
                        {availableLanguages.includes('en') && (
                          <SelectItem value="en">🇬🇧 English</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="gdprConsent"
                    checked={formData.gdprConsent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprConsent: checked as boolean }))}
                    className="mt-1"
                  />
                  <Label htmlFor="gdprConsent" className="text-sm text-slate-600 cursor-pointer">
                    Acepto la{' '}
                    <Link to="/politica-privacidad" className="text-slate-900 underline">
                      política de privacidad
                    </Link>{' '}
                    y el tratamiento de mis datos.
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-6 text-lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Generando...' : 'Descargar PDF Gratuito'}
                </Button>

                <p className="text-xs text-center text-slate-500">
                  <Shield className="w-3 h-3 inline mr-1" />
                  Información confidencial protegida
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <Building2 className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Mandato Directo</h3>
              <p className="text-slate-400 text-sm">Empresas que nos han contratado para su venta</p>
            </div>
            <div>
              <Users className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">Para Inversores</h3>
              <p className="text-slate-400 text-sm">Información cualificada y verificada</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-slate-400 mx-auto mb-3" />
              <h3 className="text-white font-medium mb-1">100% Confidencial</h3>
              <p className="text-slate-400 text-sm">Datos protegidos bajo NDA</p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooterMinimal />
    </>
  );
};

export default LandingOpenDeals;
