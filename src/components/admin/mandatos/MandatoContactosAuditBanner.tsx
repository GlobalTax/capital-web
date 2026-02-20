/**
 * Banner de advertencia: muestra contactos eliminados recientemente en un mandato.
 * Aparece sobre la lista de compradores cuando hay contactos perdidos.
 * Permite restaurarlos con un click.
 */
import React, { useState } from 'react';
import { AlertTriangle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useMandatoContactosAudit,
  MandatoContactoAuditEntry,
} from '@/hooks/useMandatoContactosAudit';

interface MandatoContactosAuditBannerProps {
  mandatoId: string;
}

export const MandatoContactosAuditBanner: React.FC<MandatoContactosAuditBannerProps> = ({
  mandatoId,
}) => {
  const { deletedContacts, isLoading, restoreContacto, isRestoring } =
    useMandatoContactosAudit(mandatoId);
  const [expanded, setExpanded] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  if (isLoading || deletedContacts.length === 0) return null;

  const handleRestore = (entry: MandatoContactoAuditEntry) => {
    setRestoringId(entry.id);
    restoreContacto(entry);
  };

  const getContactName = (entry: MandatoContactoAuditEntry): string => {
    const s = entry.contacto_snapshot;
    if (!s) return entry.contacto_id.slice(0, 8) + '…';
    const parts = [s.nombre, s.apellidos].filter(Boolean).join(' ');
    return parts || s.email || entry.contacto_id.slice(0, 8) + '…';
  };

  const getContactEmail = (entry: MandatoContactoAuditEntry): string | null => {
    return entry.contacto_snapshot?.email || null;
  };

  return (
    <Alert className="border-warning/50 bg-warning/5 mb-4">
      <AlertTriangle className="h-4 w-4 text-warning-foreground" />
      <div className="flex items-start justify-between w-full">
        <div className="flex-1">
          <AlertTitle className="text-foreground flex items-center gap-2">
            Contactos eliminados recientemente
            <Badge variant="secondary">
              {deletedContacts.length}
            </Badge>
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-xs mt-0.5">
            Estos contactos fueron desasignados automáticamente al ser eliminados del CRM.
          </AlertDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-1.5 w-full">
          {deletedContacts.map((entry) => (
            <div
              key={entry.id}
              className="flex items-center justify-between bg-background/60 rounded px-3 py-2 gap-2 border border-border/50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground truncate">
                  {getContactName(entry)}
                </p>
                {getContactEmail(entry) && (
                  <p className="text-xs text-muted-foreground truncate">
                    {getContactEmail(entry)}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-muted-foreground">
                  {format(new Date(entry.performed_at), 'd MMM HH:mm', { locale: es })}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 text-xs px-2"
                  onClick={() => handleRestore(entry)}
                  disabled={isRestoring && restoringId === entry.id}
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  {isRestoring && restoringId === entry.id ? 'Restaurando…' : 'Restaurar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Alert>
  );
};
