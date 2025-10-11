import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type { JobPostFormData } from '@/types/jobs';

interface JobLocationSalaryProps {
  control: Control<JobPostFormData>;
  errors: any;
}

export const JobLocationSalary: React.FC<JobLocationSalaryProps> = ({
  control,
  errors,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubicación y Compensación</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ubicación */}
        <div>
          <Label htmlFor="location">Ubicación *</Label>
          <Controller
            name="location"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="location"
                placeholder="Ej: Madrid, Barcelona, Remoto"
              />
            )}
          />
          {errors.location && (
            <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
          )}
        </div>

        {/* Trabajo remoto */}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_remote">Trabajo 100% remoto</Label>
          <Controller
            name="is_remote"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_remote"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Trabajo híbrido */}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_hybrid">Trabajo híbrido</Label>
          <Controller
            name="is_hybrid"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_hybrid"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Tipo de contrato */}
        <div>
          <Label htmlFor="contract_type">Tipo de contrato *</Label>
          <Controller
            name="contract_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de contrato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="indefinido">Indefinido</SelectItem>
                  <SelectItem value="temporal">Temporal</SelectItem>
                  <SelectItem value="practicas">Prácticas</SelectItem>
                  <SelectItem value="freelance">Freelance</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Tipo de empleo */}
        <div>
          <Label htmlFor="employment_type">Tipo de jornada *</Label>
          <Controller
            name="employment_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo de jornada" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">Tiempo completo</SelectItem>
                  <SelectItem value="part_time">Tiempo parcial</SelectItem>
                  <SelectItem value="contract">Por contrato</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Nivel de experiencia */}
        <div>
          <Label htmlFor="experience_level">Nivel de experiencia</Label>
          <Controller
            name="experience_level"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona nivel" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="mid">Mid-level</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        {/* Sector */}
        <div>
          <Label htmlFor="sector">Sector</Label>
          <Controller
            name="sector"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                id="sector"
                placeholder="Ej: Tecnología, Finanzas, Salud"
              />
            )}
          />
        </div>

        {/* Rango salarial */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="salary_min">Salario mínimo (€/año)</Label>
            <Controller
              name="salary_min"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="salary_min"
                  type="number"
                  placeholder="30000"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
          </div>
          <div>
            <Label htmlFor="salary_max">Salario máximo (€/año)</Label>
            <Controller
              name="salary_max"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  id="salary_max"
                  type="number"
                  placeholder="50000"
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                />
              )}
            />
          </div>
        </div>

        {/* Mostrar salario */}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_salary_visible">Mostrar salario públicamente</Label>
          <Controller
            name="is_salary_visible"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_salary_visible"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Oferta destacada */}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_featured">Oferta destacada</Label>
          <Controller
            name="is_featured"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_featured"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>

        {/* Oferta urgente */}
        <div className="flex items-center justify-between">
          <Label htmlFor="is_urgent">Oferta urgente</Label>
          <Controller
            name="is_urgent"
            control={control}
            render={({ field }) => (
              <Switch
                id="is_urgent"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};
