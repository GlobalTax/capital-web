import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { SEOHead } from '@/components/seo';
import { getWebPageSchema } from '@/utils/seo';
import { useI18n } from '@/shared/i18n/I18nProvider';
import { useContactForm } from '@/hooks/useContactForm';
import { contactFormSchema, type ContactFormData } from '@/schemas/contactFormSchema';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MapPin, Phone, Mail, Linkedin, Users, Shield, Globe, Lock, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const SERVICE_OPTIONS = [
  { value: 'vender', label: 'Quiero vender mi empresa' },
  { value: 'comprar', label: 'Quiero comprar/adquirir' },
  { value: 'valoracion', label: 'Necesito una valoración' },
  { value: 'due-diligence', label: 'Due Diligence' },
  { value: 'otros', label: 'Otro' },
] as const;

const TRUST_SIGNALS = [
  { icon: Users, value: '+70 profesionales', label: 'Equipo multidisciplinar' },
  { icon: Shield, value: 'Especialistas en seguridad', label: 'Sector principal' },
  { icon: Globe, value: 'PE internacional', label: 'Red global de inversores' },
  { icon: Lock, value: 'Máxima confidencialidad', label: 'En cada operación' },
];

const Contacto = () => {
  const { t, setLang } = useI18n();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { submitContactForm, isSubmitting } = useContactForm();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    serviceType: '' as string,
    message: '',
    website: '', // honeypot
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  // Detect language from URL
  useEffect(() => {
    const path = location.pathname;
    if (path === '/contacte') setLang('ca');
    else if (path === '/contact') setLang('en');
    else setLang('es');
  }, [location.pathname, setLang]);

  // Hreflang links
  useEffect(() => {
    const hreflangUrls: Record<string, string> = {
      es: 'https://capittal.es/contacto',
      ca: 'https://capittal.es/contacte',
      en: 'https://capittal.es/contact',
      'x-default': 'https://capittal.es/contacto',
    };
    document.querySelectorAll('link[rel="alternate"]').forEach(link => link.remove());
    Object.entries(hreflangUrls).forEach(([lang, url]) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.hreflang = lang;
      link.href = url;
      document.head.appendChild(link);
    });
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const dataToValidate: Partial<ContactFormData> = {
      fullName: formData.fullName,
      email: formData.email,
      company: formData.company || 'No especificada',
      serviceType: (formData.serviceType || 'otros') as ContactFormData['serviceType'],
      phone: formData.phone || undefined,
      message: formData.message || undefined,
      website: formData.website,
    };

    const result = contactFormSchema.safeParse(dataToValidate);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    const submitResult = await submitContactForm(result.data, 'contacto-page');
    if (submitResult.success) {
      setSubmitted(true);
      setFormData({ fullName: '', email: '', phone: '', company: '', serviceType: '', message: '', website: '' });
    }
  };

  return (
    <>
      <SEOHead
        title={t('contacto.seo.title')}
        description={t('contacto.seo.description')}
        canonical={`https://capittal.es${location.pathname}`}
        keywords={t('contacto.seo.keywords')}
        structuredData={getWebPageSchema(
          t('contacto.seo.title'),
          t('contacto.seo.description'),
          `https://capittal.es${location.pathname}`
        )}
      />
      <UnifiedLayout mainClassName="pt-16">
        {/* Hero */}
        <section className="bg-muted/30 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center max-w-3xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground mb-4">
              Contacta con nosotros
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Hablemos sobre tu próxima operación
            </p>
          </div>
        </section>

        {/* Main content: Form + Sidebar */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-14 max-w-6xl mx-auto">
              {/* Form Column (3/5) */}
              <div className="lg:col-span-3">
                {submitted ? (
                  <div className="rounded-xl border border-border bg-card p-8 text-center">
                    <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-7 h-7 text-primary" />
                    </div>
                    <h2 className="text-2xl font-semibold text-foreground mb-2">¡Consulta enviada!</h2>
                    <p className="text-muted-foreground">
                      Hemos recibido tu solicitud. Te contactaremos en las próximas 24 horas hábiles.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Honeypot */}
                    <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
                      <Input
                        name="website"
                        tabIndex={-1}
                        autoComplete="off"
                        value={formData.website}
                        onChange={e => handleChange('website', e.target.value)}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Nombre */}
                      <div className="space-y-1.5">
                        <Label htmlFor="fullName">Nombre completo *</Label>
                        <Input
                          id="fullName"
                          placeholder="Tu nombre"
                          value={formData.fullName}
                          onChange={e => handleChange('fullName', e.target.value)}
                          className={errors.fullName ? 'border-destructive' : ''}
                        />
                        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName}</p>}
                      </div>

                      {/* Email */}
                      <div className="space-y-1.5">
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="tu@empresa.com"
                          value={formData.email}
                          onChange={e => handleChange('email', e.target.value)}
                          className={errors.email ? 'border-destructive' : ''}
                        />
                        {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Teléfono */}
                      <div className="space-y-1.5">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+34 600 000 000"
                          value={formData.phone}
                          onChange={e => handleChange('phone', e.target.value)}
                          className={errors.phone ? 'border-destructive' : ''}
                        />
                        {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                      </div>

                      {/* Empresa */}
                      <div className="space-y-1.5">
                        <Label htmlFor="company">Empresa</Label>
                        <Input
                          id="company"
                          placeholder="Nombre de tu empresa"
                          value={formData.company}
                          onChange={e => handleChange('company', e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Tipo de consulta */}
                    <div className="space-y-1.5">
                      <Label htmlFor="serviceType">Tipo de consulta</Label>
                      <Select value={formData.serviceType} onValueChange={v => handleChange('serviceType', v)}>
                        <SelectTrigger id="serviceType" className={errors.serviceType ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Selecciona una opción" />
                        </SelectTrigger>
                        <SelectContent>
                          {SERVICE_OPTIONS.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.serviceType && <p className="text-xs text-destructive">{errors.serviceType}</p>}
                    </div>

                    {/* Mensaje */}
                    <div className="space-y-1.5">
                      <Label htmlFor="message">Mensaje</Label>
                      <Textarea
                        id="message"
                        placeholder="Cuéntanos brevemente sobre tu consulta..."
                        rows={5}
                        value={formData.message}
                        onChange={e => handleChange('message', e.target.value)}
                        className={errors.message ? 'border-destructive' : ''}
                      />
                      {errors.message && <p className="text-xs text-destructive">{errors.message}</p>}
                    </div>

                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Enviar consulta'
                      )}
                    </Button>
                  </form>
                )}
              </div>

              {/* Sidebar (2/5) */}
              <aside className="lg:col-span-2 space-y-8">
                {/* Contact Info */}
                <div className="rounded-xl border border-border bg-card p-6 space-y-5">
                  <h2 className="text-lg font-semibold text-foreground">Información de contacto</h2>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Oficina Barcelona</p>
                      <p className="text-sm text-muted-foreground">Ausiàs March 36, Principal<br />08010 Barcelona</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-primary shrink-0" />
                    <a href="tel:+34695717490" className="text-sm text-foreground hover:text-primary transition-colors">
                      +34 695 717 490
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-primary shrink-0" />
                    <a href="mailto:info@capittal.es" className="text-sm text-foreground hover:text-primary transition-colors">
                      info@capittal.es
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Linkedin className="w-5 h-5 text-primary shrink-0" />
                    <a
                      href="https://www.linkedin.com/company/capittal/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-foreground hover:text-primary transition-colors"
                    >
                      Capittal en LinkedIn
                    </a>
                  </div>
                </div>

                {/* Google Maps */}
                <div className="rounded-xl border border-border overflow-hidden">
                  <iframe
                    title="Oficina Capittal Barcelona"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2993.5!2d2.1734!3d41.3925!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a2f5a8b9c0d1%3A0x1234567890abcdef!2sAusi%C3%A0s%20March%2C%2036%2C%2008010%20Barcelona!5e0!3m2!1ses!2ses!4v1700000000000!5m2!1ses!2ses"
                    width="100%"
                    height={isMobile ? '200' : '220'}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </aside>
            </div>
          </div>
        </section>

        {/* Trust Signals */}
        <section className="border-t border-border bg-muted/20 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {TRUST_SIGNALS.map((signal) => (
                <div key={signal.value} className="text-center space-y-2">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <signal.icon className="w-5 h-5 text-primary" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{signal.value}</p>
                  <p className="text-xs text-muted-foreground">{signal.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </UnifiedLayout>
    </>
  );
};

export default Contacto;
