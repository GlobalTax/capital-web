import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Send, Eye, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useFase0DocumentsByLead, useDeleteFase0Document } from '../hooks/useFase0Documents';
import {
  type Fase0LeadType,
  FASE0_DOCUMENT_TYPE_LABELS,
  FASE0_STATUS_LABELS,
  FASE0_STATUS_COLORS,
} from '../types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Fase0DocumentsListProps {
  leadId: string;
  leadType: Fase0LeadType;
  onView?: (documentId: string) => void;
}

export const Fase0DocumentsList: React.FC<Fase0DocumentsListProps> = ({
  leadId,
  leadType,
  onView,
}) => {
  const { data: documents, isLoading } = useFase0DocumentsByLead(leadId, leadType);
  const deleteDocument = useDeleteFase0Document();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!documents?.length) {
    return (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
        No hay documentos generados
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <Card key={doc.id} className="hover:shadow-sm transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">
                    {FASE0_DOCUMENT_TYPE_LABELS[doc.document_type]}
                  </span>
                  <Badge className={`text-xs ${FASE0_STATUS_COLORS[doc.status]}`}>
                    {FASE0_STATUS_LABELS[doc.status]}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="font-mono">{doc.reference_number}</span>
                  <span className="mx-2">·</span>
                  <span>
                    {formatDistanceToNow(new Date(doc.created_at), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                {doc.sent_at && doc.sent_to_email && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Enviado a {doc.sent_to_email}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                {onView && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(doc.id)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                )}
                {doc.pdf_url && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(doc.pdf_url!, '_blank')}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                )}
                {doc.status === 'draft' && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar documento?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará el borrador permanentemente.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteDocument.mutate(doc.id)}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
