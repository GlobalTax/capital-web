
import React, { useState, useCallback, memo } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingButton from '@/components/LoadingButton';

import { useContactForm } from '@/hooks/useContactForm';
import type { ContactFormData } from '@/types/forms';

// Memoized contact info section
const ContactInfo = memo(() => (
  <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
    <div className="text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📞</span>
      </div>
      <h3 className="font-semibold mb-2">Teléfono</h3>
      <p className="text-muted-foreground">+34 912 345 678</p>
    </div>

    <div className="text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">✉️</span>
      </div>
      <h3 className="font-semibold mb-2">Email</h3>
      <p className="text-muted-foreground">info@capittal.es</p>
    </div>

    <div className="text-center">
      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">📍</span>
      </div>
      <h3 className="font-semibold mb-2">Oficina</h3>
      <p className="text-muted-foreground">
        P.º de la Castellana, 11, B - A<br />
        Chamberí, 28046 Madrid
      </p>
    </div>
  </div>
));

ContactInfo.displayName = 'ContactInfo';

const Contact = () => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { submitForm, isSubmitting, errors } = useContactForm();

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: ContactFormData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      company: formData.get('company') as string,
      message: formData.get('message') as string,
      service: formData.get('service') as string,
    };

    const success = await submitForm(data);
    if (success) {
      (e.target as HTMLFormElement).reset();
      setAcceptTerms(false);
    }
  }, [acceptTerms, submitForm]);

  const handleTermsChange = useCallback((checked: boolean) => {
    setAcceptTerms(checked);
  }, []);

  return (
    <section className="py-20 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
            Hablemos de tu Proyecto
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cuéntanos sobre tu empresa y tus objetivos. Te responderemos en menos de 24 horas con una propuesta personalizada.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>Solicita tu Consulta Gratuita</CardTitle>
            <CardDescription>
              Todos los campos marcados con * son obligatorios
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre completo *</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="Tu nombre completo"
                  />
                  {errors.name && (
                    <p className="text-sm text-destructive">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+34 600 000 000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Empresa</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="Nombre de tu empresa"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="service">Servicio de interés</Label>
                <select
                  id="service"
                  name="service"
                  className="w-full px-3 py-2 border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecciona un servicio</option>
                  <option value="venta">Venta de empresa</option>
                  <option value="compra">Compra de empresa</option>
                  <option value="valoracion">Valoración empresarial</option>
                  <option value="due-diligence">Due diligence</option>
                  <option value="consultoria">Consultoría estratégica</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensaje *</Label>
                <Textarea
                  id="message"
                  name="message"
                  required
                  placeholder="Cuéntanos más detalles sobre tu proyecto, situación actual de la empresa, objetivos, timing aproximado..."
                  className="min-h-[120px]"
                />
                {errors.message && (
                  <p className="text-sm text-destructive">{errors.message}</p>
                )}
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={acceptTerms}
                  onCheckedChange={handleTermsChange}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed">
                  Acepto la política de privacidad y autorizo el tratamiento de mis datos para que Capittal pueda responder a mi consulta. *
                </Label>
              </div>

              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Enviando..."
                disabled={!acceptTerms}
                className="w-full capittal-button"
              >
                Enviar Consulta Gratuita
              </LoadingButton>
            </form>
          </CardContent>
        </Card>

        <ContactInfo />
      </div>
    </section>
  );
};

export default Contact;
