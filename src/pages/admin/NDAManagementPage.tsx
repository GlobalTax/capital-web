import React, { useState } from 'react';
import { Shield, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { NDADocumentsTable } from '@/features/fase0-documents/components/NDADocumentsTable';
import { NDADetailSheet } from '@/features/fase0-documents/components/NDADetailSheet';
import { Fase0TemplatesList } from '@/features/fase0-documents/components';
import { Fase0DocumentModal } from '@/features/fase0-documents/components/Fase0DocumentModal';
import type { Fase0Document } from '@/features/fase0-documents/types';

const NDAManagementPage: React.FC = () => {
  const [selectedDoc, setSelectedDoc] = useState<Fase0Document | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const handleSelectDocument = (doc: Fase0Document) => {
    setSelectedDoc(doc);
    setSheetOpen(true);
  };

  const handleEditTemplate = (templateId: string) => {
    console.log('Edit template:', templateId);
  };

  const handlePreviewTemplate = (templateId: string) => {
    console.log('Preview template:', templateId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Gestión de NDAs
          </h1>
          <p className="text-muted-foreground mt-1">
            Acuerdos de confidencialidad y propuestas de mandato
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nuevo documento
        </Button>
      </div>

      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="templates">Plantillas</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <NDADocumentsTable onSelectDocument={handleSelectDocument} />
        </TabsContent>

        <TabsContent value="templates">
          <Fase0TemplatesList
            onEdit={handleEditTemplate}
            onPreview={handlePreviewTemplate}
          />
        </TabsContent>
      </Tabs>

      {/* Detail sheet */}
      <NDADetailSheet
        document={selectedDoc}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />

      {/* Create modal - uses existing Fase0DocumentModal */}
      {createModalOpen && (
        <Fase0DocumentModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          documentType="nda"
          leadId=""
          leadType="contact"
          leadData={{}}
        />
      )}
    </div>
  );
};

export default NDAManagementPage;
