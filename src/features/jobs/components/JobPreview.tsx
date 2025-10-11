import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Briefcase, Euro } from 'lucide-react';
import type { JobPostFormData } from '@/types/jobs';

interface JobPreviewProps {
  formData: Partial<JobPostFormData>;
}

export const JobPreview: React.FC<JobPreviewProps> = ({ formData }) => {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'A negociar';
    if (min && max) return `${min.toLocaleString()}€ - ${max.toLocaleString()}€`;
    if (min) return `Desde ${min.toLocaleString()}€`;
    if (max) return `Hasta ${max.toLocaleString()}€`;
    return 'A negociar';
  };

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg">Vista Previa</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Título */}
        <div>
          <h3 className="font-bold text-xl">
            {formData.title || 'Título de la oferta'}
          </h3>
          {formData.short_description && (
            <p className="text-sm text-muted-foreground mt-2">
              {formData.short_description}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {formData.is_featured && (
            <Badge variant="default">Destacada</Badge>
          )}
          {formData.is_urgent && (
            <Badge variant="destructive">Urgente</Badge>
          )}
          {formData.is_remote && (
            <Badge variant="secondary">100% Remoto</Badge>
          )}
          {formData.is_hybrid && (
            <Badge variant="secondary">Híbrido</Badge>
          )}
        </div>

        {/* Detalles */}
        <div className="space-y-2 text-sm">
          {formData.location && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{formData.location}</span>
            </div>
          )}

          {formData.contract_type && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="capitalize">
                {formData.contract_type} · {formData.employment_type?.replace('_', ' ')}
              </span>
            </div>
          )}

          {formData.experience_level && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="capitalize">{formData.experience_level}</span>
            </div>
          )}

          {formData.is_salary_visible && (formData.salary_min || formData.salary_max) && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Euro className="h-4 w-4" />
              <span>{formatSalary(formData.salary_min, formData.salary_max)}</span>
            </div>
          )}
        </div>

        {/* Requisitos (preview) */}
        {formData.requirements && formData.requirements.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Requisitos</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              {formData.requirements.slice(0, 3).map((req, index) => (
                <li key={index}>• {req}</li>
              ))}
              {formData.requirements.length > 3 && (
                <li className="text-xs italic">
                  +{formData.requirements.length - 3} más...
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Idiomas */}
        {formData.required_languages && formData.required_languages.length > 0 && (
          <div>
            <h4 className="font-semibold text-sm mb-2">Idiomas</h4>
            <div className="flex flex-wrap gap-1">
              {formData.required_languages.map((lang, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
