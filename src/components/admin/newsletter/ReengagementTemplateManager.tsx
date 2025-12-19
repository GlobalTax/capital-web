import React, { useState } from 'react';
import { Plus, Lock, Trash2, Eye, Pencil, RefreshCw, Clock, TrendingUp, Calendar, Mail, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
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
import { useReengagementTemplates, ReengagementTemplate } from '@/hooks/useReengagementTemplates';
import { CreateReengagementModal } from './CreateReengagementModal';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, React.ElementType> = {
  'clock': Clock,
  'refresh-cw': RefreshCw,
  'trending-up': TrendingUp,
  'calendar': Calendar,
  'mail': Mail,
};

interface ReengagementTemplateManagerProps {
  onSelectTemplate?: (template: ReengagementTemplate) => void;
  selectedTemplateId?: string;
}

export const ReengagementTemplateManager: React.FC<ReengagementTemplateManagerProps> = ({
  onSelectTemplate,
  selectedTemplateId,
}) => {
  const { templates, isLoading, deleteTemplate } = useReengagementTemplates();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate.mutateAsync(templateToDelete);
      setTemplateToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Templates de Re-engagement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const systemTemplates = templates?.filter(t => t.is_system) || [];
  const customTemplates = templates?.filter(t => !t.is_system) || [];

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Templates de Re-engagement
              </CardTitle>
              <CardDescription>
                Gestiona los templates de email para recuperación de leads
              </CardDescription>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Crear con IA
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {/* System Templates */}
              {systemTemplates.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Lock className="h-3 w-3" />
                    Templates del Sistema
                  </h4>
                  {systemTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={() => onSelectTemplate?.(template)}
                    />
                  ))}
                </div>
              )}

              {/* Custom Templates */}
              {customTemplates.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Sparkles className="h-3 w-3" />
                    Templates Personalizados
                  </h4>
                  {customTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={() => onSelectTemplate?.(template)}
                      onDelete={() => setTemplateToDelete(template.id)}
                    />
                  ))}
                </div>
              )}

              {templates?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No hay templates disponibles</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setShowCreateModal(true)}
                  >
                    Crear primer template
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Create Modal */}
      <CreateReengagementModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar template?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El template será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// Template Card Component
interface TemplateCardProps {
  template: ReengagementTemplate;
  isSelected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const Icon = ICON_MAP[template.icon] || Mail;

  return (
    <div
      className={cn(
        'rounded-lg border p-4 transition-all cursor-pointer hover:shadow-md',
        isSelected
          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
          : 'hover:border-muted-foreground/50'
      )}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div
            className={cn(
              'p-2 rounded-lg shrink-0',
              isSelected ? 'bg-primary/10' : 'bg-muted'
            )}
          >
            <Icon
              className={cn(
                'h-4 w-4',
                isSelected ? 'text-primary' : 'text-muted-foreground'
              )}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-medium text-sm truncate">{template.label}</h5>
              {template.is_system && (
                <Badge variant="secondary" className="text-xs shrink-0">
                  <Lock className="h-2.5 w-2.5 mr-1" />
                  Sistema
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
              {template.description}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {template.trigger_condition}
              </Badge>
              {template.variables_used?.slice(0, 2).map((v) => (
                <Badge key={v} variant="secondary" className="text-xs font-mono">
                  {v}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
          {!template.is_system && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
