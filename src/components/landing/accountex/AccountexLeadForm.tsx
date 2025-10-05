import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const formSchema = z.object({
  full_name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  company: z
    .string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa no puede exceder 100 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .max(254, 'El email no puede exceder 254 caracteres'),
  phone: z.string().optional(),
  message: z.string().optional(),
  preferred_meeting_date: z.string().optional(),
  sectors_of_interest: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AccountexLeadFormProps {
  onSuccess?: () => void;
}

const AccountexLeadForm = ({ onSuccess }: AccountexLeadFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      company: '',
      email: '',
      phone: '',
      message: '',
      preferred_meeting_date: '',
      sectors_of_interest: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      // Tracking data
      const trackingData = {
        ip_address: null, // Will be set by database
        user_agent: navigator.userAgent,
        referrer: document.referrer || null,
        utm_source: new URLSearchParams(window.location.search).get('utm_source'),
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium'),
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign'),
      };

      // Insert to Supabase
      const { error } = await supabase.from('accountex_leads').insert([{
        full_name: values.full_name,
        company: values.company,
        email: values.email,
        phone: values.phone || null,
        message: values.message || null,
        preferred_meeting_date: values.preferred_meeting_date || null,
        sectors_of_interest: values.sectors_of_interest || null,
        ...trackingData,
      }]);

      if (error) throw error;

      toast({
        title: '¡Solicitud enviada!',
        description: 'Nos pondremos en contacto contigo pronto para confirmar tu reunión.',
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: 'No se pudo enviar tu solicitud. Por favor, inténtalo de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="full_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre completo *</FormLabel>
                <FormControl>
                  <Input placeholder="Tu nombre" {...field} />
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

        <div className="grid sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="tu@email.com" {...field} />
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
                  <Input placeholder="+34 695 717 490" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="preferred_meeting_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Día preferido (25 o 26 de marzo)</FormLabel>
              <FormControl>
                <Input placeholder="Ej: 25 de marzo por la mañana" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sectors_of_interest"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sectores de interés</FormLabel>
              <FormControl>
                <Input placeholder="Ej: Tecnología, Asesorías, Healthcare..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mensaje adicional</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Cuéntanos brevemente qué te gustaría tratar en la reunión..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isSubmitting ? 'Enviando...' : 'Reservar reunión'}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Al enviar este formulario, aceptas nuestra política de privacidad y el
          tratamiento de tus datos personales.
        </p>
      </form>
    </Form>
  );
};

export default AccountexLeadForm;
