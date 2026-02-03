import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
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
  EyeOff,
  Clock,
  AlertCircle
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
  message?: string;
  hint?: string;
  attempts?: number;
  detected?: string[];
  missing?: string[];
  data?: {
    preview?: string;
    extracted?: number;
    inserted?: number;
    updated?: number;
    attempts?: number;
  };
}

interface CookieStatus {
  hasUser: boolean;
  hasDstoken: boolean;
  hasXsrf: boolean;
  length: number;
  isTruncated: boolean;
  hasExtraQuotes: boolean;
}

export const DealsuiteSyncPanel = () => {
  const [cookie, setCookie] = useState('');
  const [showCookie, setShowCookie] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [cookieStatus, setCookieStatus] = useState<CookieStatus | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const { data: deals, isLoading: isLoadingDeals, refetch } = useDealsuitDeals(20);

  const isLoading = isTestingConnection || isSyncing;

  // Clean and analyze cookie when it changes
  const cleanCookie = (raw: string): string => {
    let cleaned = raw.trim();
    // Remove surrounding quotes (from console output)
    if ((cleaned.startsWith("'") && cleaned.endsWith("'")) || 
        (cleaned.startsWith('"') && cleaned.endsWith('"'))) {
      cleaned = cleaned.slice(1, -1);
    }
    return cleaned;
  };

  const analyzeCookie = (cookieString: string): CookieStatus & { isTruncated: boolean; hasExtraQuotes: boolean } => {
    const raw = cookieString;
    const hasExtraQuotes = (raw.startsWith("'") || raw.startsWith('"')) && 
                           (raw.endsWith("'") || raw.endsWith('"'));
    const isTruncated = raw.includes('…') || raw.endsWith('...');
    const cleaned = cleanCookie(raw);
    
    return {
      hasUser: cleaned.includes('user='),
      hasDstoken: cleaned.includes('dstoken='),
      hasXsrf: cleaned.includes('_xsrf='),
      length: cleaned.length,
      isTruncated,
      hasExtraQuotes
    };
  };

  // Update cookie status when cookie changes
  useEffect(() => {
    if (cookie.trim()) {
      setCookieStatus(analyzeCookie(cookie));
    } else {
      setCookieStatus(null);
    }
  }, [cookie]);

  // Timer for elapsed time
  useEffect(() => {
    if (isLoading) {
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isLoading]);

  // Update status message based on elapsed time
  useEffect(() => {
    if (!isLoading) {
      setStatusMessage('');
      return;
    }

    if (elapsedTime < 5) {
      setStatusMessage('Iniciando conexión con Dealsuite...');
    } else if (elapsedTime < 20) {
      setStatusMessage('Esperando que la página cargue (intento 1/3)...');
    } else if (elapsedTime < 45) {
      setStatusMessage('Renderizando contenido JavaScript...');
    } else if (elapsedTime < 70) {
      setStatusMessage('Reintentando con más tiempo (intento 2/3)...');
    } else if (elapsedTime < 100) {
      setStatusMessage('Último intento con tiempo máximo...');
    } else if (elapsedTime < 130) {
      setStatusMessage('Procesando deals con IA...');
    } else {
      setStatusMessage('Finalizando... Esto puede tardar un poco más.');
    }
  }, [elapsedTime, isLoading]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getErrorSuggestion = (error?: string, message?: string, hint?: string): string => {
    if (hint) return hint;
    
    const fullError = `${error || ''} ${message || ''}`.toLowerCase();
    
    if (fullError.includes('invalid_cookie_format') || fullError.includes('faltan cookies')) {
      return 'La cookie está incompleta. Asegúrate de copiar TODO el contenido de document.cookie. Las cookies críticas son "user" y "dstoken".';
    }
    if (fullError.includes('timeout') || fullError.includes('408') || fullError.includes('tardó')) {
      return 'La página de Dealsuite tardó demasiado en cargar. Esto puede ocurrir si hay mucho tráfico. Intenta de nuevo en unos minutos o durante horas de menor uso (temprano en la mañana o tarde en la noche).';
    }
    if (fullError.includes('session') || fullError.includes('cookie') || fullError.includes('login') || fullError.includes('expirada')) {
      return 'La cookie de sesión parece haber expirado o ser inválida. Ve a Dealsuite, inicia sesión de nuevo, y copia una cookie fresca.';
    }
    if (fullError.includes('rate_limit') || fullError.includes('429')) {
      return 'Se ha excedido el límite de peticiones. Espera unos minutos antes de reintentar.';
    }
    if (fullError.includes('captcha')) {
      return 'Dealsuite está mostrando un captcha. Intenta de nuevo más tarde o accede manualmente a Dealsuite primero.';
    }
    return 'Verifica la cookie de sesión e intenta de nuevo. Si el problema persiste, contacta a soporte.';
  };

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
      // Clean the cookie before sending
      const cleanedCookie = cleanCookie(cookie.trim());
      const response = await firecrawlApi.scrapeDealsuite(cleanedCookie, { dryRun: true });
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Conexión exitosa',
          description: `La cookie es válida. Contenido recuperado en ${response.data?.attempts || 1} intento(s).`,
        });
      } else {
        toast({
          title: 'Error de conexión',
          description: response.message || response.error || 'No se pudo validar la cookie.',
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
      // Clean the cookie before sending
      const cleanedCookie = cleanCookie(cookie.trim());
      const response = await firecrawlApi.scrapeDealsuite(cleanedCookie);
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
          description: response.message || response.error || 'No se pudieron sincronizar los deals.',
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

          {/* Cookie Status Indicator */}
          {cookieStatus && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <span className="text-xs text-muted-foreground mr-1">Cookies detectadas:</span>
              <Badge variant={cookieStatus.hasUser ? "default" : "destructive"} className="text-xs">
                {cookieStatus.hasUser ? '✓' : '✗'} user
              </Badge>
              <Badge variant={cookieStatus.hasDstoken ? "default" : "destructive"} className="text-xs">
                {cookieStatus.hasDstoken ? '✓' : '✗'} dstoken
              </Badge>
              <Badge variant={cookieStatus.hasXsrf ? "secondary" : "outline"} className="text-xs">
                {cookieStatus.hasXsrf ? '✓' : '○'} _xsrf
              </Badge>
              <span className="text-xs text-muted-foreground ml-auto">
                {cookieStatus.length} caracteres
              </span>
              
              {/* Warnings */}
              {(cookieStatus.isTruncated || cookieStatus.hasExtraQuotes || !cookieStatus.hasUser || !cookieStatus.hasDstoken) && (
                <div className="w-full mt-2 space-y-2">
                  {cookieStatus.isTruncated && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        <strong>Cookie truncada:</strong> El texto termina en "…". Asegúrate de copiar TODO el contenido sin que se corte.
                      </AlertDescription>
                    </Alert>
                  )}
                  {cookieStatus.hasExtraQuotes && (
                    <Alert className="py-2 border-yellow-500 bg-yellow-500/10">
                      <AlertCircle className="h-3 w-3 text-yellow-600" />
                      <AlertDescription className="text-xs">
                        <strong>Comillas detectadas:</strong> Las comillas al inicio/final serán eliminadas automáticamente.
                      </AlertDescription>
                    </Alert>
                  )}
                  {(!cookieStatus.hasUser || !cookieStatus.hasDstoken) && !cookieStatus.isTruncated && (
                    <Alert variant="destructive" className="py-2">
                      <AlertCircle className="h-3 w-3" />
                      <AlertDescription className="text-xs">
                        Faltan cookies críticas. Asegúrate de copiar TODO el contenido de <code>document.cookie</code>.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>
          )}

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

          {/* Progress indicator while loading */}
          {isLoading && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{statusMessage}</span>
                <span className="font-mono text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatTime(elapsedTime)}
                </span>
              </div>
              <Progress value={Math.min((elapsedTime / 150) * 100, 95)} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Este proceso puede tardar hasta 2-3 minutos. El sistema reintenta automáticamente si hay timeouts.
              </p>
            </div>
          )}
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
                  {(result.attempts || result.data?.attempts) && (result.attempts || result.data?.attempts) > 1 && (
                    <Badge variant="secondary" className="ml-2">
                      {result.attempts || result.data?.attempts} intentos
                    </Badge>
                  )}
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
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error de sincronización</AlertTitle>
                <AlertDescription className="space-y-3">
                  <p>{result.message || result.error}</p>
                  <p className="text-sm opacity-80">
                    {getErrorSuggestion(result.error, result.message, result.hint)}
                  </p>
                  {/* Show detected/missing cookies if available */}
                  {(result.detected || result.missing) && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-destructive/20">
                      {result.detected?.map(c => (
                        <Badge key={c} variant="secondary" className="text-xs">✓ {c}</Badge>
                      ))}
                      {result.missing?.map(c => (
                        <Badge key={c} variant="destructive" className="text-xs">✗ {c}</Badge>
                      ))}
                    </div>
                  )}
                  {/* Show content preview for debugging */}
                  {result.preview && (
                    <div className="mt-2 pt-2 border-t border-destructive/20">
                      <p className="text-xs font-medium mb-1">Contenido devuelto (preview):</p>
                      <pre className="bg-background/50 p-2 rounded text-xs overflow-auto max-h-24 text-destructive-foreground/70">
                        {result.preview}
                      </pre>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
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
