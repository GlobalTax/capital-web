import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Download, Send, CheckCircle, XCircle, FileText, Clock, Eye, PenLine } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNDATrackingEvents } from '../hooks/useNDATracking';
import { useUpdateFase0Document } from '../hooks/useFase0Documents';
import {
  Fase0Document,
  FASE0_DOCUMENT_TYPE_LABELS,
  FASE0_STATUS_LABELS,
  FASE0_STATUS_COLORS,
  FASE0_VARIABLE_LABELS,
} from '../types';
import { toast } from 'sonner';

interface NDADetailSheetProps {
  document: Fase0Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const timelineIcons: Record<string, React.ReactNode> = {
  created: <FileText className="h-4 w-4" />,
  sent: <Send className="h-4 w-4" />,
  viewed: <Eye className="h-4 w-4" />,
  signed: <PenLine className="h-4 w-4" />,
  expired: <Clock className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
};

export const NDADetailSheet: React.FC<NDADetailSheetProps> = ({
  document: doc,
  open,
  onOpenChange,
}) => {
  const { data: trackingEvents } = useNDATrackingEvents(doc?.id);
  const updateDocument = useUpdateFase0Document();

  if (!doc) return null;

  const handleMarkSigned = () => {
    updateDocument.mutate({
      id: doc.id,
      updates: { status: 'signed', signed_at: new Date().toISOString() },
    }, {
      onSuccess: () => toast.success('Documento marcado como firmado'),
    });
  };

  const handleCancel = () => {
    updateDocument.mutate({
      id: doc.id,
      updates: { status: 'cancelled' },
    }, {
      onSuccess: () => toast.success('Documento cancelado'),
    });
  };

  // Build timeline from document dates + tracking events
  const timeline: { label: string; date: string; icon: React.ReactNode }[] = [];
  if (doc.created_at) {
    timeline.push({ label: 'Creado', date: doc.created_at, icon: timelineIcons.created });
  }
  if (doc.sent_at) {
    timeline.push({ label: `Enviado a ${doc.sent_to_email || 'cliente'}`, date: doc.sent_at, icon: timelineIcons.sent });
  }
  if (doc.viewed_at) {
    timeline.push({ label: `Visto (${doc.view_count || 1}×)`, date: doc.viewed_at, icon: timelineIcons.viewed });
  }
  if (doc.signed_at) {
    timeline.push({ label: `Firmado${doc.signed_by_name ? ` por ${doc.signed_by_name}` : ''}`, date: doc.signed_at, icon: timelineIcons.signed });
  }
  // Add tracking events
  if (trackingEvents) {
    trackingEvents.forEach((evt) => {
      timeline.push({
        label: evt.event_type,
        date: evt.created_at || '',
        icon: timelineIcons[evt.event_type] || <Clock className="h-4 w-4" />,
      });
    });
  }
  // Sort by date
  timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Variables filled
  const filledEntries = Object.entries(doc.filled_data || {}).filter(
    ([, v]) => v && v.trim() !== ''
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {FASE0_DOCUMENT_TYPE_LABELS[doc.document_type]}
          </SheetTitle>
          <div className="flex items-center gap-2 mt-1">
            <Badge className={FASE0_STATUS_COLORS[doc.status]}>
              {FASE0_STATUS_LABELS[doc.status]}
            </Badge>
            {doc.reference_number && (
              <span className="text-xs text-muted-foreground font-mono">{doc.reference_number}</span>
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] mt-4 pr-4">
          <div className="space-y-6">
            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              {doc.pdf_url && (
                <Button size="sm" variant="outline" onClick={() => window.open(doc.pdf_url!, '_blank')}>
                  <Download className="h-4 w-4 mr-1" /> PDF
                </Button>
              )}
              {doc.status !== 'signed' && doc.status !== 'cancelled' && (
                <>
                  <Button size="sm" variant="outline" onClick={handleMarkSigned}>
                    <CheckCircle className="h-4 w-4 mr-1" /> Marcar firmado
                  </Button>
                  <Button size="sm" variant="ghost" onClick={handleCancel}>
                    <XCircle className="h-4 w-4 mr-1" /> Cancelar
                  </Button>
                </>
              )}
            </div>

            <Separator />

            {/* Client Data */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Datos del documento</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {filledEntries.map(([key, value]) => (
                  <div key={key}>
                    <span className="text-muted-foreground text-xs">
                      {FASE0_VARIABLE_LABELS[key] || key}
                    </span>
                    <p className="font-medium truncate">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {doc.notes && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-semibold mb-1">Notas</h4>
                  <p className="text-sm text-muted-foreground">{doc.notes}</p>
                </div>
              </>
            )}

            <Separator />

            {/* Timeline */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Timeline</h4>
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin eventos registrados</p>
              ) : (
                <div className="relative space-y-4 pl-6 before:absolute before:left-[11px] before:top-1 before:bottom-1 before:w-px before:bg-border">
                  {timeline.map((evt, i) => (
                    <div key={i} className="flex items-start gap-3 relative">
                      <div className="absolute -left-6 mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background border border-border">
                        {evt.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{evt.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {evt.date ? format(new Date(evt.date), "dd MMM yyyy · HH:mm", { locale: es }) : '—'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
