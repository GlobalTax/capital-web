import React, { useState, useEffect } from 'react';
import { useActiveEmailRecipients, EmailRecipient } from '@/hooks/useEmailRecipientsConfig';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Mail, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmailRecipientSelectorProps {
  selectedRecipients: string[];
  onSelectionChange: (emails: string[]) => void;
  className?: string;
}

const ROLE_LABELS: Record<string, string> = {
  direccion: 'Dirección',
  asesor: 'Asesor',
  backoffice: 'Back Office',
  administracion: 'Admin',
};

const ROLE_COLORS: Record<string, string> = {
  direccion: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  asesor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  backoffice: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  administracion: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
};

export function EmailRecipientSelector({ 
  selectedRecipients, 
  onSelectionChange,
  className 
}: EmailRecipientSelectorProps) {
  const { data: recipients, isLoading } = useActiveEmailRecipients();
  const [initialized, setInitialized] = useState(false);

  // Inicializar con los destinatarios por defecto cuando se cargan
  useEffect(() => {
    if (recipients && !initialized) {
      const defaultRecipients = recipients
        .filter(r => r.is_default_copy)
        .map(r => r.email);
      
      // Solo inicializar si no hay selección previa
      if (selectedRecipients.length === 0 && defaultRecipients.length > 0) {
        onSelectionChange(defaultRecipients);
      }
      setInitialized(true);
    }
  }, [recipients, initialized, selectedRecipients.length, onSelectionChange]);

  const handleToggle = (email: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedRecipients, email]);
    } else {
      onSelectionChange(selectedRecipients.filter(e => e !== email));
    }
  };

  const handleSelectAll = () => {
    if (recipients) {
      onSelectionChange(recipients.map(r => r.email));
    }
  };

  const handleSelectNone = () => {
    onSelectionChange([]);
  };

  const handleSelectDefaults = () => {
    if (recipients) {
      const defaults = recipients.filter(r => r.is_default_copy).map(r => r.email);
      onSelectionChange(defaults);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-3", className)}>
        <Skeleton className="h-4 w-40" />
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!recipients || recipients.length === 0) {
    return (
      <div className={cn("text-sm text-muted-foreground p-4 bg-muted rounded-lg", className)}>
        <Info className="h-4 w-4 inline mr-2" />
        No hay destinatarios configurados. 
        <a href="/admin/configuracion/destinatarios-email" className="underline ml-1">
          Configura destinatarios
        </a>
      </div>
    );
  }

  // Agrupar por rol
  const groupedByRole = recipients.reduce((acc, recipient) => {
    const role = recipient.role || 'otro';
    if (!acc[role]) acc[role] = [];
    acc[role].push(recipient);
    return acc;
  }, {} as Record<string, EmailRecipient[]>);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            Equipo en copia ({selectedRecipients.length}/{recipients.length})
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <button 
            type="button"
            onClick={handleSelectAll}
            className="text-primary hover:underline"
          >
            Todos
          </button>
          <span className="text-muted-foreground">|</span>
          <button 
            type="button"
            onClick={handleSelectDefaults}
            className="text-primary hover:underline"
          >
            Por defecto
          </button>
          <span className="text-muted-foreground">|</span>
          <button 
            type="button"
            onClick={handleSelectNone}
            className="text-primary hover:underline"
          >
            Ninguno
          </button>
        </div>
      </div>

      {/* Lista de destinatarios agrupados por rol */}
      <div className="space-y-3">
        {Object.entries(groupedByRole).map(([role, roleRecipients]) => (
          <div key={role} className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {ROLE_LABELS[role] || role}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {roleRecipients.map((recipient) => {
                const isSelected = selectedRecipients.includes(recipient.email);
                return (
                  <TooltipProvider key={recipient.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <label
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-all",
                            isSelected 
                              ? "border-primary bg-primary/5" 
                              : "border-border hover:border-primary/50"
                          )}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleToggle(recipient.email, checked === true)}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium truncate">
                                {recipient.name}
                              </span>
                              {recipient.is_default_copy && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0">
                                  default
                                </Badge>
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground truncate block">
                              {recipient.email}
                            </span>
                          </div>
                        </label>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{recipient.email}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Resumen de selección */}
      {selectedRecipients.length > 0 && (
        <div className="flex flex-wrap gap-1 pt-2 border-t">
          <Mail className="h-4 w-4 text-muted-foreground mr-1" />
          {selectedRecipients.slice(0, 5).map(email => (
            <Badge key={email} variant="secondary" className="text-xs">
              {recipients.find(r => r.email === email)?.name || email}
            </Badge>
          ))}
          {selectedRecipients.length > 5 && (
            <Badge variant="outline" className="text-xs">
              +{selectedRecipients.length - 5} más
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
