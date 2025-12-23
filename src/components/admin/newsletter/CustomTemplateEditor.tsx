import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Eye, Code, Save, Copy, Trash2 } from 'lucide-react';

interface CustomTemplate {
  id: string;
  name: string;
  description: string | null;
  html_content: string;
  subject_template: string | null;
  default_intro: string | null;
  theme_id: string | null;
  is_active: boolean;
  created_at: string;
}

interface CustomTemplateEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: CustomTemplate | null;
  duplicateFromHtml?: string;
  onSave?: () => void;
}

export const CustomTemplateEditor: React.FC<CustomTemplateEditorProps> = ({
  open,
  onOpenChange,
  template,
  duplicateFromHtml,
  onSave,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [subjectTemplate, setSubjectTemplate] = useState('');
  const [defaultIntro, setDefaultIntro] = useState('');

  // Reset form when opening
  useEffect(() => {
    if (open) {
      if (template) {
        setName(template.name);
        setDescription(template.description || '');
        setHtmlContent(template.html_content);
        setSubjectTemplate(template.subject_template || '');
        setDefaultIntro(template.default_intro || '');
      } else if (duplicateFromHtml) {
        setName('');
        setDescription('');
        setHtmlContent(duplicateFromHtml);
        setSubjectTemplate('');
        setDefaultIntro('');
      } else {
        setName('');
        setDescription('');
        setHtmlContent('');
        setSubjectTemplate('');
        setDefaultIntro('');
      }
    }
  }, [open, template, duplicateFromHtml]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      if (template) {
        // Update existing
        const { error } = await supabase
          .from('custom_newsletter_templates')
          .update({
            name,
            description: description || null,
            html_content: htmlContent,
            subject_template: subjectTemplate || null,
            default_intro: defaultIntro || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', template.id);
        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('custom_newsletter_templates')
          .insert({
            name,
            description: description || null,
            html_content: htmlContent,
            subject_template: subjectTemplate || null,
            default_intro: defaultIntro || null,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates'] });
      toast({ title: '✓ Template guardado' });
      onOpenChange(false);
      onSave?.();
    },
    onError: () => {
      toast({ title: 'Error al guardar', variant: 'destructive' });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!template) return;
      const { error } = await supabase
        .from('custom_newsletter_templates')
        .delete()
        .eq('id', template.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-templates'] });
      toast({ title: '✓ Template eliminado' });
      onOpenChange(false);
      onSave?.();
    },
    onError: () => {
      toast({ title: 'Error al eliminar', variant: 'destructive' });
    },
  });

  const isValid = name.trim() && htmlContent.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>
            {template ? 'Editar Template' : duplicateFromHtml ? 'Duplicar como Template' : 'Nuevo Template'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Template Info */}
          <div className="px-6 py-4 border-b space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre del template *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Newsletter Semanal"
                />
              </div>
              <div>
                <Label>Asunto por defecto</Label>
                <Input
                  value={subjectTemplate}
                  onChange={(e) => setSubjectTemplate(e.target.value)}
                  placeholder="Ej: 📈 Nuevas oportunidades de inversión"
                />
              </div>
            </div>
            <div>
              <Label>Descripción</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Template para newsletters semanales con operaciones"
              />
            </div>
          </div>

          {/* HTML Editor / Preview */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'edit' | 'preview')} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-2 border-b">
              <TabsList>
                <TabsTrigger value="edit" className="gap-2">
                  <Code className="h-4 w-4" />
                  Código HTML
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Vista Previa
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="edit" className="flex-1 m-0 overflow-hidden">
              <Textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="Pega aquí el código HTML del template..."
                className="h-full font-mono text-xs border-0 rounded-none resize-none"
              />
            </TabsContent>

            <TabsContent value="preview" className="flex-1 m-0 overflow-hidden bg-slate-100">
              <div className="h-full p-4 overflow-auto">
                <div className="mx-auto bg-white rounded-lg shadow-lg overflow-hidden" style={{ maxWidth: 600 }}>
                  <iframe
                    srcDoc={htmlContent}
                    title="Template Preview"
                    className="w-full h-[calc(85vh-350px)] border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <div className="flex justify-between w-full">
            <div>
              {template && (
                <Button
                  variant="destructive"
                  onClick={() => deleteMutation.mutate()}
                  disabled={deleteMutation.isPending}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Eliminar
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button
                onClick={() => saveMutation.mutate()}
                disabled={!isValid || saveMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {saveMutation.isPending ? 'Guardando...' : 'Guardar Template'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Hook to fetch custom templates
export const useCustomTemplates = () => {
  return useQuery({
    queryKey: ['custom-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_newsletter_templates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as CustomTemplate[];
    },
  });
};
