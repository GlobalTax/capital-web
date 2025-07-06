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

  const { submitContactForm, isSubmitting } = useContactForm();
  const { isOnline } = useNetworkStatus();
  
  // Integrar tracking simple de formulario
  const { trackFormSubmission, trackFormInteraction } = useSimpleFormTracking();

  // Tracking simplificado - no necesita useEffect

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await submitContactForm(formData);
      
      // Track successful completion
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
    } catch (error) {
      console.error('Error en el formulario:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Track field changes
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
    // Track select field changes
    trackFormInteraction('contact', name);
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Simplified blur handler - no validation tracking
  const handleFieldBlur = (fieldName: string) => {
    // Basic client-side validation could go here if needed
  };

  return (
    <ErrorBoundary fallback={<div className="py-32 bg-background text-center">Error cargando el formulario de contacto</div>}>
      <section id="contacto" className="relative py-32 bg-white">
      {/* Background gradients */}
      <div className="pointer-events-none absolute inset-x-0 -top-20 -bottom-20 bg-[radial-gradient(ellipse_35%_15%_at_40%_55%,hsl(var(--accent))_0%,transparent_100%)] lg:bg-[radial-gradient(ellipse_12%_20%_at_60%_45%,hsl(var(--accent))_0%,transparent_100%)]"></div>
      <div className="pointer-events-none absolute inset-x-0 -top-20 -bottom-20 bg-[radial-gradient(ellipse_35%_20%_at_70%_75%,hsl(var(--accent))_0%,transparent_80%)] lg:bg-[radial-gradient(ellipse_15%_30%_at_70%_65%,hsl(var(--accent))_0%,transparent_80%)]"></div>
      {/* Background pattern */}
      <div className="pointer-events-none absolute inset-x-0 -top-20 -bottom-20 bg-[radial-gradient(hsl(var(--accent-foreground)/0.1)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_60%_60%_at_65%_50%,#000_0%,transparent_80%)] [background-size:8px_8px]"></div>
      
      <div className="container grid w-full grid-cols-1 gap-x-32 overflow-hidden lg:grid-cols-2 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full pb-10 md:space-y-10 md:pb-0">
          <div className="space-y-4 md:max-w-[40rem]">
            <h1 className="text-4xl font-bold text-black lg:text-5xl">
              Solicita tu Consulta Gratuita
            </h1>
            <div className="text-gray-600 md:text-base lg:text-lg lg:leading-7">
              ¿Está considerando vender su empresa o necesita una valoración profesional? 
              Nuestros expertos en M&A están listos para ayudarle a maximizar el valor de su negocio.
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="space-y-16 pb-20 lg:pb-0">
              <div className="space-y-6">
                <div className="mt-16 flex overflow-hidden">
                  <Avatar className="size-11 border-0.5 border-black">
                    <AvatarFallback className="bg-black text-white font-medium">CA</AvatarFallback>
                  </Avatar>
                  <Avatar className="-ml-4 size-11 border-0.5 border-black">
                    <AvatarFallback className="bg-gray-800 text-white font-medium">PI</AvatarFallback>
                  </Avatar>
                  <Avatar className="-ml-4 size-11 border-0.5 border-black">
                    <AvatarFallback className="bg-gray-600 text-white font-medium">TT</AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-black">Lo que puedes esperar:</p>
                  <div className="flex items-center space-x-2.5">
                    <Check className="size-5 shrink-0 text-black" />
                    <p className="text-sm text-gray-600">
                      Valoración preliminar gratuita de tu empresa
                    </p>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="size-5 shrink-0 text-black" />
                    <p className="text-sm text-gray-600">
                      Estrategia personalizada para maximizar valor
                    </p>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Check className="size-5 shrink-0 text-black" />
                    <p className="text-sm text-gray-600">
                      Asesoramiento experto sin compromiso
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-12">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Confianza de más de 200+ empresas
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex w-full justify-center lg:mt-2.5">
          <div className="relative flex w-full max-w-[30rem] min-w-[20rem] flex-col items-center overflow-visible md:min-w-[24rem]">
            <form onSubmit={handleSubmit} className="z-10 space-y-6 w-full">
              <div className="w-full space-y-6 rounded-xl border-0.5 border-black bg-white px-6 py-10 shadow-sm">
                <div>
                  <div className="mb-2.5 text-sm font-medium text-black">
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
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-black">
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
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-black">
                    <label htmlFor="phone">Teléfono</label>
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={() => handleFieldBlur('phone')}
                    placeholder="+34 600 000 000"
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-black">
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
                    className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-black">
                    <label htmlFor="country">País</label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('country', value)}>
                    <SelectTrigger 
                      id="country" 
                      name="country"
                      className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                  <div className="mb-2.5 text-sm font-medium text-black">
                    <label htmlFor="companySize">Facturación anual</label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('companySize', value)}>
                    <SelectTrigger 
                      id="companySize" 
                      name="companySize"
                      className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                  <div className="mb-2.5 text-sm font-medium text-black">
                    <label htmlFor="referral">
                      ¿Cómo nos conociste?{" "}
                      <span className="text-gray-500">(Opcional)</span>
                    </label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('referral', value)}>
                    <SelectTrigger 
                      id="referral" 
                      name="referral"
                      className="bg-white border-0.5 border-black rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                    disabled={isSubmitting || !isOnline}
                    type="submit"
                    className="w-full bg-black text-white hover:bg-gray-800 py-3"
                  >
                    Solicitar Consulta
                  </LoadingButton>
                  <div className="text-xs text-gray-500">
                    Al enviar este formulario, aceptas que nos pongamos en contacto contigo.
                    Para más información sobre cómo manejamos tu información personal, visita nuestra{" "}
                    <a href="/politica-privacidad" className="underline text-black">
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
