/**
 * LeadPhase0Tab - Dedicated Fase 0 tab for lead detail view
 * Shows checklist, timeline, alerts, and document history
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  FileText,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Phase0ChecklistCards } from './Phase0ChecklistCards';
import { Fase0DocumentsList } from './Fase0DocumentsList';
import { Fase0DocumentModal } from './Fase0DocumentModal';
import { useFase0WorkflowValidation } from '../hooks/useFase0WorkflowValidation';
import { useFase0DocumentsByLead } from '../hooks/useFase0Documents';
import { Fase0DocumentType, Fase0LeadType } from '../types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LeadPhase0TabProps {
  leadId: string;
  leadType: Fase0LeadType;
  leadData?: {
    contact_name?: string;
    company_name?: string;
    email?: string;
    phone?: string;
    cif?: string;
    industry?: string;
    revenue?: number;
    ebitda?: number;
    final_valuation?: number;
  };
  leadOperationType?: 'sell-side' | 'buy-side' | null;
}

const STATUS_BADGES = {
  pending: { label: 'Pendiente', className: 'bg-muted text-muted-foreground' },
  active: { label: 'En Proceso', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  blocked: { label: 'Bloqueado', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  complete: { label: 'Completado', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' }
};

export const LeadPhase0Tab: React.FC<LeadPhase0TabProps> = ({
  leadId,
  leadType,
  leadData,
  leadOperationType
}) => {
  const [selectedDocType, setSelectedDocType] = useState<Fase0DocumentType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { 
    getPhase0Status, 
    getProgressPercentage, 
    isNdaSigned,
    getSuggestedDocument 
  } = useFase0WorkflowValidation(leadId, leadType, leadOperationType);

  const { data: documents } = useFase0DocumentsByLead(leadId, leadType);

  const phase0Status = getPhase0Status();
  const progressPercentage = getProgressPercentage();
  const ndaSigned = isNdaSigned();
  const suggestedDoc = getSuggestedDocument();
  const statusBadge = STATUS_BADGES[phase0Status];

  const handleGenerateDocument = (type: Fase0DocumentType) => {
    setSelectedDocType(type);
    setModalOpen(true);
  };

  const handleViewDocument = (documentId: string) => {
    // TODO: Implement document viewer
    console.log('View document:', documentId);
  };

  const handleSendDocument = (documentId: string) => {
    // TODO: Implement send document
    console.log('Send document:', documentId);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDocType(null);
  };

  // Build timeline from documents
  const timelineEvents = documents?.map(doc => ({
    id: doc.id,
    type: doc.document_type,
    status: doc.status,
    date: doc.created_at,
    title: doc.document_type === 'nda' 
      ? 'NDA Cliente' 
      : doc.document_type === 'mandato_venta'
        ? 'Propuesta Mandato Venta'
        : 'Propuesta Mandato Compra'
  })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) || [];

  return (
    <div className="space-y-6">
      {/* Header with status and progress */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Fase 0: Pre-Mandato</CardTitle>
            <Badge className={cn("text-xs", statusBadge.className)}>
              {statusBadge.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progreso</span>
              <span className="font-medium">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Quick status indicators */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              {ndaSigned ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={ndaSigned ? 'text-green-600' : 'text-muted-foreground'}>
                NDA
              </span>
            </div>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <div className="flex items-center gap-1.5">
              {phase0Status === 'complete' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-muted-foreground" />
              )}
              <span className={phase0Status === 'complete' ? 'text-green-600' : 'text-muted-foreground'}>
                Mandato
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocking alert if NDA not signed */}
      {phase0Status === 'blocked' && (
        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Proceso bloqueado</AlertTitle>
          <AlertDescription>
            El NDA debe estar firmado antes de poder avanzar con la propuesta de mandato.
            Por favor, genera y envía el NDA para continuar.
          </AlertDescription>
        </Alert>
      )}

      {/* Suggestion alert */}
      {suggestedDoc && phase0Status !== 'complete' && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>Siguiente paso sugerido</AlertTitle>
          <AlertDescription>
            {suggestedDoc === 'nda' && 'Genera el NDA para iniciar el proceso de Pre-Mandato.'}
            {suggestedDoc === 'mandato_venta' && 'El NDA está firmado. Ahora puedes generar la Propuesta de Mandato de Venta.'}
            {suggestedDoc === 'mandato_compra' && 'El NDA está firmado. Ahora puedes generar la Propuesta de Mandato de Compra.'}
          </AlertDescription>
        </Alert>
      )}

      {/* Checklist cards */}
      <Phase0ChecklistCards
        leadId={leadId}
        leadType={leadType}
        leadOperationType={leadOperationType}
        onGenerateDocument={handleGenerateDocument}
        onViewDocument={handleViewDocument}
        onSendDocument={handleSendDocument}
      />

      <Separator />

      {/* Timeline */}
      {timelineEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historial de Documentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {timelineEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="flex items-start gap-3"
                >
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-2 h-2 rounded-full",
                      event.status === 'signed' ? 'bg-green-500' :
                      event.status === 'sent' ? 'bg-blue-500' :
                      event.status === 'draft' ? 'bg-purple-500' :
                      'bg-muted-foreground'
                    )} />
                    {index < timelineEvents.length - 1 && (
                      <div className="w-px h-8 bg-border" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{event.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {event.status === 'draft' && 'Generado'}
                        {event.status === 'sent' && 'Enviado'}
                        {event.status === 'viewed' && 'Visto'}
                        {event.status === 'signed' && 'Firmado'}
                        {event.status === 'expired' && 'Expirado'}
                        {event.status === 'cancelled' && 'Cancelado'}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(event.date), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Document list with all versions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos los Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Fase0DocumentsList 
            leadId={leadId} 
            leadType={leadType}
            onView={handleViewDocument}
          />
        </CardContent>
      </Card>

      {/* Document generation modal */}
      {selectedDocType && (
        <Fase0DocumentModal
          open={modalOpen}
          onOpenChange={handleModalClose}
          documentType={selectedDocType}
          leadId={leadId}
          leadType={leadType}
          leadData={leadData}
          onSuccess={handleModalClose}
        />
      )}
    </div>
  );
};
