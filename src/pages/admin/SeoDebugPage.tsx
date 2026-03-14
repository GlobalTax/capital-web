import React, { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { siteRoutes } from '@/data/siteRoutes';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Search, AlertCircle, CheckCircle, AlertTriangle, FileText, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScanResult {
  path: string;
  title?: string | null;
  meta_description?: string | null;
  h1?: string | null;
  h2s?: string[];
  internal_links?: string[];
  internal_links_count?: number;
  health?: string;
  source?: string;
  extraction_notes?: { field: string; source: string; detail: string }[];
  rendered_at?: string;
  from_cache?: boolean;
}

const HealthBadge = ({ health }: { health?: string }) => {
  if (health === 'green') return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Verde</Badge>;
  if (health === 'yellow') return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertTriangle className="w-3 h-3 mr-1" />Amarillo</Badge>;
  return <Badge className="bg-red-100 text-red-800 border-red-200"><AlertCircle className="w-3 h-3 mr-1" />Rojo</Badge>;
};

const SeoDebugPage: React.FC = () => {
  const { toast } = useToast();
  const [inspectPath, setInspectPath] = useState('/');
  const [inspectResult, setInspectResult] = useState<ScanResult | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [coverageData, setCoverageData] = useState<Record<string, ScanResult>>({});
  const [bulkLoading, setBulkLoading] = useState(false);
  const [sitemapXml, setSitemapXml] = useState<string | null>(null);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [refreshingPath, setRefreshingPath] = useState<string | null>(null);

  const getAuthHeader = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Not authenticated');
    return `Bearer ${session.access_token}`;
  }, []);

  const scanPath = useCallback(async (path: string, refresh = false) => {
    const auth = await getAuthHeader();
    const params = new URLSearchParams({ path });
    if (refresh) params.set('refresh', 'true');

    const res = await supabase.functions.invoke('prerender', {
      headers: { Authorization: auth },
      body: null,
      method: 'GET',
    });

    // Use fetch directly since functions.invoke doesn't support GET params well
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prerender?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: auth,
        apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
      },
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Scan failed');
    }

    return await response.json() as ScanResult;
  }, [getAuthHeader]);

  const handleInspect = useCallback(async () => {
    setInspectLoading(true);
    try {
      const result = await scanPath(inspectPath, true);
      setInspectResult(result);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setInspectLoading(false);
    }
  }, [inspectPath, scanPath, toast]);

  const handleBulkScan = useCallback(async () => {
    setBulkLoading(true);
    try {
      const auth = await getAuthHeader();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/prerender?bulk=true`;
      const response = await fetch(url, {
        headers: {
          Authorization: auth,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
        },
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Bulk scan failed');
      }

      const data = await response.json();
      const map: Record<string, ScanResult> = {};
      for (const r of data.results) {
        map[r.path] = r;
      }
      setCoverageData(map);
      toast({ title: 'Escaneo masivo completado', description: `${data.scanned} rutas escaneadas` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setBulkLoading(false);
    }
  }, [getAuthHeader, toast]);

  const handleRefreshRow = useCallback(async (path: string) => {
    setRefreshingPath(path);
    try {
      const result = await scanPath(path, true);
      setCoverageData(prev => ({ ...prev, [path]: result }));
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setRefreshingPath(null);
    }
  }, [scanPath, toast]);

  const handleGenerateSitemap = useCallback(async () => {
    setSitemapLoading(true);
    try {
      const auth = await getAuthHeader();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sitemap`;
      const response = await fetch(url, {
        headers: {
          Authorization: auth,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
        },
      });

      if (!response.ok) throw new Error('Sitemap generation failed');
      const xml = await response.text();
      setSitemapXml(xml);
      toast({ title: 'Sitemap generado', description: 'XML generado correctamente' });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSitemapLoading(false);
    }
  }, [getAuthHeader, toast]);

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Debug</h1>
        <p className="text-muted-foreground">Inspector de páginas, cobertura de rastreo y generación de sitemap.</p>
      </div>

      {/* Section 1: Single Page Inspector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Inspector de Página
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={inspectPath}
              onChange={(e) => setInspectPath(e.target.value)}
              placeholder="/venta-empresas"
              className="flex-1"
            />
            <Button onClick={handleInspect} disabled={inspectLoading}>
              {inspectLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Search className="w-4 h-4 mr-2" />}
              Escanear
            </Button>
          </div>

          {inspectResult && (
            <div className="space-y-4 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <code className="text-sm font-mono text-foreground">{inspectResult.path}</code>
                <div className="flex items-center gap-2">
                  <HealthBadge health={inspectResult.health} />
                  {inspectResult.from_cache && <Badge variant="outline">Cache</Badge>}
                  <Badge variant="outline">{inspectResult.source}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-foreground">Title:</span>
                  <p className="text-muted-foreground">{inspectResult.title || '❌ No encontrado'}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Meta Description:</span>
                  <p className="text-muted-foreground">{inspectResult.meta_description || '❌ No encontrada'}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">H1:</span>
                  <p className="text-muted-foreground">{inspectResult.h1 || '❌ No encontrado'}</p>
                </div>
                <div>
                  <span className="font-medium text-foreground">Enlaces internos:</span>
                  <p className="text-muted-foreground">{inspectResult.internal_links_count ?? 0}</p>
                </div>
              </div>

              {inspectResult.h2s && inspectResult.h2s.length > 0 && (
                <div>
                  <span className="font-medium text-foreground text-sm">H2s:</span>
                  <ul className="list-disc list-inside text-sm text-muted-foreground mt-1">
                    {inspectResult.h2s.map((h2, i) => <li key={i}>{h2}</li>)}
                  </ul>
                </div>
              )}

              {inspectResult.extraction_notes && inspectResult.extraction_notes.length > 0 && (
                <div>
                  <span className="font-medium text-foreground text-sm">Notas de extracción:</span>
                  <div className="mt-1 space-y-1">
                    {inspectResult.extraction_notes.map((note, i) => (
                      <div key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px]">{note.source}</Badge>
                        <span>{note.field}: {note.detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {inspectResult.internal_links && inspectResult.internal_links.length > 0 && (
                <div>
                  <span className="font-medium text-foreground text-sm">Enlaces internos encontrados:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {inspectResult.internal_links.slice(0, 20).map((link, i) => (
                      <Badge key={i} variant="outline" className="text-xs font-mono">{link}</Badge>
                    ))}
                    {inspectResult.internal_links.length > 20 && (
                      <Badge variant="outline" className="text-xs">+{inspectResult.internal_links.length - 20} más</Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section 2: Crawl Coverage Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Cobertura de Rastreo ({siteRoutes.length} rutas)
            </CardTitle>
            <Button onClick={handleBulkScan} disabled={bulkLoading} variant="outline">
              {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Escaneo Masivo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ruta</TableHead>
                  <TableHead>Salud</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>H1</TableHead>
                  <TableHead>Enlaces</TableHead>
                  <TableHead>Origen</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {siteRoutes.map((route) => {
                  const data = coverageData[route.path];
                  return (
                    <TableRow key={route.path}>
                      <TableCell className="font-mono text-xs">{route.path}</TableCell>
                      <TableCell>
                        {data ? <HealthBadge health={data.health} /> : <Badge variant="outline">Sin escanear</Badge>}
                      </TableCell>
                      <TableCell className="text-xs max-w-[200px] truncate">
                        {data?.title ? '✅' : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {data?.h1 ? '✅' : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {data?.internal_links_count ?? '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        {data?.source || '—'}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefreshRow(route.path)}
                          disabled={refreshingPath === route.path}
                        >
                          {refreshingPath === route.path ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Sitemap Regeneration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Regenerar Sitemap</CardTitle>
            <Button onClick={handleGenerateSitemap} disabled={sitemapLoading} variant="outline">
              {sitemapLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
              Generar XML
            </Button>
          </div>
        </CardHeader>
        {sitemapXml && (
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-96 font-mono text-foreground">
              {sitemapXml}
            </pre>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default SeoDebugPage;
