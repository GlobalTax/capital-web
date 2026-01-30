import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { Check, Loader2, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
  icon?: React.ReactNode;
}

interface EditableSelectProps {
  value: string | null | undefined;
  options: SelectOption[];
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  displayClassName?: string;
  emptyText?: string;
  allowClear?: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

// Special value for "clear" option since Radix UI doesn't allow empty string values
const CLEAR_VALUE = "__clear__";

export const EditableSelect = React.memo<EditableSelectProps>(({
  value,
  options,
  onSave,
  placeholder = "Seleccionar...",
  disabled = false,
  className,
  displayClassName,
  emptyText = "—",
  allowClear = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const containerRef = useRef<HTMLDivElement>(null);

  const currentOption = options.find(opt => opt.value === value);
  const displayValue = currentOption?.label ?? '';
  const isEmpty = !value || value === '';

  const handleValueChange = useCallback(async (newValue: string) => {
    // Convert special clear value back to empty string
    const actualValue = newValue === CLEAR_VALUE ? '' : newValue;
    
    if (actualValue === value) {
      setIsOpen(false);
      return;
    }

    setSaveStatus('saving');
    setIsOpen(false);

    try {
      await onSave(actualValue);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('Error saving select:', error);
      setSaveStatus('error');
      
      // Show real error message to user
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al guardar', { description: errorMessage });
      
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [value, onSave]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative flex items-center gap-1 min-h-[28px]",
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      <Select
        value={value ?? undefined}
        onValueChange={handleValueChange}
        disabled={disabled || saveStatus === 'saving'}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger 
          className={cn(
            "h-7 text-sm py-0 px-2 min-w-[120px] border-transparent bg-transparent",
            "hover:bg-muted/50 hover:border-border transition-colors",
            "focus:ring-2 focus:ring-primary/50 focus:border-primary",
            "[&>span]:truncate [&>span]:max-w-[140px]",
            isEmpty && "text-muted-foreground",
            displayClassName
          )}
        >
          <SelectValue placeholder={placeholder}>
            {isEmpty ? emptyText : (
              <span className="flex items-center gap-1.5">
                {currentOption?.icon}
                {currentOption?.color && (
                  <span 
                    className="w-2 h-2 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: currentOption.color }} 
                  />
                )}
                {displayValue}
              </span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {allowClear && value && (
            <SelectItem value={CLEAR_VALUE}>
              <span className="text-muted-foreground">Sin asignar</span>
            </SelectItem>
          )}
          {options
            .filter(option => option.value && option.value !== '')
            .map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <span className="flex items-center gap-1.5">
                  {option.icon}
                  {option.color && (
                    <span 
                      className="w-2 h-2 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: option.color }} 
                    />
                  )}
                  {option.label}
                </span>
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {/* Save status indicators */}
      {saveStatus === 'saving' && (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground flex-shrink-0" />
      )}
      {saveStatus === 'success' && (
        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
      )}
      {saveStatus === 'error' && (
        <X className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
      )}
    </div>
  );
});

EditableSelect.displayName = "EditableSelect";
