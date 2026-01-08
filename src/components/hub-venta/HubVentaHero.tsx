import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Clock, CheckCircle, Phone, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useHubVentaTracking } from '@/hooks/useHubVentaTracking';
import { useFormSecurity } from '@/hooks/useFormSecurity';

const SECTORS = [
  'Industria y Manufactura',
  'Tecnología y Software',
  'Distribución y Logística',
  'Retail y Consumo',
  'Servicios Profesionales',
  'Construcción e Inmobiliario',
  'Alimentación y Hostelería',
  'Sanidad y Farma',
  'Otro',
];

const REVENUE_RANGES = [
  { value: '<1M', label: 'Menos de 1M€' },
  { value: '1-5M', label: '1M€ - 5M€' },
  { value: '5-10M', label: '5M€ - 10M€' },
  { value: '10-25M', label: '10M€ - 25M€' },
  { value: '>25M', label: 'Más de 25M€' },
];

const SITUATIONS = [
  { value: 'exploring', label: 'Explorando opciones' },
  { value: 'decided', label: 'Decidido a vender' },
  { value: 'offer_received', label: 'He recibido una oferta' },
  { value: 'other', label: 'Otro' },
];

const HubVentaHero: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    sector: '',
    revenue: '',
    situation: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [hasStartedForm, setHasStartedForm] = useState(false);

  const { trackFormStart, trackFormSubmit, trackCTAClick, trackPhoneClick } = useHubVentaTracking();
  const { getTrackingData, recordSubmissionAttempt } = useFormSecurity();

  // Track form start on first input
  useEffect(() => {
    if (!hasStartedForm && (formData.fullName || formData.email)) {
      setHasStartedForm(true);
      trackFormStart();
    }
  }, [formData.fullName, formData.email, hasStartedForm, trackFormStart]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone || !formData.company) {
      toast.error('Por favor, completa los campos obligatorios');
      return;
    }

    setIsSubmitting(true);

    try {
      const trackingData = await getTrackingData();

      const insertData = {
        full_name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        company: formData.company.trim(),
        message: `Sector: ${formData.sector || 'No especificado'}\nFacturación: ${formData.revenue || 'No especificado'}\nSituación: ${formData.situation || 'No especificado'}\n\n${formData.message || ''}`.trim(),
        page_origin: 'hub-venta-empresa-ads',
        how_did_you_hear: 'Hub Venta Empresa (Ads)',
        status: 'new',
        utm_source: trackingData.utm_source,
        utm_medium: trackingData.utm_medium,
        utm_campaign: trackingData.utm_campaign,
        utm_content: trackingData.utm_content,
        utm_term: trackingData.utm_term,
        referrer: trackingData.referrer,
        user_agent: trackingData.user_agent,
        ip_address: trackingData.ip_address,
      };

      const { error } = await supabase
        .from('general_contact_leads')
        .insert([insertData]);

      if (error) throw error;

      recordSubmissionAttempt(formData.email);
      trackFormSubmit({ sector: formData.sector, revenue: formData.revenue });

      // Send notifications
      try {
        await supabase.functions.invoke('send-form-notifications', {
          body: {
            submissionId: 'sell_lead_hub',
            formType: 'sell_lead',
            email: formData.email,
            fullName: formData.fullName,
            formData: { ...formData, ...trackingData },
          }
        });
      } catch (notificationError) {
        console.warn('Notification error (non-blocking):', notificationError);
      }

      setIsSubmitted(true);
      toast.success('¡Solicitud enviada! Te contactaremos en menos de 24 horas.');
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Error al enviar el formulario. Por favor, intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneClick = () => {
    trackPhoneClick();
    trackCTAClick('phone_hero');
  };

  const stats = [
    { value: '€500M+', label: 'en transacciones cerradas' },
    { value: '200+', label: 'empresas vendidas' },
    { value: '15+', label: 'años de experiencia' },
  ];

  if (isSubmitted) {
    return (
      <section className="relative bg-black text-white py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-10 w-10 text-green-400" />
            </div>
            <h2 className="text-3xl md:text-4xl font-normal mb-4">¡Solicitud Recibida!</h2>
            <p className="text-lg text-white/80 mb-6">
              Un experto de nuestro equipo te contactará en menos de 24 horas para comenzar 
              con tu valoración gratuita.
            </p>
            <p className="text-sm text-white/60">
              ¿Prefieres hablar ahora? Llámanos al{' '}
              <a 
                href="tel:+34695717490" 
                className="text-white underline hover:no-underline"
                onClick={handlePhoneClick}
              >
                +34 695 717 490
              </a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-black text-white py-20 md:py-28 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-black"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Left: Content */}
          <div className="lg:pt-8">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm text-white/90 mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
              Asesoría M&A
            </div>
            
            {/* H1 */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight">
              Vende Tu Empresa al{' '}
              <span className="text-white">Mejor Precio</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/80 mb-8 max-w-xl">
              Acompañamos a empresarios en todo el proceso de venta: valoración, 
              búsqueda de compradores, negociación y cierre. Confidencialidad total 
              y sin compromiso inicial.
            </p>

            {/* Trust Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center lg:text-left">
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.value}</div>
                  <div className="text-xs md:text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Trust Microcopy */}
            <div className="flex flex-wrap gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span>100% confidencial</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Sin compromiso</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Respuesta en 24h</span>
              </div>
            </div>

            {/* Phone CTA */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-white/60 mb-2">¿Prefieres hablar directamente?</p>
              <a 
                href="tel:+34695717490" 
                className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors"
                onClick={handlePhoneClick}
              >
                <Phone className="h-5 w-5" />
                <span className="text-lg font-medium">+34 695 717 490</span>
              </a>
            </div>
          </div>

          {/* Right: Form */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-xl md:text-2xl font-normal text-slate-900 mb-2">
                Solicita Tu Valoración Gratuita
              </h2>
              <p className="text-sm text-slate-600">
                Completa el formulario y un experto te contactará en menos de 24 horas
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Nombre completo *"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email *"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  type="tel"
                  placeholder="Teléfono *"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                  required
                />
                <Input
                  placeholder="Nombre de la empresa *"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="bg-slate-50 border-slate-200 text-slate-900"
                  required
                />
              </div>

              <Select
                value={formData.sector}
                onValueChange={(value) => handleInputChange('sector', value)}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                  <SelectValue placeholder="Sector de actividad" />
                </SelectTrigger>
                <SelectContent>
                  {SECTORS.map((sector) => (
                    <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.revenue}
                onValueChange={(value) => handleInputChange('revenue', value)}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                  <SelectValue placeholder="Facturación aproximada" />
                </SelectTrigger>
                <SelectContent>
                  {REVENUE_RANGES.map((range) => (
                    <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={formData.situation}
                onValueChange={(value) => handleInputChange('situation', value)}
              >
                <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                  <SelectValue placeholder="¿Cuál es tu situación?" />
                </SelectTrigger>
                <SelectContent>
                  {SITUATIONS.map((situation) => (
                    <SelectItem key={situation.value} value={situation.value}>{situation.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Textarea
                placeholder="Mensaje adicional (opcional)"
                value={formData.message}
                onChange={(e) => handleInputChange('message', e.target.value)}
                className="bg-slate-50 border-slate-200 text-slate-900 min-h-[80px]"
              />

              <Button 
                type="submit" 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white py-6 text-base font-medium"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Solicitar Valoración Gratuita'
                )}
              </Button>

              <p className="text-xs text-center text-slate-500">
                🔒 100% confidencial · Sin compromiso · Respuesta en 24h
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HubVentaHero;
