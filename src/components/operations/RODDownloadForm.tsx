import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Download, FileText, Table2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const formSchema = z.object({
  full_name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  email: z.string()
    .email('Email inválido')
    .max(254, 'Email demasiado largo'),
  phone: z.string().optional(),
  company: z.string().optional(),
  investor_type: z.enum([
    'individual',
    'family_office',
    'venture_capital',
    'private_equity',
    'corporate',
    'other'
  ]).optional(),
  investment_range: z.string().optional(),
  sectors_of_interest: z.string().optional(),
  preferred_location: z.string().optional(),
  document_format: z.enum(['pdf', 'excel']),
  document_language: z.enum(['es', 'en']).optional(),
  gdpr_consent: z.boolean().refine(val => val === true, {
    message: 'Debes aceptar la política de privacidad'
  }),
  marketing_consent: z.boolean().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface RODDownloadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RODDownloadForm: React.FC<RODDownloadFormProps> = ({ open, onOpenChange }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Obtener idiomas activos disponibles
  const { data: availableLanguages = [] } = useQuery({
    queryKey: ['rod-available-languages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('language')
        .eq('is_active', true)
        .eq('is_deleted', false);
      
      if (error) throw error;
      const languages = [...new Set(data?.map(d => d.language as 'es' | 'en') || [])];
      return languages;
    },
    enabled: open, // Solo ejecutar cuando el modal esté abierto
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      company: '',
      document_format: 'pdf',
      document_language: undefined,
      gdpr_consent: false,
      marketing_consent: false,
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      // Obtener datos de tracking
      const urlParams = new URLSearchParams(window.location.search);
      const trackingData = {
        referrer: document.referrer || undefined,
        utm_source: urlParams.get('utm_source') || undefined,
        utm_medium: urlParams.get('utm_medium') || undefined,
        utm_campaign: urlParams.get('utm_campaign') || undefined,
        utm_term: urlParams.get('utm_term') || undefined,
        utm_content: urlParams.get('utm_content') || undefined,
      };

      // Determinar idioma: si hay selector y el usuario eligió, usar ese; si solo hay 1, usar ese
      const selectedLanguage = data.document_language || 
        (availableLanguages.length === 1 ? availableLanguages[0] : 'es');

      // Llamar al edge function
      const { data: result, error } = await supabase.functions.invoke('generate-rod-document', {
        body: {
          ...data,
          language: selectedLanguage,
          ...trackingData,
        },
      });

      if (error) {
        console.error('Error generando ROD:', error);
        
        // Intentar extraer mensaje específico del servidor
        let errorMessage = 'Error al generar el documento';
        if (error.message) {
          try {
            const errorData = JSON.parse(error.message);
            errorMessage = errorData.message || errorMessage;
          } catch {
            errorMessage = error.message;
          }
        }
        
        throw new Error(errorMessage);
      }

      // Descargar automáticamente el documento
      if (result?.download_url) {
        window.open(result.download_url, '_blank');
      }

      toast({
        title: '¡Éxito!',
        description: `Tu ROD con ${result?.operations_count || 0} operaciones está listo. Te hemos enviado un email con el enlace de descarga.`,
      });

      // Cerrar el modal
      onOpenChange(false);
      form.reset();

    } catch (error: any) {
      console.error('Error en descarga ROD:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'No se pudo generar el documento. Por favor, inténtalo de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Descargar Relación de Open Deals
          </DialogTitle>
          <DialogDescription>
            Completa el formulario para acceder a nuestras oportunidades de inversión actuales
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Información Personal</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo *</Label>
                <Input
                  id="full_name"
                  {...form.register('full_name')}
                  placeholder="Juan Pérez"
                />
                {form.formState.errors.full_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.full_name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register('email')}
                  placeholder="juan@ejemplo.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.email.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  {...form.register('phone')}
                  placeholder="+34 600 000 000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Empresa</Label>
                <Input
                  id="company"
                  {...form.register('company')}
                  placeholder="Mi Empresa S.L."
                />
              </div>
            </div>
          </div>

          {/* Perfil de Inversor */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Perfil de Inversor</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="investor_type">Tipo de Inversor</Label>
                <Select
                  onValueChange={(value) => form.setValue('investor_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Inversor Individual</SelectItem>
                    <SelectItem value="family_office">Family Office</SelectItem>
                    <SelectItem value="venture_capital">Venture Capital</SelectItem>
                    <SelectItem value="private_equity">Private Equity</SelectItem>
                    <SelectItem value="corporate">Corporativo</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="investment_range">Rango de Inversión</Label>
                <Select
                  onValueChange={(value) => form.setValue('investment_range', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona rango" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="< 500K">Menos de 500K €</SelectItem>
                    <SelectItem value="500K - 1M">500K - 1M €</SelectItem>
                    <SelectItem value="1M - 5M">1M - 5M €</SelectItem>
                    <SelectItem value="5M - 10M">5M - 10M €</SelectItem>
                    <SelectItem value="> 10M">Más de 10M €</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectors_of_interest">Sectores de Interés</Label>
              <Textarea
                id="sectors_of_interest"
                {...form.register('sectors_of_interest')}
                placeholder="Tecnología, Salud, Retail..."
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_location">Ubicación Preferida</Label>
              <Input
                id="preferred_location"
                {...form.register('preferred_location')}
                placeholder="Madrid, Barcelona, Nacional..."
              />
            </div>
          </div>

          {/* Formato de Documento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Formato del Documento *</h3>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => form.setValue('document_format', 'pdf')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  form.watch('document_format') === 'pdf'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <FileText className="h-8 w-8" />
                <span className="font-medium">PDF</span>
              </button>
              
              <button
                type="button"
                onClick={() => form.setValue('document_format', 'excel')}
                className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                  form.watch('document_format') === 'excel'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Table2 className="h-8 w-8" />
                <span className="font-medium">Excel</span>
              </button>
            </div>
          </div>

          {/* Selector de Idioma del Documento - Solo si hay >1 idioma */}
          {availableLanguages.length > 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Idioma del Documento</h3>
              <p className="text-sm text-muted-foreground">
                El documento está disponible en varios idiomas
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => form.setValue('document_language', 'es')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    form.watch('document_language') === 'es'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">🇪🇸</span>
                  <span className="font-medium">Español</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => form.setValue('document_language', 'en')}
                  className={`p-4 border-2 rounded-lg flex flex-col items-center gap-2 transition-colors ${
                    form.watch('document_language') === 'en'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <span className="text-2xl">🇬🇧</span>
                  <span className="font-medium">English</span>
                </button>
              </div>
            </div>
          )}

          {/* Consentimientos GDPR */}
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="gdpr_consent"
                checked={form.watch('gdpr_consent')}
                onCheckedChange={(checked) => form.setValue('gdpr_consent', checked as boolean)}
              />
              <label htmlFor="gdpr_consent" className="text-sm leading-tight">
                Acepto la{' '}
                <a href="/politica-privacidad" target="_blank" className="text-primary underline">
                  política de privacidad
                </a>{' '}
                y el tratamiento de mis datos para el envío del documento solicitado. *
              </label>
            </div>
            {form.formState.errors.gdpr_consent && (
              <p className="text-sm text-destructive">
                {form.formState.errors.gdpr_consent.message}
              </p>
            )}

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing_consent"
                checked={form.watch('marketing_consent')}
                onCheckedChange={(checked) => form.setValue('marketing_consent', checked as boolean)}
              />
              <label htmlFor="marketing_consent" className="text-sm leading-tight">
                Deseo recibir información sobre nuevas oportunidades de inversión y comunicaciones de Capittal.
              </label>
            </div>
          </div>

          {/* Botón de Submit */}
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando documento...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Descargar ROD
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            * Campos obligatorios
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
