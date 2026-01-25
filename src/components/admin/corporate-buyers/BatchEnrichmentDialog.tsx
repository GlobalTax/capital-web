// =============================================
// BATCH ENRICHMENT DIALOG
// =============================================

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { useBatchEnrichCorporateBuyers, BatchEnrichResult } from '@/hooks/useBatchEnrichCorporateBuyers';
import { CorporateBuyer } from '@/types/corporateBuyers';
import { cn } from '@/lib/utils';

interface BatchEnrichmentDialogProps {
  open: boolean;
  onClose: () => void;
  buyers: CorporateBuyer[];
  onComplete?: () => void;
}

type DialogPhase = 'preview' | 'processing' | 'complete';

export function BatchEnrichmentDialog({
  open,
  onClose,
  buyers,
  onComplete,
}: BatchEnrichmentDialogProps) {
  const [force, setForce] = useState(false);
  const [showErrorDetails, setShowErrorDetails] = useState(false);
  const { startBatchEnrich, isProcessing, results, reset } = useBatchEnrichCorporateBuyers();

  // Calculate stats
  const stats = useMemo(() => {
    const withWebsite = buyers.filter(b => b.website);
    const withDescription = buyers.filter(b => b.description);
    const withSectors = buyers.filter(b => b.sector_focus && b.sector_focus.length > 0);
    
    return {
      total: buyers.length,
      withWebsite: withWebsite.length,
      withoutWebsite: buyers.length - withWebsite.length,
      withDescription: withDescription.length,
      withSectors: withSectors.length,
      alreadyComplete: buyers.filter(b => b.description && b.sector_focus?.length).length,
    };
  }, [buyers]);

  // Determine dialog phase
  const phase: DialogPhase = useMemo(() => {
    if (results) return 'complete';
    if (isProcessing) return 'processing';
    return 'preview';
  }, [results, isProcessing]);

  const handleStartEnrichment = () => {
    const buyerIds = buyers.filter(b => b.website).map(b => b.id);
    if (buyerIds.length === 0) return;
    startBatchEnrich({ buyerIds, force });
  };

  const handleClose = () => {
    if (isProcessing) return; // Prevent closing during processing
    reset();
    onClose();
    if (results && onComplete) {
      onComplete();
    }
  };

  // Get error results for details
  const errorResults = useMemo(() => {
    if (!results) return [];
    return results.results.filter(r => r.status === 'error');
  }, [results]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className={cn("h-5 w-5", isProcessing && "animate-spin")} />
            {phase === 'preview' && `Enriquecer ${stats.withWebsite} Compradores`}
            {phase === 'processing' && 'Enriqueciendo...'}
            {phase === 'complete' && 'Enriquecimiento Completado'}
          </DialogTitle>
          <DialogDescription>
            {phase === 'preview' && 'Revisa la selección antes de iniciar el proceso'}
            {phase === 'processing' && 'Este proceso puede tardar varios minutos'}
            {phase === 'complete' && 'Resumen del enriquecimiento batch'}
          </DialogDescription>
        </DialogHeader>

        {/* Preview Phase */}
        {phase === 'preview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <Globe className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{stats.withWebsite}</p>
                  <p className="text-xs text-muted-foreground">Con website</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{stats.withoutWebsite}</p>
                  <p className="text-xs text-muted-foreground">Sin website</p>
                </div>
              </div>
            </div>

            {stats.alreadyComplete > 0 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {stats.alreadyComplete} ya tienen descripción y sectores
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Se omitirán a menos que marques "sobrescribir"
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center space-x-2 p-3 border rounded-lg">
              <Checkbox
                id="force"
                checked={force}
                onCheckedChange={(checked) => setForce(checked === true)}
              />
              <Label htmlFor="force" className="text-sm cursor-pointer">
                Sobrescribir campos existentes
              </Label>
            </div>

            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              ⏱️ Tiempo estimado: ~{Math.ceil(stats.withWebsite * 3 / 60)} minutos
              <br />
              📡 Se procesarán secuencialmente para evitar límites de API
            </div>
          </div>
        )}

        {/* Processing Phase */}
        {phase === 'processing' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Procesando {stats.withWebsite} compradores...
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Por favor, no cierres esta ventana
              </p>
            </div>
            <Progress value={50} className="h-2" />
          </div>
        )}

        {/* Complete Phase */}
        {phase === 'complete' && results && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">{results.enriched}</p>
                  <p className="text-xs text-muted-foreground">Enriquecidos</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{results.skipped}</p>
                  <p className="text-xs text-muted-foreground">Omitidos</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{results.no_website}</p>
                  <p className="text-xs text-muted-foreground">Sin website</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">{results.errors}</p>
                  <p className="text-xs text-muted-foreground">Errores</p>
                </div>
              </div>
            </div>

            {errorResults.length > 0 && (
              <div className="border rounded-lg">
                <button
                  onClick={() => setShowErrorDetails(!showErrorDetails)}
                  className="w-full flex items-center justify-between p-3 text-sm hover:bg-muted/50"
                >
                  <span className="font-medium text-red-600">
                    Ver detalle de errores ({errorResults.length})
                  </span>
                  {showErrorDetails ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {showErrorDetails && (
                  <ScrollArea className="h-32 border-t">
                    <div className="p-2 space-y-2">
                      {errorResults.map((result) => (
                        <div key={result.buyer_id} className="text-xs p-2 bg-red-50 dark:bg-red-950/30 rounded">
                          <p className="font-medium">{result.buyer_name}</p>
                          <p className="text-muted-foreground">{result.error_message}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
            )}

            {results.enriched > 0 && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✅ {results.enriched} perfiles actualizados con éxito
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {phase === 'preview' && (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button 
                onClick={handleStartEnrichment}
                disabled={stats.withWebsite === 0}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Iniciar Enriquecimiento
              </Button>
            </>
          )}
          {phase === 'processing' && (
            <Button variant="outline" disabled>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </Button>
          )}
          {phase === 'complete' && (
            <Button onClick={handleClose}>
              Cerrar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
