// ============= FORM FIELD COMPONENT =============
// Standardized form field with validation and error handling

import React from 'react';
import { UseFormRegisterReturn, FieldError } from 'react-hook-form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'password';
  placeholder?: string;
  required?: boolean;
  error?: FieldError;
  register?: UseFormRegisterReturn;
  className?: string;
  description?: string;
  disabled?: boolean;
}

export const FormField = ({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  register,
  className,
  description,
  disabled = false,
}: FormFieldProps) => {
  const fieldId = `field-${name}`;
  
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      
      {type === 'textarea' ? (
        <Textarea
          id={fieldId}
          placeholder={placeholder}
          {...register}
          disabled={disabled}
          className={cn(
            "min-h-[80px]",
            error && "border-destructive focus:border-destructive"
          )}
        />
      ) : (
        <Input
          id={fieldId}
          type={type}
          placeholder={placeholder}
          {...register}
          disabled={disabled}
          className={cn(
            error && "border-destructive focus:border-destructive"
          )}
        />
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      {error && (
        <p className="text-sm text-destructive">{error.message}</p>
      )}
    </div>
  );
};