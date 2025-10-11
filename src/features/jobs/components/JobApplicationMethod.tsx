import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { JobPostFormData } from '@/types/jobs';

interface JobApplicationMethodProps {
  control: Control<JobPostFormData>;
  watch: any;
  errors: any;
}

export const JobApplicationMethod: React.FC<JobApplicationMethodProps> = ({
  control,
  watch,
  errors,
}) => {
  const applicationMethod = watch('application_method');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Método de Aplicación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Método de aplicación */}
        <div>
          <Label htmlFor="application_method">¿Cómo aplicar? *</Label>
          <Controller
            name="application_method"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="internal">Sistema interno</SelectItem>
                  <SelectItem value="email">Email directo</SelectItem>
                  <SelectItem value="external_url">URL externa</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Email de aplicación */}
        {applicationMethod === 'email' && (
          <div>
            <Label htmlFor="application_email">Email de contacto *</Label>
            <Controller
              name="application_email"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="application_email"
                  type="email"
                  placeholder="rrhh@empresa.com"
                />
              )}
            />
            {errors.application_email && (
              <p className="text-sm text-destructive mt-1">
                {errors.application_email.message}
              </p>
            )}
          </div>
        )}

        {/* URL externa */}
        {applicationMethod === 'external_url' && (
          <div>
            <Label htmlFor="application_url">URL de aplicación *</Label>
            <Controller
              name="application_url"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="application_url"
                  type="url"
                  placeholder="https://empresa.com/apply"
                />
              )}
            />
            {errors.application_url && (
              <p className="text-sm text-destructive mt-1">
                {errors.application_url.message}
              </p>
            )}
          </div>
        )}

        {/* Fecha de cierre */}
        <div>
          <Label htmlFor="closes_at">Fecha de cierre (opcional)</Label>
          <Controller
            name="closes_at"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="closes_at"
                type="date"
                min={new Date().toISOString().split('T')[0]}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
