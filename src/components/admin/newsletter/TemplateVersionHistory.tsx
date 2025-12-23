import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { History, Save, RotateCcw, Eye, Clock, FileText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface TemplateVersion {
  id: string;
  campaign_id: string | null;
  version_number: number;
  version_name: string | null;
  html_content: string;
  subject: string | null;
  intro_text: string | null;
  created_at: string;
  notes: string | null;
}

interface TemplateVersionHistoryProps {
  campaignId?: string | null;
  currentHtml: string;
  currentSubject?: string;
  currentIntro?: string;
  onRestore: (html: string, subject?: string, intro?: string) => void;
}

export const TemplateVersionHistory: React.FC<TemplateVersionHistoryProps> = ({
  campaignId,
  currentHtml,
  currentSubject,
  currentIntro,
  onRestore,
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [versionName, setVersionName] = useState('');
  const [versionNotes, setVersionNotes] = useState('');
  const [previewVersion, setPreviewVersion] = useState<TemplateVersion | null>(null);

  // Fetch versions
  const { data: versions, isLoading } = useQuery({
    queryKey: ['template-versions', campaignId],
    queryFn: async () => {
      let query = supabase
        .from('newsletter_template_versions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as TemplateVersion[];
    },
    enabled: true,
  });

  // Save version mutation
  const saveVersionMutation = useMutation({
    mutationFn: async () => {
      const nextVersion = (versions?.length || 0) + 1;
      const { error } = await supabase
        .from('newsletter_template_versions')
        .insert({
          campaign_id: campaignId || null,
          version_number: nextVersion,
          version_name: versionName || `Versión ${nextVersion}`,
          html_content: currentHtml,
          subject: currentSubject,
          intro_text: currentIntro,
          notes: versionNotes || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['template-versions'] });
      toast({ title: '✓ Versión guardada' });
      setSaveDialogOpen(false);
      setVersionName('');
      setVersionNotes('');
    },
    onError: () => {
      toast({ title: 'Error al guardar versión', variant: 'destructive' });
    },
  });

  const handlePreview = (version: TemplateVersion) => {
    setPreviewVersion(version);
    setPreviewDialogOpen(true);
  };

  const handleRestore = (version: TemplateVersion) => {
    onRestore(version.html_content, version.subject || undefined, version.intro_text || undefined);
    toast({ title: '✓ Versión restaurada' });
    setPreviewDialogOpen(false);
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              <CardTitle className="text-base">Historial de Versiones</CardTitle>
            </div>
            <Button size="sm" onClick={() => setSaveDialogOpen(true)} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Guardar Versión
            </Button>
          </div>
          <CardDescription>
            Guarda y restaura versiones anteriores de tu newsletter
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4 text-muted-foreground">Cargando...</div>
          ) : !versions?.length ? (
            <div className="text-center py-6 text-muted-foreground">
              <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No hay versiones guardadas</p>
              <p className="text-xs">Guarda una versión para poder restaurarla después</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between p-2 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                          {version.version_name || `Versión ${version.version_number}`}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          v{version.version_number}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>
                          {formatDistanceToNow(new Date(version.created_at), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                        {version.notes && (
                          <span className="truncate max-w-[150px]">• {version.notes}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handlePreview(version)}
                        className="h-7 w-7 p-0"
                        title="Vista previa"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestore(version)}
                        className="h-7 w-7 p-0"
                        title="Restaurar"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Save Version Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Versión</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium">Nombre de la versión</label>
              <Input
                value={versionName}
                onChange={(e) => setVersionName(e.target.value)}
                placeholder="Ej: Versión con nuevo header"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Notas (opcional)</label>
              <Input
                value={versionNotes}
                onChange={(e) => setVersionNotes(e.target.value)}
                placeholder="Ej: Cambios realizados..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => saveVersionMutation.mutate()}
              disabled={saveVersionMutation.isPending}
            >
              {saveVersionMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Vista Previa: {previewVersion?.version_name || `Versión ${previewVersion?.version_number}`}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <iframe
              srcDoc={previewVersion?.html_content || ''}
              title="Version Preview"
              className="w-full h-[calc(80vh-140px)] border rounded-lg"
              sandbox="allow-same-origin"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Cerrar
            </Button>
            <Button onClick={() => previewVersion && handleRestore(previewVersion)} className="gap-1.5">
              <RotateCcw className="h-4 w-4" />
              Restaurar Esta Versión
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
