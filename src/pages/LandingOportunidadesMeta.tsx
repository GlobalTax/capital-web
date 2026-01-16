import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import LandingHeaderMinimal from '@/components/landing/LandingHeaderMinimal';
import LandingFooterMinimal from '@/components/landing/LandingFooterMinimal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, Building2, TrendingUp, CheckCircle, ArrowRight, MapPin, Euro } from 'lucide-react';
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

interface Operation {
  id: string;
  title: string;
  sector: string;
  location: string;
  company_size: string;
  valuation_range: string;
  deal_type: string;
  project_status: string;
}

const LandingOportunidadesMeta: React.FC = () => {
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
    gdprConsent: false,
  });

  // Fetch featured operations
  const { data: operations = [] } = useQuery({
    queryKey: ['featured-operations-meta'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('list-operations', {
        body: {
          locale: 'es',
          limit: 6,
          displayLocation: 'operaciones',
          sortBy: 'created_at',
        }
      });
      
      if (error) throw error;
      return data?.operations || [];
    },
  });

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Landing Oportunidades Meta',
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
      const trackingData = await getTrackingData();
      
      const insertData = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        company: formData.company.trim() || null,
        investment_range: formData.investmentRange || null,
        acquisition_type: formData.investorType || null,
        page_origin: 'lp-oportunidades-meta',
        status: 'new',
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_content: trackingData.utm_content,
        referrer: trackingData.referrer,
        user_agent: trackingData.user_agent,
        ip_address: trackingData.ip_address,
      };

      const { error } = await supabase
        .from('company_acquisition_inquiries')
        .insert([insertData]);

      if (error) throw error;

      // Track conversion
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'generate_lead', {
          event_category: 'form',
          event_label: 'oportunidades_meta',
          value: 1,
        });
      }

      setIsSubmitted(true);
      toast.success('¡Solicitud enviada correctamente!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error al enviar el formulario. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Gracias | Capittal</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-normal text-slate-900 mb-4">
              ¡Gracias por tu interés!
            </h1>
            <p className="text-slate-600 mb-8">
              Nuestro equipo revisará tu perfil y te contactará con oportunidades que encajen con tus criterios de inversión.
            </p>
            <Link to="/oportunidades">
              <Button className="bg-slate-900 hover:bg-slate-800 text-white">
                Ver Todas las Oportunidades
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Empresas en Venta | Oportunidades de Inversión | Capittal</title>
        <meta name="description" content="Descubre empresas en venta con mandato directo. Oportunidades de inversión exclusivas en diversos sectores. Accede al marketplace M&A." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://capittal.es/lp/oportunidades-meta" />
      </Helmet>

      <LandingHeaderMinimal />

      {/* Hero Section */}
      <section className="bg-white pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="inline-block px-4 py-2 bg-slate-900/5 text-slate-700 text-sm font-medium rounded-full mb-6">
              Marketplace M&A
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-slate-900 mb-6 leading-tight">
              Empresas en Venta<br />
              <span className="text-slate-600">con Mandato Directo</span>
            </h1>
            <p className="text-xl text-slate-600">
              Accede a oportunidades de inversión exclusivas. Empresas que nos han contratado directamente para su venta.
            </p>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mb-16">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">+50</div>
              <div className="text-sm text-slate-500">empresas activas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">12</div>
              <div className="text-sm text-slate-500">sectores</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">1-100M€</div>
              <div className="text-sm text-slate-500">valoración</div>
            </div>
          </div>
        </div>
      </section>

      {/* Operations Grid */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-medium text-slate-900 mb-8 text-center">
            Oportunidades Destacadas
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {operations.slice(0, 6).map((op: Operation) => (
              <div 
                key={op.id} 
                className="bg-white rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                    {op.sector}
                  </span>
                  <span className="text-xs text-slate-500">{op.project_status}</span>
                </div>
                <h3 className="font-medium text-slate-900 mb-3 line-clamp-2">{op.title}</h3>
                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <span>{op.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Euro className="w-4 h-4 text-slate-400" />
                    <span>{op.valuation_range}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>{op.company_size}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/oportunidades">
              <Button variant="outline" className="border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white">
                Ver Todas las Oportunidades
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Copy */}
            <div>
              <h2 className="text-3xl md:text-4xl font-normal text-white mb-6">
                Recibe Oportunidades<br />
                <span className="text-slate-400">que Encajen Contigo</span>
              </h2>
              <p className="text-slate-300 mb-8">
                Cuéntanos tu perfil de inversión y te enviaremos las oportunidades que mejor se adapten a tus criterios.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-300">Información confidencial bajo NDA</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-300">Mandato directo con los propietarios</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-slate-300">Asesoramiento integral en el proceso</span>
                </div>
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="text-slate-300">Nombre completo *</Label>
                    <Input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="text-slate-300">Email *</Label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Teléfono</Label>
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="+34 600..."
                    />
                  </div>
                  <div>
                    <Label className="text-slate-300">Empresa / Fondo</Label>
                    <Input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="Nombre"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Tipo de inversor</Label>
                    <Select
                      value={formData.investorType}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, investorType: value }))}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
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
                    <Label className="text-slate-300">Ticket inversión</Label>
                    <Select
                      value={formData.investmentRange}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, investmentRange: value }))}
                    >
                      <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
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

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="gdprConsent"
                    checked={formData.gdprConsent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprConsent: checked as boolean }))}
                    className="mt-1 data-[state=checked]:bg-white data-[state=checked]:border-white"
                  />
                  <Label htmlFor="gdprConsent" className="text-sm text-slate-400 cursor-pointer">
                    Acepto la{' '}
                    <Link to="/politica-privacidad" className="text-white underline">
                      política de privacidad
                    </Link>{' '}
                    y recibir información sobre oportunidades.
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-white hover:bg-slate-100 text-slate-900 font-medium py-6 text-lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Recibir Oportunidades'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <LandingFooterMinimal />
    </>
  );
};

export default LandingOportunidadesMeta;
