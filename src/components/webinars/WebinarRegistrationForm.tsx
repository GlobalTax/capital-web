import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Webinar, useWebinarRegistration } from '@/hooks/useWebinars';
import { useSimpleFormTracking } from '@/hooks/useSimpleFormTracking';

const formSchema = z.object({
  full_name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Ingresa un email válido'),
  phone: z.string().optional(),
  company: z.string().min(2, 'La empresa debe tener al menos 2 caracteres'),
  job_title: z.string().optional(),
  sector: z.string().optional(),
  years_experience: z.string().optional(),
  specific_interests: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface WebinarRegistrationFormProps {
  webinar: Webinar | null;
  isOpen: boolean;
  onClose: () => void;
}

const SECTORS = [
  'Tecnología',
  'Salud y Farmacéutico',
  'Retail y E-commerce',
  'Servicios Financieros',
  'Manufactura',
  'Energía y Renovables',
  'Real Estate',
  'Educación',
  'Alimentación y Bebidas',
  'Consultoría',
  'Otros'
];

const EXPERIENCE_RANGES = [
  'Menos de 1 año',
  '1-3 años',
  '3-5 años',
  '5-10 años',
  'Más de 10 años'
];

export const WebinarRegistrationForm: React.FC<WebinarRegistrationFormProps> = ({
  webinar,
  isOpen,
  onClose
}) => {
  const { registerForWebinar, isPending } = useWebinarRegistration();
  const { trackFormSubmission, trackFormInteraction } = useSimpleFormTracking();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      company: '',
      job_title: '',
      sector: '',
      years_experience: '',
      specific_interests: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!webinar) return;

    try {
      // Capture UTM and referrer data
      const urlParams = new URLSearchParams(window.location.search);
      const utm_source = urlParams.get('utm_source') || undefined;
      const utm_medium = urlParams.get('utm_medium') || undefined;
      const utm_campaign = urlParams.get('utm_campaign') || undefined;
      const referrer = document.referrer || undefined;

      await registerForWebinar({
        webinar_id: webinar.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        job_title: data.job_title,
        sector: data.sector,
        years_experience: data.years_experience,
        specific_interests: data.specific_interests,
        utm_source,
        utm_medium,
        utm_campaign,
        referrer,
        user_agent: navigator.userAgent,
      });

      // Track form submission
      trackFormSubmission('webinar_registration', {
        webinar_id: webinar.id,
        webinar_title: webinar.title,
        category: webinar.category,
        sector: data.sector,
        company: data.company
      });

      form.reset();
      onClose();
    } catch (error) {
      console.error('Error registering for webinar:', error);
    }
  };

  const handleFieldFocus = (fieldName: string) => {
    trackFormInteraction('webinar_registration', fieldName);
  };

  if (!webinar) return null;

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrarse para el Webinar</DialogTitle>
          <DialogDescription>
            Completa tus datos para registrarte en este webinar
          </DialogDescription>
        </DialogHeader>

        {/* Webinar Summary */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">{webinar.title}</h4>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CalendarDays className="h-4 w-4" />
              {formatDate(webinar.webinar_date)}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {webinar.duration_minutes} min
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            {webinar.speaker_name} · {webinar.speaker_title}
          </div>
          <Badge variant="outline" className="text-xs">
            {webinar.category}
          </Badge>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Tu nombre completo" 
                        {...field} 
                        onFocus={() => handleFieldFocus('full_name')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="tu@email.com" 
                        {...field} 
                        onFocus={() => handleFieldFocus('email')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nombre de tu empresa" 
                        {...field} 
                        onFocus={() => handleFieldFocus('company')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Tu cargo en la empresa" 
                        {...field} 
                        onFocus={() => handleFieldFocus('job_title')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="+34 600 000 000" 
                        {...field} 
                        onFocus={() => handleFieldFocus('phone')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger onFocus={() => handleFieldFocus('sector')}>
                          <SelectValue placeholder="Selecciona tu sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {SECTORS.map((sector) => (
                          <SelectItem key={sector} value={sector}>
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="years_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Años de experiencia en M&A</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger onFocus={() => handleFieldFocus('years_experience')}>
                        <SelectValue placeholder="Selecciona tu experiencia" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {EXPERIENCE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="specific_interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intereses específicos</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="¿Hay algún tema específico del webinar que te interese más?"
                      {...field} 
                      onFocus={() => handleFieldFocus('specific_interests')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} className="flex-1">
                {isPending ? 'Registrando...' : 'Registrarse'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};