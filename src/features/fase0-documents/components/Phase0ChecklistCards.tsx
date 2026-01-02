/**
 * Phase0ChecklistCards - Visual checklist for Fase 0 documents
 * Shows status cards for NDA and Mandate proposals
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Send, 
  Eye, 
  Check, 
  Clock, 
  AlertCircle,
  Lock,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFase0DocumentsByLead } from '../hooks/useFase0Documents';
import { Fase0DocumentType, Fase0DocumentStatus, Fase0LeadType } from '../types';

interface Phase0ChecklistCardsProps {
  leadId: string;
  leadType: Fase0LeadType;
  leadOperationType?: 'sell-side' | 'buy-side' | null;
  onGenerateDocument: (type: Fase0DocumentType) => void;
  onViewDocument: (documentId: string) => void;
  onSendDocument: (documentId: string) => void;
}

interface DocumentCardStatus {
  status: 'pending' | 'draft' | 'sent' | 'signed' | 'na';
  documentId?: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const STATUS_CONFIG: Record<DocumentCardStatus['status'], Omit<DocumentCardStatus, 'documentId'>> = {
  pending: {
    status: 'pending',
    label: 'Pendiente',
    color: 'bg-muted text-muted-foreground',
    icon: <Clock className="h-4 w-4" />
  },
  draft: {
    status: 'draft',
    label: 'Generado',
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    icon: <FileText className="h-4 w-4" />
  },
  sent: {
    status: 'sent',
    label: 'Enviado',
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    icon: <Send className="h-4 w-4" />
  },
  signed: {
    status: 'signed',
    label: 'Firmado',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    icon: <Check className="h-4 w-4" />
  },
  na: {
    status: 'na',
    label: 'No Aplica',
    color: 'bg-muted/50 text-muted-foreground/50',
    icon: <Lock className="h-4 w-4" />
  }
};

const DOCUMENT_TYPES: { type: Fase0DocumentType; title: string; description: string }[] = [
  { 
    type: 'nda', 
    title: 'NDA Cliente', 
    description: 'Acuerdo de confidencialidad' 
  },
  { 
    type: 'mandato_venta', 
    title: 'Propuesta Mandato Venta', 
    description: 'Propuesta para operación de venta' 
  },
  { 
    type: 'mandato_compra', 
    title: 'Propuesta Mandato Compra', 
    description: 'Propuesta para operación de compra' 
  }
];

export const Phase0ChecklistCards: React.FC<Phase0ChecklistCardsProps> = ({
  leadId,
  leadType,
  leadOperationType,
  onGenerateDocument,
  onViewDocument,
  onSendDocument
}) => {
  const { data: documents, isLoading } = useFase0DocumentsByLead(leadId, leadType);

  const getDocumentStatus = (docType: Fase0DocumentType): DocumentCardStatus => {
    // Check if this document type applies based on lead operation type
    if (docType === 'mandato_venta' && leadOperationType === 'buy-side') {
      return { ...STATUS_CONFIG.na };
    }
    if (docType === 'mandato_compra' && leadOperationType === 'sell-side') {
      return { ...STATUS_CONFIG.na };
    }

    // Find the latest non-cancelled document of this type
    const doc = documents?.find(
      d => d.document_type === docType && d.status !== 'cancelled'
    );

    if (!doc) {
      return { ...STATUS_CONFIG.pending };
    }

    const statusMap: Record<Fase0DocumentStatus, DocumentCardStatus['status']> = {
      draft: 'draft',
      sent: 'sent',
      viewed: 'sent', // Viewed is still in "sent" phase
      signed: 'signed',
      expired: 'pending',
      cancelled: 'pending'
    };

    const status = statusMap[doc.status as Fase0DocumentStatus] || 'pending';
    return { 
      ...STATUS_CONFIG[status], 
      documentId: doc.id 
    };
  };

  const isNdaSigned = (): boolean => {
    const ndaStatus = getDocumentStatus('nda');
    return ndaStatus.status === 'signed';
  };

  const shouldHighlight = (docType: Fase0DocumentType): boolean => {
    if (docType === 'mandato_venta' && leadOperationType === 'sell-side') {
      return true;
    }
    if (docType === 'mandato_compra' && leadOperationType === 'buy-side') {
      return true;
    }
    return false;
  };

  const canGenerateMandato = (docType: Fase0DocumentType): boolean => {
    if (docType === 'nda') return true;
    // Mandato proposals require signed NDA
    return isNdaSigned();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Checklist Fase 0</h3>
        {!isNdaSigned() && (
          <Badge variant="outline" className="text-amber-600 border-amber-300">
            <AlertCircle className="h-3 w-3 mr-1" />
            NDA pendiente
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {DOCUMENT_TYPES.map(({ type, title, description }) => {
          const docStatus = getDocumentStatus(type);
          const isHighlighted = shouldHighlight(type);
          const canGenerate = canGenerateMandato(type);
          const isDisabled = docStatus.status === 'na';

          return (
            <Card 
              key={type}
              className={cn(
                "relative transition-all",
                isHighlighted && !isDisabled && "ring-2 ring-primary/50",
                isDisabled && "opacity-50"
              )}
            >
              {isHighlighted && !isDisabled && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    Recomendado
                  </Badge>
                </div>
              )}

              <CardContent className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium">{title}</h4>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                  <Badge className={cn("shrink-0", docStatus.color)}>
                    {docStatus.icon}
                    <span className="ml-1">{docStatus.label}</span>
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  {docStatus.status === 'pending' && !isDisabled && (
                    <Button 
                      size="sm" 
                      onClick={() => onGenerateDocument(type)}
                      disabled={!canGenerate}
                      className="flex-1"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Generar
                    </Button>
                  )}

                  {(docStatus.status === 'draft' || docStatus.status === 'generated') && docStatus.documentId && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewDocument(docStatus.documentId!)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => onSendDocument(docStatus.documentId!)}
                        className="flex-1"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Enviar
                      </Button>
                    </>
                  )}

                  {docStatus.status === 'sent' && docStatus.documentId && (
                    <>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onViewDocument(docStatus.documentId!)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => onSendDocument(docStatus.documentId!)}
                        className="flex-1"
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Reenviar
                      </Button>
                    </>
                  )}

                  {docStatus.status === 'signed' && docStatus.documentId && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => onViewDocument(docStatus.documentId!)}
                      className="flex-1"
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      Ver documento
                    </Button>
                  )}

                  {!canGenerate && docStatus.status === 'pending' && !isDisabled && (
                    <div className="flex items-center text-xs text-amber-600">
                      <Lock className="h-3 w-3 mr-1" />
                      Requiere NDA firmado
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
