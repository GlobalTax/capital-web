// ============= SPREADSHEET CELL COMPONENT =============
// Celda editable con comportamiento tipo Excel

import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { cn } from '@/lib/utils';
import { Check, X, Loader2 } from 'lucide-react';

export type CellType = 'text' | 'currency' | 'number' | 'select';
export type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export interface SelectOption {
  value: string;
  label: string;
  color?: string;
}

interface SpreadsheetCellProps {
  value: string | number | null | undefined;
  type: CellType;
  editable?: boolean;
  options?: SelectOption[];
  onSave?: (value: string | number | null) => Promise<void>;
  onFocus?: () => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'tab') => void;
  isFocused?: boolean;
  className?: string;
  displayClassName?: string;
  placeholder?: string;
  suffix?: string;
}

const formatDisplayValue = (
  value: string | number | null | undefined,
  type: CellType,
  suffix?: string
): string => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  if (type === 'currency') {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  }
  
  if (type === 'number') {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '-';
    return num.toLocaleString('es-ES') + (suffix || '');
  }
  
  return String(value);
};

const parseInputValue = (
  value: string,
  type: CellType
): string | number | null => {
  if (value === '' || value === '-') return null;
  
  if (type === 'currency' || type === 'number') {
    // Handle European number format (1.234,56)
    const normalized = value
      .replace(/[€\s]/g, '')
      .replace(/\./g, '')
      .replace(',', '.');
    const num = parseFloat(normalized);
    return isNaN(num) ? null : num;
  }
  
  return value;
};

const SpreadsheetCellComponent: React.FC<SpreadsheetCellProps> = ({
  value,
  type,
  editable = true,
  options = [],
  onSave,
  onFocus,
  onNavigate,
  isFocused = false,
  className,
  displayClassName,
  placeholder = '-',
  suffix
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const inputRef = useRef<HTMLInputElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);
  const cellRef = useRef<HTMLDivElement>(null);

  // Format value for editing
  const getEditValue = useCallback(() => {
    if (value === null || value === undefined) return '';
    if (type === 'currency' || type === 'number') {
      const num = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(num)) return '';
      return num.toLocaleString('es-ES', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 2 
      });
    }
    return String(value);
  }, [value, type]);

  // Start editing
  const startEditing = useCallback(() => {
    if (!editable) return;
    setEditValue(getEditValue());
    setIsEditing(true);
  }, [editable, getEditValue]);

  // Cancel editing
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditValue('');
    setSaveStatus('idle');
  }, []);

  // Save value
  const saveValue = useCallback(async () => {
    if (!onSave) {
      cancelEditing();
      return;
    }

    const newValue = parseInputValue(editValue, type);
    const oldValue = type === 'currency' || type === 'number' 
      ? (typeof value === 'string' ? parseFloat(value) : value)
      : value;

    // Skip if no change
    if (newValue === oldValue || (newValue === null && (oldValue === null || oldValue === undefined))) {
      cancelEditing();
      return;
    }

    setSaveStatus('saving');
    try {
      await onSave(newValue);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 1000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
    setIsEditing(false);
  }, [editValue, type, value, onSave, cancelEditing]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isEditing) {
        saveValue();
        onNavigate?.('down');
      } else {
        startEditing();
      }
    } else if (e.key === 'Escape') {
      cancelEditing();
    } else if (e.key === 'Tab') {
      if (isEditing) {
        e.preventDefault();
        saveValue();
        onNavigate?.(e.shiftKey ? 'left' : 'right');
      }
    } else if (!isEditing) {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate?.('up');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate?.('down');
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate?.('left');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate?.('right');
      } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
        // Start typing immediately
        startEditing();
      }
    }
  }, [isEditing, saveValue, startEditing, cancelEditing, onNavigate]);

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing) {
      if (type === 'select') {
        selectRef.current?.focus();
      } else {
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
  }, [isEditing, type]);

  // Focus cell when isFocused changes
  useEffect(() => {
    if (isFocused && !isEditing) {
      cellRef.current?.focus();
    }
  }, [isFocused, isEditing]);

  // Handle select change
  const handleSelectChange = useCallback(async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    setIsEditing(false);
    
    if (onSave && newValue !== value) {
      setSaveStatus('saving');
      try {
        await onSave(newValue);
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 1000);
      } catch {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
      }
    }
  }, [onSave, value]);

  // Get option for select display
  const selectedOption = type === 'select' 
    ? options.find(o => o.value === value)
    : null;

  const displayValue = type === 'select' && selectedOption
    ? selectedOption.label
    : formatDisplayValue(value, type, suffix);

  return (
    <div
      ref={cellRef}
      tabIndex={editable ? 0 : -1}
      className={cn(
        "relative h-full min-h-[36px] flex items-center px-2",
        "transition-all duration-100",
        editable && "cursor-text hover:bg-muted/50",
        isFocused && !isEditing && "ring-2 ring-primary ring-inset",
        isEditing && "ring-2 ring-primary bg-background",
        saveStatus === 'success' && "bg-green-50",
        saveStatus === 'error' && "bg-red-50",
        className
      )}
      onClick={() => editable && startEditing()}
      onFocus={onFocus}
      onKeyDown={handleKeyDown}
      onDoubleClick={() => editable && startEditing()}
    >
      {isEditing ? (
        type === 'select' ? (
          <select
            ref={selectRef}
            value={String(value || '')}
            onChange={handleSelectChange}
            onBlur={() => setIsEditing(false)}
            className="w-full h-full bg-transparent border-none outline-none text-sm"
          >
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={saveValue}
            className="w-full h-full bg-transparent border-none outline-none text-sm"
            placeholder={placeholder}
          />
        )
      ) : (
        <span
          className={cn(
            "text-sm truncate",
            (value === null || value === undefined || value === '') && "text-muted-foreground",
            selectedOption?.color,
            displayClassName
          )}
        >
          {displayValue}
        </span>
      )}

      {/* Save status indicator */}
      {saveStatus !== 'idle' && (
        <span className="absolute right-1 top-1/2 -translate-y-1/2">
          {saveStatus === 'saving' && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
          )}
          {saveStatus === 'success' && (
            <Check className="h-3 w-3 text-green-600" />
          )}
          {saveStatus === 'error' && (
            <X className="h-3 w-3 text-destructive" />
          )}
        </span>
      )}
    </div>
  );
};

export const SpreadsheetCell = memo(SpreadsheetCellComponent);
