import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  AlertTriangle, ExternalLink, Check, 
  Trash2, RefreshCw, TrendingDown 
} from 'lucide-react';
import { usePortfolioNews, useMarkNewsProcessed, useDeletePortfolioNews, useScanPortfolioNews } from '@/hooks/usePortfolioIntelligence';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ExitSignalsPanel = () => {
  const { data: exitSignals = [], isLoading } = usePortfolioNews({ isExitSignal: true });
  const markProcessedMutation = useMarkNewsProcessed();
  const deleteNewsMutation = useDeletePortfolioNews();
  const scanMutation = useScanPortfolioNews();

  const unprocessed = exitSignals.filter(n => !n.is_processed);
  const processed = exitSignals.filter(n => n.is_processed);

  const handleMarkProcessed = async (newsId: string) => {
    await markProcessedMutation.mutateAsync(newsId);
  };

  const handleDelete = async (newsId: string) => {
    await deleteNewsMutation.mutateAsync(newsId);
  };

  const handleScan = async () => {
    await scanMutation.mutateAsync({ limit: 20 });
  };

  const getNewsTypeBadge = (type: string | null) => {
    const typeConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      exit: { label: 'Exit', variant: 'destructive' },
      acquisition: { label: 'Adquisición', variant: 'default' },
      growth: { label: 'Crecimiento', variant: 'secondary' },
      crisis: { label: 'Crisis', variant: 'destructive' },
      funding: { label: 'Financiación', variant: 'outline' },
      partnership: { label: 'Partnership', variant: 'outline' },
      management: { label: 'Management', variant: 'secondary' },
    };
    
    const config = typeConfig[type || 'other'] || { label: type || 'Otro', variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-orange-500" />
            Señales de Desinversión
          </h3>
          <p className="text-sm text-muted-foreground">
            Noticias que sugieren posibles exits de empresas del portfolio
          </p>
        </div>
        <Button 
          onClick={handleScan}
          disabled={scanMutation.isPending}
          size="sm"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
          Buscar Noticias
        </Button>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <div>
                <div className="text-xl font-bold">{unprocessed.length}</div>
                <div className="text-xs text-muted-foreground">Sin revisar</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-green-500" />
              <div>
                <div className="text-xl font-bold">{processed.length}</div>
                <div className="text-xs text-muted-foreground">Revisadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exit signals table */}
      {unprocessed.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Señales pendientes de revisión</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Noticia</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unprocessed.map((signal) => (
                  <TableRow key={signal.id}>
                    <TableCell className="font-medium">
                      {signal.company_name}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <div className="flex flex-col">
                        <a 
                          href={signal.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-medium hover:underline flex items-center gap-1 text-sm"
                        >
                          {signal.title.slice(0, 60)}...
                          <ExternalLink className="h-3 w-3" />
                        </a>
                        {signal.ai_summary && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {signal.ai_summary}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getNewsTypeBadge(signal.news_type)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {signal.news_date 
                        ? format(new Date(signal.news_date), 'dd MMM', { locale: es })
                        : '-'
                      }
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleMarkProcessed(signal.id)}
                          disabled={markProcessedMutation.isPending}
                          title="Marcar como revisada"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDelete(signal.id)}
                          disabled={deleteNewsMutation.isPending}
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!isLoading && exitSignals.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingDown className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">Sin señales de exit</h3>
            <p className="text-sm text-muted-foreground mb-4">
              No se han detectado noticias que sugieran desinversiones
            </p>
            <Button onClick={handleScan} disabled={scanMutation.isPending}>
              <RefreshCw className={`h-4 w-4 mr-2 ${scanMutation.isPending ? 'animate-spin' : ''}`} />
              Buscar ahora
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
