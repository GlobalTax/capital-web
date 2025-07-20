
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import LoadingButton from '@/components/LoadingButton';

import { useNewsletter } from '@/hooks/useNewsletter';
import type { NewsletterFormData } from '@/types/forms';

const Newsletter = () => {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const { subscribe, isSubmitting, errors } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    const formData = new FormData(e.currentTarget);
    const data: NewsletterFormData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      interests: [],
    };

    const success = await subscribe(data);
    if (success) {
      (e.target as HTMLFormElement).reset();
      setAcceptTerms(false);
    }
  };

  return (
    <section className="py-20 bg-muted/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">
              Newsletter Especializado M&A
            </CardTitle>
            <CardDescription className="text-lg">
              Recibe análisis exclusivos, tendencias del mercado y casos de éxito directamente en tu email
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newsletter-name">Nombre</Label>
                  <Input
                    id="newsletter-name"
                    name="name"
                    placeholder="Tu nombre"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newsletter-email">Email *</Label>
                  <Input
                    id="newsletter-email"
                    name="email"
                    type="email"
                    required
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-base font-medium">Intereses (opcional):</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { id: 'ma-trends', label: 'Tendencias M&A' },
                    { id: 'valuations', label: 'Valoraciones' },
                    { id: 'sector-analysis', label: 'Análisis Sectoriales' },
                    { id: 'success-cases', label: 'Casos de Éxito' },
                    { id: 'market-data', label: 'Datos de Mercado' },
                    { id: 'regulatory', label: 'Aspectos Regulatorios' },
                  ].map((interest) => (
                    <div key={interest.id} className="flex items-center space-x-2">
                      <Checkbox id={interest.id} name="interests" value={interest.id} />
                      <Label htmlFor={interest.id} className="text-sm">
                        {interest.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="newsletter-terms"
                  checked={acceptTerms}
                  onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                />
                <Label htmlFor="newsletter-terms" className="text-sm leading-relaxed">
                  Acepto recibir comunicaciones comerciales de Capittal y autorizo el tratamiento de mis datos según la política de privacidad. *
                </Label>
              </div>

              <LoadingButton
                type="submit"
                loading={isSubmitting}
                loadingText="Suscribiendo..."
                disabled={!acceptTerms}
                className="w-full"
              >
                Suscribirse al Newsletter
              </LoadingButton>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <span className="mr-2">📊</span>
                  Análisis semanales
                </span>
                <span className="flex items-center">
                  <span className="mr-2">🎯</span>
                  Contenido exclusivo
                </span>
                <span className="flex items-center">
                  <span className="mr-2">🔒</span>
                  Sin spam garantizado
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Newsletter;
