import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Edit, Trash2, Eye } from 'lucide-react';
import { useFase0Templates, useDeleteFase0Template } from '../hooks/useFase0Templates';
import { FASE0_DOCUMENT_TYPE_LABELS, type Fase0DocumentType } from '../types';
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

interface Fase0TemplatesListProps {
  onEdit?: (templateId: string) => void;
  onPreview?: (templateId: string) => void;
}

const TYPE_ICONS: Record<Fase0DocumentType, string> = {
  nda: '🔒',
  mandato_venta: '📤',
  mandato_compra: '📥',
};

export const Fase0TemplatesList: React.FC<Fase0TemplatesListProps> = ({
  onEdit,
  onPreview,
}) => {
  const { data: templates, isLoading } = useFase0Templates();
  const deleteTemplate = useDeleteFase0Template();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!templates?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No hay plantillas disponibles</p>
        </CardContent>
      </Card>
    );
  }

  // Agrupar por tipo
  const groupedTemplates = templates.reduce((acc, template) => {
    const type = template.document_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(template);
    return acc;
  }, {} as Record<Fase0DocumentType, typeof templates>);

  return (
    <div className="space-y-6">
      {(Object.keys(groupedTemplates) as Fase0DocumentType[]).map((type) => (
        <div key={type}>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <span>{TYPE_ICONS[type]}</span>
            {FASE0_DOCUMENT_TYPE_LABELS[type]}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {groupedTemplates[type].map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge variant="outline" className="text-xs">
                      v{template.version}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {template.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {template.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground mb-4">
                    {template.sections.length} secciones · {template.available_variables.length} variables
                  </div>
                  <div className="flex gap-2">
                    {onPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onPreview(template.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(template.id)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción desactivará la plantilla "{template.name}".
                            Los documentos ya generados no se verán afectados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteTemplate.mutate(template.id)}
                            className="bg-destructive text-destructive-foreground"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
