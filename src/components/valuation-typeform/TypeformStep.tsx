// ============= TYPEFORM STEP COMPONENT =============
// Componente para renderizar un paso completo con múltiples campos

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TypeformStep as StepConfig, TypeformField, interpolateText } from './questions.config';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ExtendedCompanyData } from '@/features/valuation/types/unified.types';

interface TypeformStepProps {
  step: StepConfig;
  companyData: Partial<ExtendedCompanyData>;
  onChange: (field: keyof ExtendedCompanyData, value: any) => void;
  onNext: () => void;
  onPrev: () => void;
  errors: Record<string, string>;
  showErrors: boolean;
  isFirst: boolean;
  isLast: boolean;
}

export const TypeformStep: React.FC<TypeformStepProps> = ({
  step,
  companyData,
  onChange,
  onNext,
  onPrev,
  errors,
  showErrors,
  isFirst,
  isLast
}) => {
  const [localData, setLocalData] = useState<Record<string, any>>(
    step.fields.reduce((acc, field) => {
      acc[field.field] = companyData[field.field] || '';
      return acc;
    }, {} as Record<string, any>)
  );

  const handleFieldChange = (field: keyof ExtendedCompanyData, value: any) => {
    setLocalData(prev => ({ ...prev, [field]: value }));
    onChange(field, value);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    // Validar campos requeridos
    const missingRequired = step.fields
      .filter(f => f.required)
      .some(f => !localData[f.field] || localData[f.field] === '');

    if (!missingRequired) {
      onNext();
    }
  };

  const canContinue = step.fields
    .filter(f => f.required)
    .every(f => localData[f.field] && localData[f.field] !== '');

  const renderField = (field: TypeformField, index: number) => {
    const value = localData[field.field] || '';
    const error = showErrors ? errors[field.field] : undefined;

    return (
      <motion.div
        key={field.field}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="space-y-2"
      >
        <Label htmlFor={field.field} className="text-base font-medium">
          {field.label}
          {!field.required && <span className="text-muted-foreground ml-2">(opcional)</span>}
        </Label>

        {field.type === 'select' ? (
          <Select 
            value={value} 
            onValueChange={(v) => handleFieldChange(field.field, v)}
          >
            <SelectTrigger 
              id={field.field}
              className="w-full h-12 text-base"
            >
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(opt => (
                <SelectItem 
                  key={opt.value} 
                  value={opt.value} 
                  className="text-base py-3"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field.field}
            type={field.type}
            value={value}
            onChange={(e) => handleFieldChange(field.field, e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={field.placeholder}
            className="w-full h-12 text-base"
            autoFocus={index === 0}
          />
        )}

        {field.hint && !error && (
          <p className="text-sm text-muted-foreground">{field.hint}</p>
        )}

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="w-full max-w-2xl mx-auto px-4"
    >
      {/* Header */}
      <div className="mb-8">
        <div className="text-6xl mb-4">{step.emoji}</div>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          {interpolateText(step.title, companyData)}
        </h2>
        {step.subtitle && (
          <p className="text-lg text-muted-foreground">
            {interpolateText(step.subtitle, companyData)}
          </p>
        )}
      </div>

      {/* Fields */}
      <div className="space-y-6 mb-8">
        {step.fields.map((field, index) => renderField(field, index))}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {!isFirst && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrev}
            className="flex-1 h-12"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Atrás
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          disabled={!canContinue}
          className="flex-1 h-12"
        >
          {isLast ? 'Calcular valoración' : 'Continuar'}
          {!isLast && <ChevronRight className="ml-2 h-4 w-4" />}
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-sm text-muted-foreground mt-4">
        Presiona <kbd className="px-2 py-1 bg-muted rounded text-xs">Enter ↵</kbd> para continuar
      </p>
    </motion.div>
  );
};
