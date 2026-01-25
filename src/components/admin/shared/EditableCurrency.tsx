import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Loader2, X, Pencil } from "lucide-react";
import { CurrencyInput } from "@/components/ui/currency-input";
import { cn } from "@/lib/utils";
import { formatNumberWithDots } from "@/utils/numberFormatting";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface EditableCurrencyProps {
  value: number | null | undefined;
  onSave: (newValue: number) => Promise<void>;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  emptyText?: string;
  compact?: boolean;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

const formatCompactCurrency = (value: number, suffix: string = '€'): string => {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M${suffix}`;
  }
  if (value >= 1_000) {
    const thousands = value / 1_000;
    return `${thousands.toFixed(thousands % 1 === 0 ? 0 : 0)}K${suffix}`;
  }
  return `${formatNumberWithDots(value)}${suffix}`;
};

export const EditableCurrency: React.FC<EditableCurrencyProps> = ({
  value,
  onSave,
  suffix = "€",
  placeholder = "0",
  disabled = false,
  className,
  displayClassName,
  inputClassName,
  emptyText = "—",
  compact = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value ?? 0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync edit value when external value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value ?? 0);
    }
  }, [value, isEditing]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = useCallback(() => {
    console.log('EditableCurrency: handleStartEdit', { disabled, value });
    if (disabled) return;
    setIsEditing(true);
    setSaveStatus('idle');
  }, [disabled, value]);

  const handleCancel = useCallback(() => {
    setEditValue(value ?? 0);
    setIsEditing(false);
    setSaveStatus('idle');
  }, [value]);

  const handleSave = useCallback(async () => {
    const originalValue = value ?? 0;
    
    // No change, just close
    if (editValue === originalValue) {
      setIsEditing(false);
      return;
    }

    setSaveStatus('saving');
    
    try {
      await onSave(editValue);
      setSaveStatus('success');
      setIsEditing(false);
      
      // Reset status after a brief moment
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('Error saving currency:', error);
      setSaveStatus('error');
      // Keep editing mode open on error
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  }, [editValue, value, onSave]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  }, [handleSave, handleCancel]);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    // Check if focus is moving outside the container
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      handleSave();
    }
  }, [handleSave]);

  const displayValue = value ?? 0;
  const isEmpty = displayValue === 0;

  if (isEditing) {
    return (
      <div 
        ref={containerRef}
        className={cn("flex items-center gap-1", className)}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <CurrencyInput
          ref={inputRef}
          value={editValue}
          onChange={setEditValue}
          suffix={suffix}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "h-7 text-sm py-0 px-2 min-w-[100px] max-w-[120px]",
            "ring-2 ring-primary/50 border-primary",
            inputClassName
          )}
          disabled={saveStatus === 'saving'}
        />
        {saveStatus === 'saving' && (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
        )}
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          ref={containerRef}
          className={cn(
            "group relative flex items-center gap-1 cursor-pointer min-h-[28px] px-1 -mx-1 rounded",
            "hover:bg-muted/50 transition-colors",
            isEmpty && "border border-dashed border-muted-foreground/40 px-2",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            handleStartEdit();
          }}
        >
          <span 
            className={cn(
              "text-sm font-medium tabular-nums",
              isEmpty && "text-muted-foreground",
              displayClassName
            )}
          >
            {isEmpty ? emptyText : (compact ? formatCompactCurrency(displayValue, suffix) : `${formatNumberWithDots(displayValue)}${suffix}`)}
          </span>
          
          {/* Edit indicator - always visible when empty */}
          {!disabled && (
            <Pencil className={cn(
              "h-3 w-3 text-muted-foreground flex-shrink-0 transition-opacity",
              isEmpty 
                ? "opacity-60" 
                : "opacity-0 group-hover:opacity-100"
            )} />
          )}
          
          {/* Save status indicators */}
          {saveStatus === 'success' && (
            <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
          )}
          {saveStatus === 'error' && (
            <X className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
          )}
        </div>
      </TooltipTrigger>
      {!disabled && (
        <TooltipContent side="top" className="text-xs">
          Clic para editar
        </TooltipContent>
      )}
    </Tooltip>
  );
};

EditableCurrency.displayName = "EditableCurrency";
