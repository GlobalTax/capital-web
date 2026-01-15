import * as React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import { Check, Loader2, X, Pencil } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type EditableCellType = 'text' | 'number' | 'email' | 'phone';

interface EditableCellProps {
  value: string | number | null | undefined;
  type?: EditableCellType;
  onSave: (newValue: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  displayClassName?: string;
  inputClassName?: string;
  emptyText?: string;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  type = 'text',
  onSave,
  placeholder = "—",
  disabled = false,
  className,
  displayClassName,
  inputClassName,
  emptyText = "—",
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(value ?? ''));
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync edit value when external value changes
  useEffect(() => {
    if (!isEditing) {
      setEditValue(String(value ?? ''));
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
    if (disabled) return;
    setIsEditing(true);
    setSaveStatus('idle');
  }, [disabled]);

  const handleCancel = useCallback(() => {
    setEditValue(String(value ?? ''));
    setIsEditing(false);
    setSaveStatus('idle');
  }, [value]);

  const handleSave = useCallback(async () => {
    const trimmedValue = editValue.trim();
    const originalValue = String(value ?? '');
    
    // No change, just close
    if (trimmedValue === originalValue) {
      setIsEditing(false);
      return;
    }

    setSaveStatus('saving');
    
    try {
      await onSave(trimmedValue);
      setSaveStatus('success');
      setIsEditing(false);
      
      // Reset status after a brief moment
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (error) {
      console.error('Error saving cell:', error);
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

  const getInputType = () => {
    switch (type) {
      case 'email': return 'email';
      case 'phone': return 'tel';
      case 'number': return 'number';
      default: return 'text';
    }
  };

  const displayValue = value ?? '';
  const isEmpty = displayValue === '' || displayValue === null || displayValue === undefined;

  if (isEditing) {
    return (
      <div 
        ref={containerRef}
        className={cn("flex items-center gap-1", className)}
        onClick={(e) => e.stopPropagation()}
      >
        <Input
          ref={inputRef}
          type={getInputType()}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "h-7 text-sm py-0 px-2 min-w-[100px]",
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
    <div
      ref={containerRef}
      className={cn(
        "group relative flex items-center gap-1 cursor-pointer min-h-[28px] px-1 -mx-1 rounded",
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
        {isEmpty ? emptyText : String(displayValue)}
      </span>
      
      {/* Edit indicator */}
      {!disabled && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      )}
      
      {/* Save status indicators */}
      {saveStatus === 'success' && (
        <Check className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
      )}
      {saveStatus === 'error' && (
        <X className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
      )}
    </div>
  );
};

EditableCell.displayName = "EditableCell";
