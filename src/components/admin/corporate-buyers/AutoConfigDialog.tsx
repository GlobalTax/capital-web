// =============================================
// AUTO-CONFIG DIALOG
// Batch auto-configuration of buyer criteria
// =============================================

import { useState, useMemo } from 'react';
import { 
  Target, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Sparkles,
  Tag,
  MapPin,
  Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAutoConfigCorporateBuyers } from '@/hooks/useAutoConfigCorporateBuyers';
import type { CorporateBuyer } from '@/types/corporateBuyers';
import { cn } from '@/lib/utils';

interface AutoConfigDialogProps {
  open: boolean;
  onClose: () => void;
  buyers: CorporateBuyer[];
  onComplete?: () => void;
}

type Phase = 'preview' | 'processing' | 'complete';

interface ProcessingStats {
  configured: number;
  skipped: number;
  errors: number;
  currentIndex: number;
  currentBuyerName: string;
}

export function AutoConfigDialog({ 
  open, 
  onClose, 
  buyers,
  onComplete 
}: AutoConfigDialogProps) {
  const [phase, setPhase] = useState<Phase>('preview');
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [stats, setStats] = useState<ProcessingStats>({
    configured: 0,
    skipped: 0,
    errors: 0,
    currentIndex: 0,
    currentBuyerName: ''
  });

  const { autoConfigBatch } = useAutoConfigCorporateBuyers();

  // Calculate candidates
  const analysisStats = useMemo(() => {
    const withDescription = buyers.filter(b => b.description && b.description.length >= 50);
    const withoutSectors = buyers.filter(b => !b.sector_focus || b.sector_focus.length === 0);
    const withoutGeo = buyers.filter(b => !b.geography_focus || b.geography_focus.length === 0);
    const withoutKeywords = buyers.filter(b => !b.search_keywords || b.search_keywords.length === 0);
    
    const candidates = withDescription.filter(b => 
      (!b.sector_focus || b.sector_focus.length === 0) ||
      (!b.geography_focus || b.geography_focus.length === 0) ||
      (!b.search_keywords || b.search_keywords.length === 0)
    );

    return {
      total: buyers.length,
      withDescription: withDescription.length,
      withoutSectors: withoutSectors.length,
      withoutGeo: withoutGeo.length,
      withoutKeywords: withoutKeywords.length,
      candidates: candidates.length,
      candidateIds: candidates.map(b => b.id)
    };
  }, [buyers]);

  const handleStartAutoConfig = async () => {
    setPhase('processing');
    setStats({
      configured: 0,
      skipped: 0,
      errors: 0,
      currentIndex: 0,
      currentBuyerName: buyers[0]?.name || ''
    });

    try {
      const result = await autoConfigBatch.mutateAsync({
        buyerIds: overwriteExisting ? buyers.map(b => b.id) : analysisStats.candidateIds,
        overwriteExisting
      });

      setStats({
        configured: result.configured,
        skipped: result.skipped,
        errors: result.errors,
        currentIndex: result.total_processed,
        currentBuyerName: ''
      });

      setPhase('complete');
    } catch (error) {
      console.error('Auto-config failed:', error);
      setPhase('complete');
    }
  };

  const handleClose = () => {
    if (phase === 'complete') {
      onComplete?.();
    }
    setPhase('preview');
    setStats({ configured: 0, skipped: 0, errors: 0, currentIndex: 0, currentBuyerName: '' });
    onClose();
  };

  const progress = phase === 'processing' 
    ? Math.round((stats.currentIndex / (overwriteExisting ? buyers.length : analysisStats.candidates)) * 100)
    : phase === 'complete' ? 100 : 0;

  // Calculate coverage improvement
  const coverageBefore = {
    sectors: Math.round(((buyers.length - analysisStats.withoutSectors) / buyers.length) * 100),
    keywords: Math.round(((buyers.length - analysisStats.withoutKeywords) / buyers.length) * 100),
    geo: Math.round(((buyers.length - analysisStats.withoutGeo) / buyers.length) * 100)
  };

  const coverageAfter = {
    sectors: Math.round(((buyers.length - analysisStats.withoutSectors + stats.configured) / buyers.length) * 100),
    keywords: Math.round(((buyers.length - analysisStats.withoutKeywords + stats.configured) / buyers.length) * 100),
    geo: Math.round(((buyers.length - analysisStats.withoutGeo + stats.configured) / buyers.length) * 100)
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Auto-configurar Criterios de Búsqueda
          </DialogTitle>
          <DialogDescription>
            {phase === 'preview' && 'Genera automáticamente sectores, geografía y keywords usando IA'}
            {phase === 'processing' && 'Procesando compradores...'}
            {phase === 'complete' && 'Auto-configuración completada'}
          </DialogDescription>
        </DialogHeader>

        {/* Preview Phase */}
        {phase === 'preview' && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium">📊 Análisis de selección:</h4>
              
              <div className="grid gap-2">
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-blue-500" />
                  <span className="text-muted-foreground">Sin sector_focus:</span>
                  <Badge variant="outline">{analysisStats.withoutSectors}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Sin geography_focus:</span>
                  <Badge variant="outline">{analysisStats.withoutGeo}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Search className="h-4 w-4 text-purple-500" />
                  <span className="text-muted-foreground">Sin search_keywords:</span>
                  <Badge variant="outline">{analysisStats.withoutKeywords}</Badge>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-sm">
                  <span className="font-medium">{analysisStats.candidates}</span> compradores tienen descripción y les faltan criterios
                </p>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3 text-sm">
              <p className="text-blue-700 dark:text-blue-300">
                Se generarán criterios usando IA basándose en:
              </p>
              <ul className="mt-1 text-blue-600 dark:text-blue-400 text-xs space-y-0.5">
                <li>• Descripción del comprador</li>
                <li>• País base y ciudades</li>
                <li>• Website y tesis de inversión</li>
              </ul>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="overwrite"
                checked={overwriteExisting}
                onCheckedChange={(checked) => setOverwriteExisting(checked === true)}
              />
              <label 
                htmlFor="overwrite" 
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Sobrescribir criterios existentes
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleStartAutoConfig}
                disabled={analysisStats.candidates === 0 && !overwriteExisting}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Iniciar Auto-configuración
              </Button>
            </div>
          </div>
        )}

        {/* Processing Phase */}
        {phase === 'processing' && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Procesando...</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {stats.currentBuyerName 
                  ? `Analizando: ${stats.currentBuyerName}` 
                  : 'Iniciando...'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.configured}</p>
                <p className="text-xs text-muted-foreground">Configurados</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">{stats.skipped}</p>
                <p className="text-xs text-muted-foreground">Omitidos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
            </div>
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                <p className="text-2xl font-bold text-green-600">{stats.configured}</p>
                <p className="text-xs text-muted-foreground">Configurados</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                <p className="text-2xl font-bold text-amber-600">{stats.skipped}</p>
                <p className="text-xs text-muted-foreground">Omitidos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20">
                <p className="text-2xl font-bold text-red-600">{stats.errors}</p>
                <p className="text-xs text-muted-foreground">Errores</p>
              </div>
            </div>

            {stats.configured > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">📈 Cobertura de datos mejorada:</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">sector_focus:</span>
                    <span>
                      <span className="text-muted-foreground">{coverageBefore.sectors}%</span>
                      <span className="mx-1">→</span>
                      <span className="font-medium text-green-600">{Math.min(coverageAfter.sectors, 100)}%</span>
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">search_keywords:</span>
                    <span>
                      <span className="text-muted-foreground">{coverageBefore.keywords}%</span>
                      <span className="mx-1">→</span>
                      <span className="font-medium text-green-600">{Math.min(coverageAfter.keywords, 100)}%</span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
