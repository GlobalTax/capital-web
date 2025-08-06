import React, { useState } from 'react';
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatSpanishPhone } from '@/utils/validationUtils';
import { useContactForm } from '@/hooks/useContactForm';
import { useSimpleFormTracking } from '@/hooks/useSimpleFormTracking';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingButton } from '@/components/LoadingButton';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { logger } from '@/utils/logger';
import RateLimitFeedback from '@/components/ui/RateLimitFeedback';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    phone: '',
    email: '',
    country: '',
    companySize: '',
    referral: '',
  });

  const [rateLimitState, setRateLimitState] = useState({
    isRateLimited: false,
    remainingRequests: 5
  });

  const { submitContactForm, isSubmitting, getRemainingRequests, isRateLimited, clearRateLimit } = useContactForm();
  const { isOnline } = useNetworkStatus();
  
  const { trackFormSubmission, trackFormInteraction } = useSimpleFormTracking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      logger.info('Contact form submission started', { formData: { ...formData, email: '[REDACTED]' } }, { context: 'form', component: 'Contact' });
      
      const result = await submitContactForm(formData);
      
      // Actualizar estado de rate limiting
      setRateLimitState({
        isRateLimited: result.isRateLimited || false,
        remainingRequests: result.remainingRequests || getRemainingRequests()
      });

      if (result.isRateLimited) {
        logger.warn('Contact form submission blocked by rate limit', undefined, { context: 'security', component: 'Contact' });
        return;
      }

      if (result.error) {
        logger.error('Contact form submission failed', result.error, { context: 'form', component: 'Contact' });
        return;
      }
      
      trackFormSubmission('contact', formData);
      
      // Limpiar formulario después del envío exitoso
      setFormData({
        fullName: '',
        company: '',
        phone: '',
        email: '',
        country: '',
        companySize: '',
        referral: '',
      });
      
      // Actualizar remaining requests después de envío exitoso
      setRateLimitState(prev => ({
        ...prev,
        remainingRequests: getRemainingRequests()
      }));
      
      logger.info('Contact form submitted successfully', undefined, { context: 'form', component: 'Contact' });
    } catch (error) {
      logger.error('Error in contact form submission', error as Error, { context: 'form', component: 'Contact' });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    trackFormInteraction('contact', name);
    
    if (name === 'phone') {
      setFormData({
        ...formData,
        [name]: formatSpanishPhone(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    trackFormInteraction('contact', name);
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleFieldBlur = (fieldName: string) => {
    logger.debug('Field blur event', { fieldName }, { context: 'form', component: 'Contact' });
  };

  const handleRetry = () => {
    // Actualizar estado para mostrar remaining requests actuales
    setRateLimitState({
      isRateLimited: isRateLimited(),
      remainingRequests: getRemainingRequests()
    });
  };

  const handleClearRateLimit = () => {
    clearRateLimit();
    setRateLimitState({
      isRateLimited: false,
      remainingRequests: 5
    });
  };

  return (
    <ErrorBoundary fallback={<div className="py-32 bg-background text-center">Error cargando el formulario de contacto</div>}>
      <section id="contacto" className="relative py-24 bg-background">
      
      <div className="container grid w-full grid-cols-1 gap-x-32 overflow-hidden lg:grid-cols-2 max-w-6xl mx-auto px-6 lg:px-8">
        <div className="w-full pb-10 md:space-y-10 md:pb-0">
          <div className="space-y-4 md:max-w-[40rem]">
            <h1 className="text-4xl font-normal text-foreground lg:text-5xl tracking-tight">
              Solicita tu Consulta Gratuita
            </h1>
            <div className="text-muted-foreground md:text-base lg:text-lg lg:leading-7 font-normal">
              ¿Está considerando vender su empresa o necesita una valoración profesional? 
              Nuestros expertos en M&A están listos para ayudarle a maximizar el valor de su negocio.
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="space-y-16 pb-20 lg:pb-0">
                <div className="space-y-6">
                <div className="mt-16 flex overflow-hidden">
                  <Avatar className="size-11 border border-border">
                    <AvatarFallback className="bg-primary text-primary-foreground font-medium">CA</AvatarFallback>
                  </Avatar>
                  <Avatar className="-ml-4 size-11 border border-border">
                    <AvatarFallback className="bg-legal-accent text-legal-accent-foreground font-medium">PI</AvatarFallback>
                  </Avatar>
                  <Avatar className="-ml-4 size-11 border border-border">
                    <AvatarFallback className="bg-muted text-muted-foreground font-medium">TT</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-medium text-foreground">Lo que puedes esperar:</p>
                  <div className="flex items-center space-x-2.5">
                    <Check className="size-5 shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground font-normal">
                      Valoración preliminar gratuita de tu empresa
                    </p>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="size-5 shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground font-normal">
                      Estrategia personalizada para maximizar valor
                    </p>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="size-5 shrink-0 text-primary" />
                    <p className="text-sm text-muted-foreground font-normal">
                      Asesoramiento experto sin compromiso
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-12">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Confianza de más de 200+ empresas
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex w-full justify-center lg:mt-2.5">
          <div className="relative flex w-full max-w-[30rem] min-w-[20rem] flex-col items-center overflow-visible md:min-w-[24rem]">
            <form onSubmit={handleSubmit} className="z-10 space-y-6 w-full">
              <div className="w-full space-y-6 rounded-xl border border-border bg-card px-6 py-10 shadow-sm">
                
                {/* Rate Limit Feedback */}
                <RateLimitFeedback
                  isRateLimited={rateLimitState.isRateLimited}
                  remainingRequests={rateLimitState.remainingRequests}
                  maxRequests={5}
                  onRetry={handleRetry}
                  onClearLimit={handleClearRateLimit}
                  title="Límite de envíos alcanzado"
                  message="Has alcanzado el máximo de envíos permitidos para prevenir spam."
                />

                <div>
                  <div className="mb-2.5 text-sm font-medium text-foreground">
                    <label htmlFor="fullName">Nombre completo *</label>
                  </div>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('fullName')}
                    placeholder="Tu nombre completo"
                    required
                    className="bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-foreground">
                    <label htmlFor="company">Empresa *</label>
                  </div>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('company')}
                    placeholder="Nombre de tu empresa"
                    required
                    className="bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-foreground">
                    <label htmlFor="phone">Teléfono</label>
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('phone')}
                    placeholder="+34 600 000 000"
                    className="bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-foreground">
                    <label htmlFor="email">Email *</label>
                  </div>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('email')}
                    placeholder="tu@empresa.com"
                    required
                    className="bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-foreground">
                    <label htmlFor="country">País</label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('country', value)}>
                    <SelectTrigger 
                      id="country" 
                      name="country"
                      className="bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <SelectValue placeholder="Selecciona país" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">España</SelectItem>
                      <SelectItem value="pt">Portugal</SelectItem>
                      <SelectItem value="fr">Francia</SelectItem>
                      <SelectItem value="de">Alemania</SelectItem>
                      <SelectItem value="uk">Reino Unido</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-foreground">
                    <label htmlFor="companySize">Facturación anual</label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('companySize', value)}>
                    <SelectTrigger 
                      id="companySize" 
                      name="companySize"
                      className="bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <SelectValue placeholder="Selecciona rango" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-5m">1M€ - 5M€</SelectItem>
                      <SelectItem value="5-10m">5M€ - 10M€</SelectItem>
                      <SelectItem value="10-25m">10M€ - 25M€</SelectItem>
                      <SelectItem value="25-50m">25M€ - 50M€</SelectItem>
                      <SelectItem value="50m+">Más de 50M€</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-foreground">
                    <label htmlFor="referral">
                      ¿Cómo nos conociste?{" "}
                      <span className="text-muted-foreground">(Opcional)</span>
                    </label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('referral', value)}>
                    <SelectTrigger 
                      id="referral" 
                      name="referral"
                      className="bg-background border border-input rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-ring/20"
                    >
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="google">Búsqueda en Google</SelectItem>
                      <SelectItem value="referral">Recomendación</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="event">Evento/Conferencia</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex w-full flex-col justify-end space-y-3 pt-2">
                  <LoadingButton
                    loading={isSubmitting}
                    loadingText="Enviando..."
                    disabled={isSubmitting || !isOnline || rateLimitState.isRateLimited}
                    type="submit"
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 py-3"
                  >
                    Solicitar Consulta
                  </LoadingButton>
                  <div className="text-xs text-muted-foreground">
                    Al enviar este formulario, aceptas que nos pongamos en contacto contigo.
                    Para más información sobre cómo manejamos tu información personal, visita nuestra{" "}
                    <a href="/politica-privacidad" className="underline text-foreground">
                      política de privacidad
                    </a>.
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
    </ErrorBoundary>
  );
};

export default Contact;
