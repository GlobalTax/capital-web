import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Send, Shield, Clock, Users } from 'lucide-react';
import { leadFormConfig } from '@/data/suiteloop-data';

const leadSchema = z.object({
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  despacho: z.string().min(2, "El nombre del despacho es requerido"),
  tipoDespacho: z.string().min(1, "Selecciona el tipo de despacho"),
  numPymes: z.string().min(1, "Selecciona el número de clientes"),
  mensaje: z.string().optional(),
  consent: z.boolean().refine(val => val === true, "Debes aceptar la política de privacidad")
});

type LeadFormData = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSuccess?: () => void;
  title?: string;
  description?: string;
  source?: string;
}

export const LeadForm: React.FC<LeadFormProps> = ({ 
  onSuccess, 
  title = "Solicita información",
  description = "Te contactamos en menos de 24h para mostrarte SuiteLoop",
  source = "landing_suiteloop"
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      nombre: '',
      email: '',
      telefono: '',
      despacho: '',
      tipoDespacho: '',
      numPymes: '',
      mensaje: '',
      consent: false
    }
  });

  const onSubmit = async (data: LeadFormData) => {
    setIsSubmitting(true);
    
    try {
      // Simulate API call - replace with actual endpoint
      const leadData = {
        ...data,
        source,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      };

      console.log('Lead captured:', leadData);
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Analytics tracking
      if ((window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'lead_submit',
          source: source,
          lead_type: 'suiteloop_demo',
          despacho_tipo: data.tipoDespacho,
          num_pymes: data.numPymes
        });
      }

      toast({
        title: "¡Solicitud enviada correctamente!",
        description: "Te contactaremos en las próximas 24 horas para agendar tu demo personalizada.",
      });

      form.reset();
      onSuccess?.();

    } catch (error) {
      console.error('Error submitting lead:', error);
      toast({
        title: "Error al enviar la solicitud",
        description: "Por favor, inténtalo de nuevo o contáctanos directamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-center">
          {title}
        </DialogTitle>
        <DialogDescription className="text-center text-base">
          {description}
        </DialogDescription>
      </DialogHeader>

      {/* Trust Badges */}
      <div className="flex justify-center gap-4 text-xs">
        <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Demo 30 min
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          +200 asesorías
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          <Shield className="w-3 h-3" />
          ISO 27001
        </Badge>
      </div>

      {/* Form */}
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              {...form.register('nombre')}
              placeholder="Tu nombre completo"
              className={form.formState.errors.nombre ? 'border-red-500' : ''}
            />
            {form.formState.errors.nombre && (
              <p className="text-sm text-red-500">{form.formState.errors.nombre.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email corporativo *</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email')}
              placeholder="tu.email@despacho.com"
              className={form.formState.errors.email ? 'border-red-500' : ''}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Teléfono */}
          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              {...form.register('telefono')}
              placeholder="+34 600 000 000"
            />
          </div>

          {/* Despacho */}
          <div className="space-y-2">
            <Label htmlFor="despacho">Nombre del despacho *</Label>
            <Input
              id="despacho"
              {...form.register('despacho')}
              placeholder="Nombre de tu asesoría"
              className={form.formState.errors.despacho ? 'border-red-500' : ''}
            />
            {form.formState.errors.despacho && (
              <p className="text-sm text-red-500">{form.formState.errors.despacho.message}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Tipo Despacho */}
          <div className="space-y-2">
            <Label>Tipo de despacho *</Label>
            <Select onValueChange={(value) => form.setValue('tipoDespacho', value)}>
              <SelectTrigger className={form.formState.errors.tipoDespacho ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona tamaño" />
              </SelectTrigger>
              <SelectContent>
                {leadFormConfig.fields.find(f => f.name === 'tipoDespacho')?.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.tipoDespacho && (
              <p className="text-sm text-red-500">{form.formState.errors.tipoDespacho.message}</p>
            )}
          </div>

          {/* Número PYMEs */}
          <div className="space-y-2">
            <Label>Nº clientes PYMEs aprox. *</Label>
            <Select onValueChange={(value) => form.setValue('numPymes', value)}>
              <SelectTrigger className={form.formState.errors.numPymes ? 'border-red-500' : ''}>
                <SelectValue placeholder="Selecciona rango" />
              </SelectTrigger>
              <SelectContent>
                {leadFormConfig.fields.find(f => f.name === 'numPymes')?.options?.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.numPymes && (
              <p className="text-sm text-red-500">{form.formState.errors.numPymes.message}</p>
            )}
          </div>
        </div>

        {/* Mensaje */}
        <div className="space-y-2">
          <Label htmlFor="mensaje">¿Qué te interesa más de SuiteLoop?</Label>
          <Textarea
            id="mensaje"
            {...form.register('mensaje')}
            placeholder="Portal cliente, OCR automático, tesorería PSD2, compliance SIF..."
            rows={3}
          />
        </div>

        {/* Consent */}
        <div className="flex items-start space-x-3">
          <Checkbox
            id="consent"
            checked={form.watch('consent')}
            onCheckedChange={(checked) => form.setValue('consent', !!checked)}
            className={form.formState.errors.consent ? 'border-red-500' : ''}
          />
          <div className="space-y-1 leading-none">
            <Label 
              htmlFor="consent" 
              className="text-sm cursor-pointer"
            >
              Acepto la{' '}
              <a href="/politica-privacidad" className="text-primary hover:underline" target="_blank">
                política de privacidad
              </a>{' '}
              y el tratamiento de mis datos para recibir información comercial *
            </Label>
            {form.formState.errors.consent && (
              <p className="text-sm text-red-500">{form.formState.errors.consent.message}</p>
            )}
          </div>
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Enviando solicitud...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Solicitar demo personalizada
            </>
          )}
        </Button>

        {/* Footer */}
        <p className="text-xs text-muted-foreground text-center">
          📞 También puedes llamarnos directamente al <strong>+34 695 717 490</strong>
        </p>
      </form>
    </div>
  );
};