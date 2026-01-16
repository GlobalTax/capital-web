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
import { Shield, Users, Target, CheckCircle, Building2, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFormSecurity } from '@/hooks/useFormSecurity';

const INVESTMENT_RANGES = [
  { value: '<1M', label: 'Menos de 1M€' },
  { value: '1-5M', label: '1M€ - 5M€' },
  { value: '5-15M', label: '5M€ - 15M€' },
  { value: '15-50M', label: '15M€ - 50M€' },
  { value: '>50M', label: 'Más de 50M€' },
];

const SECTORS = [
  'Industria y Manufactura',
  'Tecnología y Software',
  'Distribución y Logística',
  'Retail y Consumo',
  'Servicios Profesionales',
  'Construcción e Inmobiliario',
  'Alimentación y Hostelería',
  'Sanidad y Farma',
  'Energía y Utilities',
  'Otro',
];

const INVESTOR_TYPES = [
  { value: 'individual', label: 'Inversor particular' },
  { value: 'family_office', label: 'Family Office' },
  { value: 'venture_capital', label: 'Venture Capital' },
  { value: 'private_equity', label: 'Private Equity' },
  { value: 'corporate', label: 'Corporativo / Estratégico' },
  { value: 'search_fund', label: 'Search Fund' },
  { value: 'other', label: 'Otro' },
];

const LandingCompraEmpresasMeta: React.FC = () => {
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
    sectors: [] as string[],
    gdprConsent: false,
  });

  useEffect(() => {
    // Track page view
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: 'Landing Compra Empresas Meta',
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
        sectors_of_interest: formData.sectors.length > 0 ? formData.sectors.join(', ') : null,
        acquisition_type: formData.investorType || null,
        page_origin: 'lp-compra-empresas-meta',
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
          event_label: 'compra_empresas_meta',
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

  const handleSectorToggle = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector],
    }));
  };

  const stats = [
    { value: '€500M+', label: 'en transacciones cerradas' },
    { value: '200+', label: 'operaciones asesoradas' },
    { value: '15+', label: 'años de experiencia' },
  ];

  if (isSubmitted) {
    return (
      <>
        <Helmet>
          <title>Gracias | Capittal</title>
          <meta name="robots" content="noindex, nofollow" />
        </Helmet>
        <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
          <div className="max-w-md text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h1 className="text-3xl font-normal text-white mb-4">
              ¡Gracias por tu interés!
            </h1>
            <p className="text-slate-300 mb-8">
              Hemos recibido tu solicitud. Nuestro equipo revisará tu perfil y te contactará en las próximas 24-48 horas con oportunidades que encajen con tus criterios.
            </p>
            <Link to="/oportunidades">
              <Button className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium">
                Ver Oportunidades Activas
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
        <title>Comprar una Empresa | Asesoramiento M&A | Capittal</title>
        <meta name="description" content="¿Buscas adquirir una empresa? Accede a oportunidades de inversión exclusivas con mandato directo. Asesoramiento profesional en M&A." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://capittal.es/lp/compra-empresas-meta" />
      </Helmet>

      <LandingHeaderMinimal />

      {/* Hero Section - Dark with Form */}
      <section className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Left - Copy */}
            <div className="space-y-8">
              <div>
                <span className="inline-block px-4 py-2 bg-amber-500/10 text-amber-400 text-sm font-medium rounded-full mb-6">
                  Oportunidades de Inversión
                </span>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-white mb-6 leading-tight">
                  ¿Buscas Adquirir<br />
                  <span className="text-amber-400">una Empresa?</span>
                </h1>
                <p className="text-xl text-slate-300 leading-relaxed">
                  Identificamos empresas en venta con mandato directo y te acompañamos en todo el proceso de adquisición.
                </p>
              </div>

              {/* Value Props */}
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Target className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Mandato Directo</h3>
                    <p className="text-slate-400 text-sm">Acceso exclusivo a empresas que nos han contratado para su venta</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Proceso Confidencial</h3>
                    <p className="text-slate-400 text-sm">Información verificada bajo estrictos acuerdos de confidencialidad</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Acompañamiento Integral</h3>
                    <p className="text-slate-400 text-sm">Desde la identificación hasta el cierre de la operación</p>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-slate-700">
                {stats.map((stat, index) => (
                  <div key={index}>
                    <div className="text-2xl md:text-3xl font-bold text-amber-400">{stat.value}</div>
                    <div className="text-sm text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Form */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <div className="mb-6">
                <h2 className="text-2xl font-medium text-white mb-2">
                  Solicita Oportunidades
                </h2>
                <p className="text-slate-400">
                  Cuéntanos tu perfil y te enviaremos empresas que encajen
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="fullName" className="text-slate-300">Nombre completo *</Label>
                    <Input
                      id="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="email" className="text-slate-300">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="phone" className="text-slate-300">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500"
                      placeholder="+34 600 000 000"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <Label htmlFor="company" className="text-slate-300">Empresa / Fondo</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                      className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-500"
                      placeholder="Nombre de tu empresa"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 sm:col-span-1">
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
                  <div className="col-span-2 sm:col-span-1">
                    <Label className="text-slate-300">Presupuesto inversión</Label>
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

                <div>
                  <Label className="text-slate-300 mb-3 block">Sectores de interés</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTORS.slice(0, 8).map((sector) => (
                      <label
                        key={sector}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-sm ${
                          formData.sectors.includes(sector)
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-slate-700/50 text-slate-400 border border-transparent hover:bg-slate-700'
                        }`}
                      >
                        <Checkbox
                          checked={formData.sectors.includes(sector)}
                          onCheckedChange={() => handleSectorToggle(sector)}
                          className="data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                        />
                        <span className="truncate">{sector}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="gdprConsent"
                    checked={formData.gdprConsent}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, gdprConsent: checked as boolean }))}
                    className="mt-1 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label htmlFor="gdprConsent" className="text-sm text-slate-400 cursor-pointer">
                    Acepto la{' '}
                    <Link to="/politica-privacidad" className="text-amber-400 hover:underline">
                      política de privacidad
                    </Link>{' '}
                    y el tratamiento de mis datos para recibir información sobre oportunidades de inversión.
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium py-6 text-lg"
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar Oportunidades'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-slate-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">+50 Empresas Activas</h3>
              <p className="text-slate-600 text-sm">Operaciones en proceso con mandato directo</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Tickets desde 1M€</h3>
              <p className="text-slate-600 text-sm">Empresas de diversos tamaños y sectores</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-900/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-slate-900" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">100% Confidencial</h3>
              <p className="text-slate-600 text-sm">Información protegida bajo NDA</p>
            </div>
          </div>
        </div>
      </section>

      <LandingFooterMinimal />
    </>
  );
};

export default LandingCompraEmpresasMeta;
