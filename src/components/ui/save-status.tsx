import { Check, Clock, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  className?: string;
}

export const SaveStatus = ({ isSaving, lastSaved, className }: SaveStatusProps) => {
  const [showSaved, setShowSaved] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor network connectivity
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isSaving && lastSaved) {
      setShowSaved(true);
      const timer = setTimeout(() => {
        setShowSaved(false);
      }, 2500); // Show for 2.5 seconds
      return () => clearTimeout(timer);
    }
  }, [isSaving, lastSaved]);

  // Don't show anything if no activity and offline
  if (!isSaving && !showSaved && !isOnline) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-50 text-red-600 text-xs font-medium opacity-80 transition-all duration-200 border border-red-200",
        className
      )}>
        <WifiOff className="h-3 w-3" />
        <span>Sin conexión</span>
      </div>
    );
  }

  // Don't show anything if no activity and online
  if (!isSaving && !showSaved) {
    return null;
  }

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium opacity-70 transition-all duration-200",
      isSaving && "text-blue-600 bg-blue-50 border border-blue-200 opacity-100",
      showSaved && "text-green-600 bg-green-50 border border-green-200 opacity-100",
      !isOnline && "text-orange-600 bg-orange-50 border border-orange-200",
      className
    )}>
      {!isOnline && isSaving ? (
        <>
          <WifiOff className="h-3 w-3" />
          <span>Guardando offline...</span>
        </>
      ) : isSaving ? (
        <>
          <Clock className="h-3 w-3 animate-spin" />
          <span>Guardando...</span>
        </>
      ) : showSaved ? (
        <>
          <Check className="h-3 w-3" />
          <span>Guardado</span>
        </>
      ) : null}
    </div>
  );
};