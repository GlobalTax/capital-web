import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, FileCheck, FileText } from 'lucide-react';
import { Fase0DocumentModal } from './Fase0DocumentModal';
import type { Fase0DocumentType, Fase0LeadType } from '../types';

interface Fase0DocumentButtonsProps {
  leadId: string;
  leadType: Fase0LeadType;
  leadData: {
    full_name?: string;
    company?: string;
    company_name?: string;
    email?: string;
    phone?: string;
    sector?: string;
    final_valuation?: number;
  };
  variant?: 'default' | 'compact';
  onDocumentCreated?: (documentId: string) => void;
}

export const Fase0DocumentButtons: React.FC<Fase0DocumentButtonsProps> = ({
  leadId,
  leadType,
  leadData,
  variant = 'default',
  onDocumentCreated,
}) => {
  const [openModal, setOpenModal] = useState<Fase0DocumentType | null>(null);

  const handleSuccess = (documentId: string) => {
    onDocumentCreated?.(documentId);
    setOpenModal(null);
  };

  if (variant === 'compact') {
    return (
      <>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpenModal('nda')}
            title="Generar NDA"
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setOpenModal('mandato_venta')}
            title="Propuesta Venta"
          >
            <FileCheck className="h-4 w-4" />
          </Button>
        </div>

        {openModal && (
          <Fase0DocumentModal
            open={!!openModal}
            onOpenChange={(open) => !open && setOpenModal(null)}
            documentType={openModal}
            leadId={leadId}
            leadType={leadType}
            leadData={leadData}
            onSuccess={handleSuccess}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenModal('nda')}
        >
          <Shield className="h-4 w-4 mr-2" />
          Generar NDA
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenModal('mandato_venta')}
        >
          <FileCheck className="h-4 w-4 mr-2" />
          Propuesta Venta
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpenModal('mandato_compra')}
        >
          <FileText className="h-4 w-4 mr-2" />
          Propuesta Compra
        </Button>
      </div>

      {openModal && (
        <Fase0DocumentModal
          open={!!openModal}
          onOpenChange={(open) => !open && setOpenModal(null)}
          documentType={openModal}
          leadId={leadId}
          leadType={leadType}
          leadData={leadData}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
};
