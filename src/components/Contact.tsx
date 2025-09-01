import React, { useState } from 'react';
import { Check } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatSpanishPhone } from '@/utils/validationUtils';
import { useGeneralContactForm } from '@/hooks/useGeneralContactForm';
import ErrorBoundary from '@/components/ErrorBoundary';
import { LoadingButton } from '@/components/LoadingButton';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    company: '',
    phone: '',
    email: '',
    country: '',
    annualRevenue: '',
    howDidYouHear: '',
    message: ''
  });

  const { submitGeneralContactForm, isSubmitting } = useGeneralContactForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitGeneralContactForm(formData, 'contacto');
    
    if (result.success) {
      // Limpiar formulario después del envío exitoso
      setFormData({
        fullName: '',
        company: '',
        phone: '',
        email: '',
        country: '',
        annualRevenue: '',
        howDidYouHear: '',
        message: ''
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
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
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  return (
    <ErrorBoundary fallback={<div className="py-32 bg-background text-center">Error cargando el formulario de contacto</div>}>
      <section id="contacto" className="py-32 bg-white">
      
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
                  <Avatar className="size-11 border border-gray-300">
                    <AvatarFallback className="bg-black text-white font-medium">CA</AvatarFallback>
                  </Avatar>
                  <Avatar className="-ml-4 size-11 border border-gray-300">
                    <AvatarFallback className="bg-gray-800 text-white font-medium">PI</AvatarFallback>
                  </Avatar>
                  <Avatar className="-ml-4 size-11 border border-gray-300">
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
              <div className="w-full space-y-6 rounded-xl border border-gray-300 bg-white px-6 py-10 shadow-sm">
                
                <div>
                  <div className="mb-2.5 text-sm font-medium text-black">
                    <label htmlFor="fullName">Nombre completo *</label>
                  </div>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Tu nombre completo"
                    required
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                    placeholder="Nombre de tu empresa"
                    required
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                    placeholder="600 000 000"
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                    placeholder="tu@empresa.com"
                    required
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                    <label htmlFor="annualRevenue">Facturación anual</label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('annualRevenue', value)}>
                    <SelectTrigger 
                      id="annualRevenue" 
                      name="annualRevenue"
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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
                    <label htmlFor="howDidYouHear">
                      ¿Cómo nos conociste?{" "}
                      <span className="text-gray-500">(Opcional)</span>
                    </label>
                  </div>
                  <Select onValueChange={(value) => handleSelectChange('howDidYouHear', value)}>
                    <SelectTrigger 
                      id="howDidYouHear" 
                      name="howDidYouHear"
                      className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
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

                <div>
                  <div className="mb-2.5 text-sm font-medium text-black">
                    <label htmlFor="message">Mensaje *</label>
                  </div>
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Cuéntanos sobre tu proyecto o consulta..."
                    required
                    rows={4}
                    className="bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-black/20"
                  />
                </div>
                
                <div className="flex w-full flex-col justify-end space-y-3 pt-2">
                  <LoadingButton
                    loading={isSubmitting}
                    loadingText="Enviando..."
                    disabled={isSubmitting}
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
