// ============= CALCULATOR ERROR DETAIL MODAL =============
// Modal showing full error details and lead recovery options

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertTriangle, Send, AlertCircle, Wifi, HelpCircle, User, Building, Mail, Smartphone, Globe, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';
import type { CalculatorError, ErrorType } from '@/features/valuation/hooks/useCalculatorErrors';

interface CalculatorErrorDetailModalProps {
  error: CalculatorError | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const errorTypeConfig: Record<ErrorType, { label: string; color: string; icon: React.ElementType }> = {
  calculation: { label: 'Error de Cálculo', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
  submission: { label: 'Error de Envío', color: 'bg-orange-100 text-orange-800', icon: Send },
  validation: { label: 'Error de Validación', color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
  network: { label: 'Error de Red', color: 'bg-blue-100 text-blue-800', icon: Wifi },
  unknown: { label: 'Error Desconocido', color: 'bg-gray-100 text-gray-800', icon: HelpCircle },
};

export const CalculatorErrorDetailModal = ({ error, open, onOpenChange }: CalculatorErrorDetailModalProps) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!error) return null;

  const typeConfig = errorTypeConfig[error.error_type] || errorTypeConfig.unknown;
  const TypeIcon = typeConfig.icon;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success(`${label} copiado al portapapeles`);
    setTimeout(() => setCopied(null), 2000);
  };

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      onClick={() => handleCopy(text, label)}
    >
      {copied === label ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge className={`${typeConfig.color} flex items-center gap-1`}>
              <TypeIcon className="h-3 w-3" />
              {typeConfig.label}
            </Badge>
            <span className="text-muted-foreground text-sm font-normal">
              {format(new Date(error.created_at), "dd MMM yyyy 'a las' HH:mm", { locale: es })}
            </span>
          </DialogTitle>
          <DialogDescription>
            ID: {error.id.substring(0, 8)}... | Token: {error.unique_token || 'N/A'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-6">
            {/* Error Message */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Mensaje de Error</h4>
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm font-mono text-destructive">{error.error_message}</p>
              </div>
            </div>

            {/* Lead Data */}
            {error.company_data && Object.keys(error.company_data).length > 0 && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Datos del Lead (Recuperables)
                </h4>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  {error.company_data.contact_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {error.company_data.contact_name}
                      </span>
                      <CopyButton text={error.company_data.contact_name} label="Nombre" />
                    </div>
                  )}
                  {error.company_data.email && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {error.company_data.email}
                      </span>
                      <CopyButton text={error.company_data.email} label="Email" />
                    </div>
                  )}
                  {error.company_data.company_name && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center gap-2">
                        <Building className="h-3 w-3 text-muted-foreground" />
                        {error.company_data.company_name}
                      </span>
                      <CopyButton text={error.company_data.company_name} label="Empresa" />
                    </div>
                  )}
                  {/* Show other company_data fields */}
                  {Object.entries(error.company_data)
                    .filter(([key]) => !['contact_name', 'email', 'company_name'].includes(key))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{key}: {String(value)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Technical Details */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Detalles Técnicos</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-muted/30 rounded p-2">
                  <span className="text-muted-foreground">Componente:</span>
                  <p className="font-mono text-xs">{error.component || 'N/A'}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <span className="text-muted-foreground">Acción:</span>
                  <p className="font-mono text-xs">{error.action || 'N/A'}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <span className="text-muted-foreground">Paso:</span>
                  <p className="font-mono text-xs">{error.current_step ?? 'N/A'}</p>
                </div>
                <div className="bg-muted/30 rounded p-2">
                  <span className="text-muted-foreground">Proyecto:</span>
                  <p className="font-mono text-xs">{error.source_project || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Stack Trace */}
            {error.error_stack && (
              <div>
                <h4 className="text-sm font-semibold mb-2 flex items-center justify-between">
                  Stack Trace
                  <CopyButton text={error.error_stack} label="Stack trace" />
                </h4>
                <pre className="bg-slate-900 text-slate-100 rounded-lg p-4 text-xs overflow-x-auto max-h-48">
                  <code>{error.error_stack}</code>
                </pre>
              </div>
            )}

            <Separator />

            {/* Metadata */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Metadatos</h4>
              <div className="space-y-2 text-xs text-muted-foreground">
                {error.user_agent && (
                  <div className="flex items-start gap-2">
                    <Smartphone className="h-3 w-3 mt-0.5 shrink-0" />
                    <span className="break-all">{error.user_agent}</span>
                  </div>
                )}
                {error.ip_address && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-3 w-3" />
                    <span>{error.ip_address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
