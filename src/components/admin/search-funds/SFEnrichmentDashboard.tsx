import React from 'react';
import { Sparkles, Globe, FileText, Tags, RefreshCw, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useSFEnrichmentDashboard, SFEnrichmentResult } from '@/hooks/useSFBatchEnrich';

// Completeness progress bar component
interface CompletenessBarProps {
  label: string;
  icon: React.ReactNode;
  value: number;
  total: number;
}

const CompletenessBar: React.FC<CompletenessBarProps> = ({ label, icon, value, total }) => {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {icon}
          <span>{label}</span>
        </div>
        <span className="font-medium">
          {value}/{total} ({percentage}%)
        </span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

// Result row component
const ResultRow: React.FC<{ result: SFEnrichmentResult }> = ({ result }) => {
  const statusConfig = {
    enriched: { icon: CheckCircle2, color: 'text-green-500', badge: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' },
    skipped: { icon: AlertCircle, color: 'text-yellow-500', badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
    not_found: { icon: XCircle, color: 'text-gray-500', badge: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
    error: { icon: XCircle, color: 'text-red-500', badge: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  };

  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50">
      <div className="flex items-center gap-3">
        <Icon className={`h-4 w-4 ${config.color}`} />
        <span className="text-sm font-medium">{result.fundName}</span>
      </div>
      <div className="flex items-center gap-2">
        {result.fieldsUpdated.length > 0 && (
          <div className="flex gap-1">
            {result.fieldsUpdated.map(field => (
              <Badge key={field} variant="outline" className="text-[10px] h-5">
                {field}
              </Badge>
            ))}
          </div>
        )}
        <Badge className={config.badge}>
          {result.status === 'enriched' && 'Actualizado'}
          {result.status === 'skipped' && 'Sin cambios'}
          {result.status === 'not_found' && 'No encontrado'}
          {result.status === 'error' && 'Error'}
        </Badge>
      </div>
    </div>
  );
};

export const SFEnrichmentDashboard: React.FC = () => {
  const {
    stats,
    isLoadingStats,
    refetchStats,
    startEnrichment,
    isEnriching,
    lastResult,
    reset,
  } = useSFEnrichmentDashboard();

  const [showResults, setShowResults] = React.useState(false);

  // Calculate percentages
  const descPercent = stats ? Math.round((stats.withDescription / stats.total) * 100) : 0;
  const webPercent = stats ? Math.round((stats.withWebsite / stats.total) * 100) : 0;
  const sectorPercent = stats ? Math.round((stats.withSectors / stats.total) * 100) : 0;

  // Determine overall completeness
  const avgPercent = Math.round((descPercent + webPercent + sectorPercent) / 3);
  const needsAttention = avgPercent < 50;

  return (
    <Card className={needsAttention ? 'border-yellow-500/50' : ''}>
      <CardContent className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="font-medium">Completitud del Directorio</h3>
            {needsAttention && (
              <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                Requiere enriquecimiento
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetchStats()}
              disabled={isLoadingStats}
            >
              <RefreshCw className={`h-4 w-4 ${isLoadingStats ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              size="sm"
              onClick={() => startEnrichment({ limit: 25 })}
              disabled={isEnriching || isLoadingStats}
            >
              {isEnriching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enriqueciendo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Enriquecer (25)
                </>
              )}
            </Button>
          </div>
        </div>

        {isLoadingStats ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-1">
                <div className="h-4 bg-muted animate-pulse rounded" />
                <div className="h-2 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-3">
            <CompletenessBar
              label="Website"
              icon={<Globe className="h-4 w-4" />}
              value={stats.withWebsite}
              total={stats.total}
            />
            <CompletenessBar
              label="Descripción"
              icon={<FileText className="h-4 w-4" />}
              value={stats.withDescription}
              total={stats.total}
            />
            <CompletenessBar
              label="Sectores"
              icon={<Tags className="h-4 w-4" />}
              value={stats.withSectors}
              total={stats.total}
            />

            <div className="text-xs text-muted-foreground pt-2 border-t">
              {stats.needsEnrichment} funds pueden ser enriquecidos con Apollo
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            Error cargando estadísticas
          </div>
        )}

        {/* Last execution results */}
        {lastResult && (
          <Collapsible open={showResults} onOpenChange={setShowResults} className="mt-4 pt-4 border-t">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Último resultado: {lastResult.enriched} actualizados, {lastResult.notFound} no encontrados
                </span>
                <span className="text-xs text-muted-foreground">
                  {showResults ? 'Ocultar' : 'Ver detalles'}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="max-h-60 overflow-y-auto space-y-1 rounded-md border p-2">
                {lastResult.results.map((result) => (
                  <ResultRow key={result.fundId} result={result} />
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={reset}
                className="mt-2 text-xs"
              >
                Limpiar resultados
              </Button>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
};

export default SFEnrichmentDashboard;
