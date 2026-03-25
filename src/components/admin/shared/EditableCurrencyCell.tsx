import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { Check, Loader2, X, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { formatNumberWithDots, parseNumberWithDots } from "@/utils/numberFormatting";

interface EditableCurrencyCellProps {
  value: number | null | undefined;
  onSave: (newValue: number | null) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  displayClassName?: string;
  emptyText?: string;
  suffix?: string;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

const formatCompact = (value: number): string => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M€`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)}k€`;
  return `${value}€`;
};

export const EditableCurrencyCell = React.memo<EditableCurrencyCellProps>(({
  value,
  onSave,
  placeholder = "0",
  disabled = false,
  className,
  displayClassName,
  emptyText = "—",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStartEdit = useCallback(() => {
    if (disabled) return;
    setEditValue(value && value > 0 ? formatNumberWithDots(value) : '');
    setIsEditing(true);
    setSaveStatus('idle');
    setTimeout(() => {
      inputRef.current?.focus();
      inputRef.current?.select();
    }, 0);
  }, [disabled, value]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setSaveStatus('idle');
  }, []);

  const handleSave = useCallback(async () => {
    const parsed = parseNumberWithDots(editValue);
    const originalValue = value || 0;

    if (parsed === originalValue) {
      setIsEditing(false);
      return;
    }

    setSaveStatus('saving');

    try {
      await onSave(parsed > 0 ? parsed : null);
      setSaveStatus('success');
      setIsEditing(false);
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('Error saving currency cell:', error);
      setSaveStatus('error');
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
    if (containerRef.current && !containerRef.current.contains(e.relatedTarget as Node)) {
      handleSave();
    }
  }, [handleSave]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^\d.]/g, '');
    setEditValue(sanitized);
  }, []);

  const isEmpty = !value || value <= 0;

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className={cn("flex items-center gap-1", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={editValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "h-7 text-sm py-0 px-2 min-w-[80px] max-w-[110px] text-right",
            "ring-2 ring-primary/50 border-primary"
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
    <div
      ref={containerRef}
      className={cn(
        "group relative flex items-center justify-end gap-1 cursor-pointer min-h-[28px] px-1 -mx-1 rounded",
        "hover:bg-muted/50 transition-colors",
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
          "text-sm truncate",
          isEmpty && "text-muted-foreground",
          displayClassName
        )}
      >
        {isEmpty ? emptyText : formatCompact(value!)}
      </span>

      {!disabled && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
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

EditableCurrencyCell.displayName = "EditableCurrencyCell";
