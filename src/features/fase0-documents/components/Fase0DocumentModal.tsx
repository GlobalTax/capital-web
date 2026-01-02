import React, { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Send, Download, Save } from 'lucide-react';
import { toast } from 'sonner';
import { useFase0Templates } from '../hooks/useFase0Templates';
import { 
  useCreateFase0Document, 
  prefillDataFromLead,
  replaceVariables,
} from '../hooks/useFase0Documents';
import {
  type Fase0DocumentType,
  type Fase0LeadType,
  type Fase0FilledData,
  FASE0_DOCUMENT_TYPE_LABELS,
  FASE0_VARIABLE_LABELS,
  FASE0_VARIABLES_BY_TYPE,
} from '../types';

interface Fase0DocumentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentType: Fase0DocumentType;
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
  onSuccess?: (documentId: string) => void;
}

export const Fase0DocumentModal: React.FC<Fase0DocumentModalProps> = ({
  open,
  onOpenChange,
  documentType,
  leadId,
  leadType,
  leadData,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'preview'>('form');
  const [formData, setFormData] = useState<Fase0FilledData>({});
  
  const { data: templates, isLoading: loadingTemplates } = useFase0Templates(documentType);
  const createDocument = useCreateFase0Document();
  
  const template = templates?.[0]; // Use first active template
  const variables = FASE0_VARIABLES_BY_TYPE[documentType] || [];

  // Pre-fill data when modal opens
  useEffect(() => {
    if (open && leadData) {
      const prefilled = prefillDataFromLead(leadData, documentType);
      setFormData(prefilled);
    }
  }, [open, leadData, documentType]);

  // Generate preview content
  const previewContent = useMemo(() => {
    if (!template) return '';
    
    return template.sections
      .map((section) => {
        const content = replaceVariables(section.content, formData);
        return `## ${section.title}\n\n${content}`;
      })
      .join('\n\n---\n\n');
  }, [template, formData]);

  const handleFieldChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    try {
      const result = await createDocument.mutateAsync({
        template_id: template?.id,
        document_type: documentType,
        lead_id: leadId,
        lead_type: leadType,
        filled_data: formData,
      });
      
      toast.success('Borrador guardado');
      onSuccess?.(result.id);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleGeneratePDF = async () => {
    // For now, save as draft - PDF generation will be added later
    await handleSaveDraft();
    toast.info('Generación de PDF próximamente disponible');
  };

  if (loadingTemplates) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!template) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            No hay plantilla disponible para {FASE0_DOCUMENT_TYPE_LABELS[documentType]}.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {FASE0_DOCUMENT_TYPE_LABELS[documentType]}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'form' | 'preview')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="form">Datos</TabsTrigger>
            <TabsTrigger value="preview">Vista previa</TabsTrigger>
          </TabsList>

          <TabsContent value="form" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="grid gap-4 md:grid-cols-2">
                {variables.map((variable) => (
                  <div key={variable} className="space-y-2">
                    <Label htmlFor={variable}>
                      {FASE0_VARIABLE_LABELS[variable] || variable}
                    </Label>
                    {variable.includes('direccion') || variable.includes('experiencia') ? (
                      <Textarea
                        id={variable}
                        value={formData[variable] || ''}
                        onChange={(e) => handleFieldChange(variable, e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <Input
                        id={variable}
                        value={formData[variable] || ''}
                        onChange={(e) => handleFieldChange(variable, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <ScrollArea className="h-[60vh] pr-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-lg">
                  {previewContent}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={createDocument.isPending}
            >
              {createDocument.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Guardar borrador
            </Button>
            <Button onClick={handleGeneratePDF} disabled={createDocument.isPending}>
              <Download className="h-4 w-4 mr-2" />
              Generar PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
