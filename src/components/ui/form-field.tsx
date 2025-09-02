import React, { memo, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  help?: string;
  isValid?: boolean;
  isTouched?: boolean;
  showValidation?: boolean;
  options?: Array<{ value: string; label: string }>;
  min?: number;
  step?: number;
  className?: string;
  selectClassName?: string;
}

const CustomFormField = memo<FormFieldProps>(({
  id,
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  help,
  isValid = false,
  isTouched = false,
  showValidation = false,
  options = [],
  min,
  step,
  className,
  selectClassName
}) => {
  const shouldShowValidation = showValidation || isTouched;
  const hasError = shouldShowValidation && Boolean(error);
  const shouldShowSuccess = shouldShowValidation && isValid && !error;

  const fieldClassName = useMemo(() => {
    let classes = 'form-field-input';
    
    if (hasError) {
      classes += ' border-destructive focus:border-destructive';
    } else if (shouldShowSuccess) {
      classes += ' border-success focus:border-success';
    }
    
    return cn(classes, className);
  }, [hasError, shouldShowSuccess, className]);

  const renderInput = () => {
    switch (type) {
      case 'textarea':
        return (
          <div className="relative">
            <Textarea
              id={id}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onBlur={onBlur}
              placeholder={placeholder}
              className={cn(fieldClassName, 'min-h-[100px]')}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            <Check 
              className={cn('form-field-icon text-success', shouldShowSuccess && 'show')} 
              style={{ top: '12px' }}
            />
          </div>
        );
      
      case 'select':
        return (
          <div className="relative">
            <Select value={String(value)} onValueChange={onChange}>
              <SelectTrigger 
                className={cn(fieldClassName, selectClassName)}
                aria-describedby={error ? `${id}-error` : undefined}
              >
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Check 
              className={cn('form-field-icon text-success pointer-events-none z-10', shouldShowSuccess && 'show')} 
              style={{ right: '32px' }}
            />
          </div>
        );
      
      default:
        return (
          <div className="relative">
            <Input
              id={id}
              type={type}
              value={value}
              onChange={(e) => {
                const val = type === 'number' ? (parseFloat(e.target.value) || 0) : e.target.value;
                onChange(val);
              }}
              onBlur={onBlur}
              placeholder={placeholder}
              className={fieldClassName}
              min={min}
              step={step}
              aria-describedby={error ? `${id}-error` : undefined}
            />
            <Check 
              className={cn('form-field-icon text-success', shouldShowSuccess && 'show')} 
            />
          </div>
        );
    }
  };

  return (
    <div className="form-field">
      <Label htmlFor={id} className="text-sm font-medium text-foreground mb-2 block">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      
      {renderInput()}
      
      <div className="form-field-error">
        {hasError && (
          <p id={`${id}-error`} role="alert">
            {error}
          </p>
        )}
      </div>
      
      <div className="form-field-help">
        {!hasError && help && (
          <p>{help}</p>
        )}
      </div>
    </div>
  );
});

CustomFormField.displayName = 'CustomFormField';

export default CustomFormField;