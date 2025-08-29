import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, BarChart3, Loader2 } from 'lucide-react';

const formSchema = z.object({
  fullName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre no puede exceder 100 caracteres'),
  company: z.string().min(2, 'El nombre de la empresa debe tener al menos 2 caracteres').max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),
  email: z.string().email('Email inválido').max(254, 'El email no puede exceder 254 caracteres'),
  phone: z.string().optional(),
  investmentRange: z.string().min(1, 'Selecciona un rango de inversión'),
  acquisitionType: z.string().min(1, 'Selecciona un tipo de adquisición'),
  sectorsOfInterest: z.string().min(2, 'Especifica los sectores de interés'),
  targetTimeline: z.string().min(1, 'Especifica tu timeline objetivo'),
  additionalDetails: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

const AcquisitionCTA = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      company: '',
      email: '',
      phone: '',
      investmentRange: '',
      acquisitionType: '',
      sectorsOfInterest: '',
      targetTimeline: '',
      additionalDetails: ''
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from('acquisition_leads')
        .insert({
          full_name: data.fullName,
          company: data.company,
          email: data.email,
          phone: data.phone || null,
          investment_range: data.investmentRange,
          acquisition_type: data.acquisitionType,
          sectors_of_interest: data.sectorsOfInterest,
          target_timeline: data.targetTimeline,
          additional_details: data.additionalDetails || null,
          ip_address: null, // Will be set by RLS policy if available
          user_agent: navigator.userAgent,
          utm_source: new URLSearchParams(window.location.search).get('utm_source'),
          utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
          utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
          referrer: document.referrer || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: "Solicitud enviada exitosamente",
        description: "Nos pondremos en contacto contigo en las próximas 24 horas para analizar las oportunidades disponibles.",
      });

      form.reset();
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error al enviar la solicitud",
        description: error.message || "Ha ocurrido un error inesperado. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-form" className="py-20 px-4 bg-slate-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
            Solicitar <span className="text-primary">Análisis de Oportunidades</span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Completa este formulario y recibe un análisis personalizado de las mejores oportunidades 
            de adquisición alineadas con tu estrategia de crecimiento.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Tu nombre completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nombre de tu empresa" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="tu@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input placeholder="+34 600 000 000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="investmentRange"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rango de inversión *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona rango" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="500k-2m">€500K - €2M</SelectItem>
                              <SelectItem value="2m-5m">€2M - €5M</SelectItem>
                              <SelectItem value="5m-10m">€5M - €10M</SelectItem>
                              <SelectItem value="10m-25m">€10M - €25M</SelectItem>
                              <SelectItem value="25m+">€25M+</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acquisitionType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de adquisición *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="strategic">Adquisición estratégica</SelectItem>
                              <SelectItem value="consolidation">Consolidación sectorial</SelectItem>
                              <SelectItem value="expansion">Expansión geográfica</SelectItem>
                              <SelectItem value="diversification">Diversificación</SelectItem>
                              <SelectItem value="private-equity">Private Equity</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="sectorsOfInterest"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sectores de interés *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Tecnología, Servicios B2B, Distribución" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="targetTimeline"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Timeline objetivo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: 3-6 meses, Q2 2024" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="additionalDetails"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Detalles adicionales</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Criterios específicos, sinergias buscadas, restricciones geográficas..."
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg font-semibold"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="mr-2 h-5 w-5" />
                        Solicitar Análisis de Oportunidades
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-6">
                Contacto Directo
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Teléfono</div>
                    <div className="text-slate-600">+34 620 27 35 52</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium text-slate-900">Email</div>
                    <div className="text-slate-600">adquisiciones@capittal.es</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-primary/5 to-blue-50 rounded-2xl p-8 border border-primary/10">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                ¿Qué Incluye el Análisis?
              </h3>
              
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Portfolio personalizado de oportunidades
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Análisis de múltiplos sectoriales
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Identificación de sinergias potenciales
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Estrategia de adquisición recomendada
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  Consulta estratégica de 45 minutos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AcquisitionCTA;