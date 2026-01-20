import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { 
  GitBranch, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Shield,
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import type { Slide } from '../types/presentation.types';

interface VersionManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  currentVersion: number;
  slides: Slide[];
  onCreateVersion: (options: {
    versionNotes: string;
    regenerateDrafts: boolean;
  }) => Promise<void>;
  isCreating?: boolean;
}

export const VersionManager: React.FC<VersionManagerProps> = ({
  open,
  onOpenChange,
  projectId,
  currentVersion,
  slides,
  onCreateVersion,
  isCreating = false
}) => {
  const [versionNotes, setVersionNotes] = useState('');
  const [regenerateDrafts, setRegenerateDrafts] = useState(true);

  // Categorize slides
  const approvedSlides = slides.filter(
    s => s.approval_status === 'approved' || s.is_locked
  );
  const draftSlides = slides.filter(
    s => s.approval_status !== 'approved' && !s.is_locked
  );

  const handleCreate = async () => {
    await onCreateVersion({
      versionNotes: versionNotes || `Versión ${currentVersion + 1}`,
      regenerateDrafts
    });
    setVersionNotes('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Crear Nueva Versión
          </DialogTitle>
          <DialogDescription>
            Versión actual: <Badge variant="outline">v{currentVersion}</Badge>
            {' → '}
            Nueva versión: <Badge>v{currentVersion + 1}</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Version Notes */}
          <div className="space-y-2">
            <Label htmlFor="version-notes">Notas de versión</Label>
            <Input
              id="version-notes"
              placeholder={`Versión ${currentVersion + 1} - Cambios principales...`}
              value={versionNotes}
              onChange={(e) => setVersionNotes(e.target.value)}
            />
          </div>

          <Separator />

          {/* Slide Summary */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Resumen de Slides</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {/* Approved */}
              <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    Preservados
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {approvedSlides.length}
                  </Badge>
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-500">
                  Estos slides están aprobados y no se modificarán.
                </p>
              </div>

              {/* Drafts */}
              <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/20 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <RefreshCw className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-400">
                    Borradores
                  </span>
                  <Badge variant="secondary" className="ml-auto">
                    {draftSlides.length}
                  </Badge>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-500">
                  Estos slides pueden regenerarse con IA.
                </p>
              </div>
            </div>
          </div>

          {/* Slide List Preview */}
          <ScrollArea className="h-[160px] rounded-md border p-3">
            <div className="space-y-2">
              {slides.map((slide, index) => {
                const isApproved = slide.approval_status === 'approved' || slide.is_locked;
                return (
                  <div 
                    key={slide.id}
                    className="flex items-center gap-3 py-1.5 px-2 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-xs text-muted-foreground w-5">
                      {index + 1}
                    </span>
                    {isApproved ? (
                      <Lock className="h-3.5 w-3.5 text-emerald-600" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <span className="text-sm flex-1 truncate">
                      {slide.headline || `Slide ${index + 1}`}
                    </span>
                    <Badge 
                      variant={isApproved ? "default" : "outline"}
                      className="text-xs"
                    >
                      {isApproved ? 'Aprobado' : 'Borrador'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <Separator />

          {/* Regeneration Option */}
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="regenerate" className="text-sm font-medium">
                Regenerar borradores con IA
              </Label>
              <p className="text-xs text-muted-foreground">
                Los slides no aprobados se regenerarán con contenido nuevo
              </p>
            </div>
            <Switch
              id="regenerate"
              checked={regenerateDrafts}
              onCheckedChange={setRegenerateDrafts}
              disabled={draftSlides.length === 0}
            />
          </div>

          {/* Warning if no drafts */}
          {draftSlides.length === 0 && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <p className="text-xs">
                Todos los slides están aprobados. La nueva versión será idéntica 
                a la actual. Desbloquea slides si deseas regenerar contenido.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleCreate} disabled={isCreating}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Crear v{currentVersion + 1}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VersionManager;
