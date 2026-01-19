import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X, FileText, Loader2 } from 'lucide-react';
import { useLeadForms } from '@/hooks/useLeadForms';
import { cn } from '@/lib/utils';

interface LeadFormSelectProps {
  value: string | null;
  onChange: (value: string | null) => void;
  disabled?: boolean;
  allowClear?: boolean;
  className?: string;
}

export function LeadFormSelect({
  value,
  onChange,
  disabled = false,
  allowClear = true,
  className,
}: LeadFormSelectProps) {
  const { forms, isLoading } = useLeadForms();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 h-9">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Cargando...</span>
      </div>
    );
  }

  const selectedForm = forms.find(f => f.id === value);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={value || ''}
        onValueChange={(val) => onChange(val || null)}
        disabled={disabled}
      >
        <SelectTrigger className="w-full h-9 text-sm">
          <FileText className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
          <SelectValue placeholder="Sin formulario" />
        </SelectTrigger>
        <SelectContent>
          {forms.map((form) => (
            <SelectItem key={form.id} value={form.id}>
              <span className="text-sm">{form.name}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {allowClear && value && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
          onClick={() => onChange(null)}
          disabled={disabled}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
