import React, { useEffect, useState } from 'react';
import { Check, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  className?: string;
}

export const SaveStatus = ({ isSaving, lastSaved, className }: SaveStatusProps) => {
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 3000); // Hide after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  // Don't show anything if no activity
  if (!isSaving && !showSaved) {
    return null;
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium opacity-70 transition-all duration-200",
      isSaving && "text-primary/80 bg-primary/10",
      showSaved && "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
      className
    )}>
      {isSaving ? (
        <>
          <Clock className="h-3 w-3 animate-spin" />
          <span>Guardando...</span>
        </>
      ) : (
        <>
          <Check className="h-3 w-3" />
          <span>Guardado</span>
        </>
      )}
    </div>
  );
};