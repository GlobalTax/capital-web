import React, { useEffect, useState } from 'react';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

interface AutosaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error?: string | null;
}

export const AutosaveIndicator: React.FC<AutosaveIndicatorProps> = ({
  isSaving,
  lastSaved,
  error
}) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      
      if (seconds < 10) {
        setTimeAgo('justo ahora');
      } else if (seconds < 60) {
        setTimeAgo(`hace ${seconds}s`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`hace ${minutes}m`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000); // Actualizar cada 10s

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (error) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-destructive/10 text-destructive border border-destructive/20 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
        <XCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Error al guardar</span>
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-muted/80 backdrop-blur-sm border border-border rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">Guardando...</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg shadow-sm animate-in fade-in slide-in-from-top-2">
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-sm font-medium">Guardado {timeAgo}</span>
      </div>
    );
  }

  return null;
};
