import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import type { JobPostFormData } from '@/types/jobs';

interface JobBasicInfoProps {
  control: Control<JobPostFormData>;
  categories: any[];
  errors: any;
  onGenerateField?: (field: 'title' | 'short_description' | 'description') => void;
  isGenerating?: boolean;
}

export const JobBasicInfo: React.FC<JobBasicInfoProps> = ({
  control,
  categories,
  errors,
  onGenerateField,
  isGenerating,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Información Básica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="title">Título de la oferta *</Label>
            {onGenerateField && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onGenerateField('title')}
                disabled={isGenerating}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                IA
              </Button>
            )}
          </div>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input {...field} id="title" placeholder="Ej: Desarrollador Full Stack Senior" />
            )}
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="category_id">Categoría</Label>
          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="short_description">Descripción corta *</Label>
            {onGenerateField && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onGenerateField('short_description')}
                disabled={isGenerating}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                IA
              </Button>
            )}
          </div>
          <Controller
            name="short_description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="short_description"
                placeholder="Resumen breve de la oferta"
                rows={2}
              />
            )}
          />
          {errors.short_description && (
            <p className="text-sm text-destructive mt-1">{errors.short_description.message}</p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="description">Descripción completa *</Label>
            {onGenerateField && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onGenerateField('description')}
                disabled={isGenerating}
              >
                <Sparkles className="mr-1 h-3 w-3" />
                Generar
              </Button>
            )}
          </div>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                id="description"
                placeholder="Descripción detallada de la posición"
                rows={6}
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
