import React from 'react';
import { Control, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, X } from 'lucide-react';
import type { JobPostFormData } from '@/types/jobs';
import type { useJobListManagement } from '../hooks/useJobListManagement';

interface JobRequirementsProps {
  control: Control<JobPostFormData>;
  watch: any;
  errors: any;
  listManagement: ReturnType<typeof useJobListManagement>;
}

export const JobRequirements: React.FC<JobRequirementsProps> = ({
  control,
  watch,
  errors,
  listManagement,
}) => {
  const {
    newRequirement,
    setNewRequirement,
    newResponsibility,
    setNewResponsibility,
    newBenefit,
    setNewBenefit,
    newLanguage,
    setNewLanguage,
    addItem,
    removeItem,
  } = listManagement;

  const requirements = watch('requirements') || [];
  const responsibilities = watch('responsibilities') || [];
  const benefits = watch('benefits') || [];
  const languages = watch('required_languages') || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Requisitos y Responsabilidades</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Requisitos */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Requisitos * (mínimo 1)
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newRequirement}
              onChange={(e) => setNewRequirement(e.target.value)}
              placeholder="Ej: 3+ años de experiencia en React"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem('requirement', newRequirement);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => addItem('requirement', newRequirement)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requirements.map((req: string, index: number) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {req}
                <button
                  type="button"
                  onClick={() => removeItem('requirements', index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {errors.requirements && (
            <p className="text-sm text-destructive mt-1">{errors.requirements.message}</p>
          )}
        </div>

        {/* Responsabilidades */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Responsabilidades * (mínimo 1)
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newResponsibility}
              onChange={(e) => setNewResponsibility(e.target.value)}
              placeholder="Ej: Desarrollar nuevas funcionalidades"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem('responsibility', newResponsibility);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => addItem('responsibility', newResponsibility)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {responsibilities.map((resp: string, index: number) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {resp}
                <button
                  type="button"
                  onClick={() => removeItem('responsibilities', index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          {errors.responsibilities && (
            <p className="text-sm text-destructive mt-1">{errors.responsibilities.message}</p>
          )}
        </div>

        {/* Beneficios */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Beneficios (opcional)
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              placeholder="Ej: Trabajo remoto flexible"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem('benefit', newBenefit);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => addItem('benefit', newBenefit)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {benefits.map((benefit: string, index: number) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {benefit}
                <button
                  type="button"
                  onClick={() => removeItem('benefits', index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Idiomas requeridos */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Idiomas requeridos (opcional)
          </label>
          <div className="flex gap-2 mb-3">
            <Input
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              placeholder="Ej: Inglés C1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addItem('language', newLanguage);
                }
              }}
            />
            <Button
              type="button"
              size="icon"
              onClick={() => addItem('language', newLanguage)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang: string, index: number) => (
              <Badge key={index} variant="secondary" className="gap-1">
                {lang}
                <button
                  type="button"
                  onClick={() => removeItem('required_languages', index)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
