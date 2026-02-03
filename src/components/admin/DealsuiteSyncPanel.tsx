import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { firecrawlApi } from '@/lib/api/firecrawl';
import { useDealsuitDeals } from '@/hooks/useDealsuitDeals';
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  TestTube, 
  ChevronDown, 
  ChevronRight,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface SyncResult {
  success: boolean;
  dry_run?: boolean;
  preview?: string;
  extracted?: number;
  inserted?: number;
  updated?: number;
  error?: string;
  data?: {
    preview?: string;
    extracted?: number;
    inserted?: number;
    updated?: number;
  };
}

export const DealsuiteSyncPanel = () => {
  const [cookie, setCookie] = useState('');
  const [showCookie, setShowCookie] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const { toast } = useToast();
  const { data: deals, isLoading: isLoadingDeals, refetch } = useDealsuitDeals(20);

  const handleTestConnection = async () => {
    if (!cookie.trim()) {
      toast({
        title: 'Cookie requerida',
        description: 'Por favor, pega la cookie de sesión de Dealsuite.',
        variant: 'destructive',
      });
      return;
    }

    setIsTestingConnection(true);
    setResult(null);

    try {
      const response = await firecrawlApi.scrapeDealsuite(cookie.trim(), { dryRun: true });
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Conexión exitosa',
          description: 'La cookie es válida y se puede acceder a Dealsuite.',
        });
      } else {
        toast({
          title: 'Error de conexión',
          description: response.error || 'No se pudo validar la cookie.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      toast({
        title: 'Error',
        description: 'Error al probar la conexión. Verifica que Firecrawl esté configurado.',
        variant: 'destructive',
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSync = async () => {
    if (!cookie.trim()) {
      toast({
        title: 'Cookie requerida',
        description: 'Por favor, pega la cookie de sesión de Dealsuite.',
        variant: 'destructive',
      });
      return;
    }

    setIsSyncing(true);
    setResult(null);

    try {
      const response = await firecrawlApi.scrapeDealsuite(cookie.trim());
      setResult(response);

      if (response.success) {
        const data = response.data || response;
        toast({
          title: 'Sincronización completada',
          description: `${data.inserted || 0} nuevos, ${data.updated || 0} actualizados.`,
        });
        refetch();
      } else {
        toast({
          title: 'Error de sincronización',
          description: response.error || 'No se pudieron sincronizar los deals.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error syncing:', error);
      toast({
        title: 'Error',
        description: 'Error al sincronizar. Verifica la configuración.',
        variant: 'destructive',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatCurrency = (value: number | null) => {
    if (!value) return '-';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const isLoading = isTestingConnection || isSyncing;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Sincronización Dealsuite</h1>
        <p className="text-muted-foreground mt-1">
          Extrae los deals del marketplace "Wanted" de Dealsuite usando tu cookie de sesión.
        </p>
      </div>

      {/* Cookie Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            Cookie de Sesión
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowInstructions(!showInstructions)}
              className="h-6 w-6 p-0"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Pega la cookie de sesión de Dealsuite para autenticarte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Instructions Collapsible */}
          <Collapsible open={showInstructions} onOpenChange={setShowInstructions}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="w-full justify-between">
                <span>¿Cómo obtener la cookie?</span>
                {showInstructions ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                <ol className="list-decimal list-inside space-y-1.5 text-muted-foreground">
                  <li>Abre <strong>app.dealsuite.com</strong> en tu navegador y asegúrate de estar logueado</li>
                  <li>Abre DevTools (F12 o Cmd+Option+I en Mac)</li>
                  <li>Ve a la pestaña <strong>Console</strong></li>
                  <li>Escribe <code className="bg-background px-1.5 py-0.5 rounded">document.cookie</code> y pulsa Enter</li>
                  <li>Copia todo el texto resultante (empieza con <code>_xsrf=...</code>)</li>
                  <li>Pega el resultado en el campo de abajo</li>
                </ol>
                <p className="text-xs text-muted-foreground mt-3 border-t pt-2">
                  ⚠️ La cookie NO se guarda en ningún momento y solo se usa para esta sesión.
                </p>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Cookie Textarea */}
          <div className="relative">
            <Textarea
              placeholder="_xsrf=...; user=...; dstoken=..."
              value={cookie}
              onChange={(e) => setCookie(e.target.value)}
              className={`min-h-[100px] font-mono text-xs pr-10 ${!showCookie ? 'text-security-disc' : ''}`}
              style={!showCookie ? { WebkitTextSecurity: 'disc' } as React.CSSProperties : undefined}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0"
              onClick={() => setShowCookie(!showCookie)}
            >
              {showCookie ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isLoading || !cookie.trim()}
            >
              {isTestingConnection ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TestTube className="h-4 w-4 mr-2" />
              )}
              Probar Conexión
            </Button>
            <Button
              onClick={handleSync}
              disabled={isLoading || !cookie.trim()}
            >
              {isSyncing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sincronizar Deals
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      {result && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {result.success ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span>{result.dry_run ? 'Conexión Válida' : 'Sincronización Exitosa'}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  <span>Error</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.success ? (
              <div className="space-y-3">
                {result.dry_run ? (
                  <p className="text-sm text-muted-foreground">
                    La cookie es válida. Puedes proceder a sincronizar los deals.
                  </p>
                ) : (
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {result.data?.extracted || result.extracted || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Extraídos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {result.data?.inserted || result.inserted || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Nuevos</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {result.data?.updated || result.updated || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Actualizados</div>
                    </div>
                  </div>
                )}
                {(result.preview || result.data?.preview) && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Preview del contenido:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-40">
                      {result.preview || result.data?.preview}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-destructive">{result.error}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Deals Sincronizados</CardTitle>
              <CardDescription>Últimos 20 deals extraídos de Dealsuite</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoadingDeals ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : !deals?.length ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay deals sincronizados todavía.
            </div>
          ) : (
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Sector</TableHead>
                    <TableHead>País</TableHead>
                    <TableHead className="text-right">EBITDA</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {deal.title || '-'}
                      </TableCell>
                      <TableCell>
                        {deal.sector && (
                          <Badge variant="secondary" className="text-xs">
                            {deal.sector}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">{deal.country || '-'}</TableCell>
                      <TableCell className="text-right text-sm">
                        {deal.ebitda_min || deal.ebitda_max
                          ? `${formatCurrency(deal.ebitda_min)} - ${formatCurrency(deal.ebitda_max)}`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {deal.deal_type && (
                          <Badge variant="outline" className="text-xs">
                            {deal.deal_type}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(deal.scraped_at), 'dd MMM yyyy', { locale: es })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DealsuiteSyncPanel;
