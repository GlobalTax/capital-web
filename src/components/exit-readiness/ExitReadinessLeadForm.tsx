import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Lock } from 'lucide-react';

const leadFormSchema = z.object({
  email: z.string().email('Introduce un email válido'),
  name: z.string().min(2, 'El nombre es obligatorio'),
  phone: z.string().optional(),
  company_name: z.string().optional()
});

type LeadFormData = z.infer<typeof leadFormSchema>;

interface ExitReadinessLeadFormProps {
  onSubmit: (data: LeadFormData) => void;
  isLoading: boolean;
  totalScore: number;
}

const ExitReadinessLeadForm: React.FC<ExitReadinessLeadFormProps> = ({
  onSubmit,
  isLoading,
  totalScore
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema)
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">
          ¡Test completado!
        </h3>
        <p className="text-muted-foreground">
          Tu puntuación: <strong>{totalScore}/80</strong>
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Introduce tus datos para ver el resultado detallado y recomendaciones personalizadas
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            {...register('name')}
            placeholder="Tu nombre completo"
            className={errors.name ? 'border-destructive' : ''}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="tu@email.com"
            className={errors.email ? 'border-destructive' : ''}
          />
          {errors.email && (
            <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Teléfono (opcional)</Label>
          <Input
            id="phone"
            type="tel"
            {...register('phone')}
            placeholder="+34 600 000 000"
          />
        </div>

        <div>
          <Label htmlFor="company_name">Nombre de la empresa (opcional)</Label>
          <Input
            id="company_name"
            {...register('company_name')}
            placeholder="Tu empresa S.L."
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            'Ver mis resultados'
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Al enviar, aceptas nuestra{' '}
          <a href="/politica-privacidad" className="underline hover:text-foreground">
            política de privacidad
          </a>
        </p>
      </form>
    </div>
  );
};

export default ExitReadinessLeadForm;
