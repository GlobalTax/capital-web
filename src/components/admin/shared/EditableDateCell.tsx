import * as React from "react";
import { useState, useCallback } from "react";
import { format, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import { Check, Loader2, X, CalendarDays } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EditableDateCellProps {
  value: string | Date | null | undefined;
  onSave: (newDate: string) => Promise<void>;
  placeholder?: string;
  disabled?: boolean;
  displayFormat?: string;
  className?: string;
  displayClassName?: string;
  emptyText?: string;
}

type SaveStatus = 'idle' | 'saving' | 'success' | 'error';

export const EditableDateCell = React.memo<EditableDateCellProps>(({
  value,
  onSave,
  placeholder = "Fecha...",
  disabled = false,
  displayFormat = "dd MMM yy",
  className,
  displayClassName,
  emptyText = "—",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // Parse value to Date
  const dateValue = React.useMemo(() => {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d;
  }, [value]);

  const handleSelect = useCallback(async (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      setIsOpen(false);
      return;
    }

    // Check if date actually changed
    if (dateValue && format(dateValue, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')) {
      setIsOpen(false);
      return;
    }

    setSaveStatus('saving');
    setIsOpen(false);

    try {
      // Convert to ISO string at start of day in local timezone
      const isoString = startOfDay(selectedDate).toISOString();
      await onSave(isoString);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar fecha';
      console.error('Error saving date:', error);
      setSaveStatus('error');
      // Re-open to let user retry
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    }
  }, [dateValue, onSave]);

  // Disable future dates
  const disabledDays = { after: new Date() };

  const isEmpty = !dateValue;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <div
          className={cn(
            "group relative flex items-center gap-1 cursor-pointer min-h-[28px] px-1 -mx-1 rounded",
            "hover:bg-muted/50 transition-colors",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) setIsOpen(true);
          }}
        >
          <span 
            className={cn(
              "text-[10px] truncate",
              isEmpty && "text-muted-foreground",
              displayClassName
            )}
          >
            {isEmpty ? emptyText : format(dateValue, displayFormat, { locale: es })}
          </span>
          
          {/* Edit indicator */}
          {!disabled && saveStatus === 'idle' && (
            <CalendarDays className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          )}
          
          {/* Status indicators */}
          {saveStatus === 'saving' && (
            <Loader2 className="h-3 w-3 animate-spin text-muted-foreground flex-shrink-0" />
          )}
          {saveStatus === 'success' && (
            <Check className="h-3 w-3 text-green-500 flex-shrink-0" />
          )}
          {saveStatus === 'error' && (
            <X className="h-3 w-3 text-destructive flex-shrink-0" />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-0" 
        align="start"
        onClick={(e) => e.stopPropagation()}
      >
        <Calendar
          mode="single"
          selected={dateValue}
          onSelect={handleSelect}
          disabled={disabledDays}
          initialFocus
          locale={es}
          className={cn("p-3 pointer-events-auto")}
        />
      </PopoverContent>
    </Popover>
  );
});

EditableDateCell.displayName = "EditableDateCell";
