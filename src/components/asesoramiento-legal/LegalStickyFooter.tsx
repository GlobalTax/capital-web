import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, MessageCircle } from 'lucide-react';
import LegalLeadModal from './LegalLeadModal';

const LegalStickyFooter = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownloadChecklist = () => {
    // Create a link to download the PDF
    const link = document.createElement('a');
    link.href = '/docs/checklist-legal.pdf';
    link.download = 'checklist-legal-ma-capittal.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-foreground">
                ¿Necesitas asesoramiento legal especializado en M&A?
              </p>
              <p className="text-xs text-muted-foreground">
                Solicita una propuesta personalizada o descarga nuestro checklist legal
              </p>
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={handleDownloadChecklist}
                variant="outline"
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Descargar</span> Checklist
              </Button>
              <Button
                onClick={() => setIsModalOpen(true)}
                size="sm"
                className="flex-1 sm:flex-none"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Propuesta
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add bottom padding to main content to prevent overlap */}
      <div className="h-20 sm:h-16" />

      <LegalLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default LegalStickyFooter;