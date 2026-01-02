import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Fase0TemplatesList } from '@/features/fase0-documents/components';
import { FileText } from 'lucide-react';

const Fase0TemplatesPage: React.FC = () => {
  const handleEditTemplate = (templateId: string) => {
    // TODO: Abrir editor de template
    console.log('Edit template:', templateId);
  };

  const handlePreviewTemplate = (templateId: string) => {
    // TODO: Abrir preview de template
    console.log('Preview template:', templateId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Documentos Fase 0
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestiona las plantillas de NDA y Propuestas de Mandato
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantillas Disponibles</CardTitle>
          <CardDescription>
            Plantillas base para generar documentos pre-mandato
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Fase0TemplatesList
            onEdit={handleEditTemplate}
            onPreview={handlePreviewTemplate}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Fase0TemplatesPage;
