import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useJobApplications } from '@/hooks/useJobApplications';
import { Upload } from 'lucide-react';

const applicationSchema = z.object({
  full_name: z.string().min(2, 'Nombre requerido').max(100),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  linkedin_url: z.string().url('URL inválida').optional().or(z.literal('')),
  current_location: z.string().optional(),
  willing_to_relocate: z.boolean().default(false),
  years_of_experience: z.number().optional(),
  current_position: z.string().optional(),
  current_company: z.string().optional(),
  cover_letter: z.string().optional(),
  availability: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface JobApplicationDialogProps {
  jobPostId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const JobApplicationDialog: React.FC<JobApplicationDialogProps> = ({
  jobPostId,
  jobTitle,
  open,
  onOpenChange,
}) => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const { submitApplication, isSubmitting } = useJobApplications();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      willing_to_relocate: false,
    },
  });

  const onSubmit = (data: ApplicationFormData) => {
    submitApplication(
      {
        jobPostId,
        formData: {
          ...data,
          full_name: data.full_name,
          email: data.email,
          willing_to_relocate: data.willing_to_relocate,
        },
        cvFile: cvFile || undefined,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Aplicar a: {jobTitle}</DialogTitle>
          <DialogDescription>
            Completa el formulario para enviar tu solicitud
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="font-semibold">Información Personal</h3>
            
            <div>
              <Label htmlFor="full_name">Nombre completo *</Label>
              <Input id="full_name" {...register('full_name')} />
              {errors.full_name && (
                <p className="text-sm text-destructive mt-1">{errors.full_name.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && (
                  <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Teléfono</Label>
                <Input id="phone" {...register('phone')} />
              </div>
            </div>

            <div>
              <Label htmlFor="linkedin_url">LinkedIn</Label>
              <Input id="linkedin_url" placeholder="https://linkedin.com/in/..." {...register('linkedin_url')} />
              {errors.linkedin_url && (
                <p className="text-sm text-destructive mt-1">{errors.linkedin_url.message}</p>
              )}
            </div>
          </div>

          {/* Experiencia */}
          <div className="space-y-4">
            <h3 className="font-semibold">Experiencia Profesional</h3>
            
            <div>
              <Label htmlFor="current_position">Puesto actual</Label>
              <Input id="current_position" {...register('current_position')} />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="current_company">Empresa actual</Label>
                <Input id="current_company" {...register('current_company')} />
              </div>
              <div>
                <Label htmlFor="years_of_experience">Años de experiencia</Label>
                <Input
                  id="years_of_experience"
                  type="number"
                  {...register('years_of_experience', { valueAsNumber: true })}
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div className="space-y-4">
            <h3 className="font-semibold">Ubicación</h3>
            
            <div>
              <Label htmlFor="current_location">Ubicación actual</Label>
              <Input id="current_location" {...register('current_location')} />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="willing_to_relocate"
                checked={watch('willing_to_relocate')}
                onCheckedChange={(checked) => setValue('willing_to_relocate', checked)}
              />
              <Label htmlFor="willing_to_relocate">Dispuesto/a a reubicarse</Label>
            </div>
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <Label htmlFor="cv">Curriculum Vitae (PDF) *</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                id="cv"
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setCvFile(file);
                }}
                className="hidden"
              />
              <label htmlFor="cv" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {cvFile ? cvFile.name : 'Click para subir tu CV (PDF, max 5MB)'}
                </p>
              </label>
            </div>
          </div>

          {/* Carta de Presentación */}
          <div>
            <Label htmlFor="cover_letter">Carta de presentación</Label>
            <Textarea
              id="cover_letter"
              {...register('cover_letter')}
              rows={5}
              placeholder="Cuéntanos por qué eres el candidato ideal para este puesto..."
            />
          </div>

          {/* Disponibilidad */}
          <div>
            <Label htmlFor="availability">Disponibilidad</Label>
            <Select onValueChange={(value) => setValue('availability', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona tu disponibilidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Inmediata</SelectItem>
                <SelectItem value="2_weeks">2 semanas</SelectItem>
                <SelectItem value="1_month">1 mes</SelectItem>
                <SelectItem value="to_negotiate">A negociar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !cvFile}>
              {isSubmitting ? 'Enviando...' : 'Enviar solicitud'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
