import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Globe, 
  Search, 
  Download, 
  Building2, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar,
  Sparkles,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { 
  useMNAApolloVisitorImport, 
  useMNAVisitorImportHistory, 
  useMNAImportedBoutiques,
  useDeleteMNAVisitorImport,
  MNAApolloOrganization,
  MNAImportResults,
} from '@/hooks/useMNAApolloVisitorImport';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

export default function MNAApolloVisitorsPage() {
  // Website Visitors mode state
  const [dateFrom, setDateFrom] = useState(() => format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [intentLevels, setIntentLevels] = useState<string[]>(['high', 'medium']);
  const [onlyNew, setOnlyNew] = useState(true);
  
  // Common state
  const [organizations, setOrganizations] = useState<MNAApolloOrganization[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  
  // Last import results
  const [lastImportResults, setLastImportResults] = useState<MNAImportResults | null>(null);

  const {
    isSearching,
    isImporting,
    createImport,
    searchWebsiteVisitors,
    importOrganizations,
    enrichAndImport,
  } = useMNAApolloVisitorImport();

  const { data: importHistory, isLoading: historyLoading, refetch: refetchHistory } = useMNAVisitorImportHistory();
  const { data: boutiquesData, isLoading: boutiquesLoading, refetch: refetchBoutiques } = useMNAImportedBoutiques();
  const importedBoutiques = boutiquesData?.boutiques || [];
  const totalBoutiques = boutiquesData?.total || 0;
  const deleteImport = useDeleteMNAVisitorImport();

  const toggleIntentLevel = (level: string) => {
    setIntentLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    );
  };

  const handleSearch = async () => {
    try {
      setSearchWarning(null);
      
      if (!dateFrom || !dateTo) {
        toast.error('Selecciona un rango de fechas');
        return;
      }
      
      const importJob = await createImport(`visitors_${dateFrom}_${dateTo}`, 'website_visitors');
      setCurrentImportId(importJob.id);
      
      const result = await searchWebsiteVisitors(
        { dateFrom, dateTo, intentLevels, onlyNew },
        importJob.id
      );
      
      setOrganizations(result.organizations);
      setTotalFound(result.total);
      setSelectedOrgs(new Set());
      setLastImportResults(null);
      
      if (result.warning) {
        setSearchWarning(result.warning);
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error al buscar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleEnrichAndImport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Selecciona un rango de fechas');
      return;
    }
    
    try {
      const importJob = await createImport(`enrich_${dateFrom}_${dateTo}`, 'website_visitors');
      setCurrentImportId(importJob.id);
      
      const results = await enrichAndImport({
        dateFrom,
        dateTo,
        intentLevels,
        onlyNew,
      }, importJob.id);
      
      setLastImportResults(results);
      refetchBoutiques();
      refetchHistory();
    } catch (error) {
      console.error('Enrich & Import error:', error);
      toast.error('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleImport = async () => {
    const orgsToImport = organizations.filter(org => selectedOrgs.has(org.id));
    if (orgsToImport.length === 0) return;
    
    try {
      const results = await importOrganizations(orgsToImport, currentImportId || undefined);
      
      setLastImportResults(results);
      setOrganizations([]);
      setSelectedOrgs(new Set());
      refetchBoutiques();
      refetchHistory();
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedOrgs.size === organizations.length) {
      setSelectedOrgs(new Set());
    } else {
      setSelectedOrgs(new Set(organizations.map(o => o.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedOrgs);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedOrgs(newSelected);
  };

  const getIntentBadge = (intent?: string) => {
    switch (intent?.toLowerCase()) {
      case 'high':
        return <Badge variant="default" className="bg-red-500">🔥 Alto</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-orange-400 text-white">⚡ Medio</Badge>;
      case 'low':
        return <Badge variant="outline">Bajo</Badge>;
      default:
        return <Badge variant="outline">{intent || '-'}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Apollo Visitors → M&A Boutiques
          </h1>
          <p className="text-muted-foreground">
            Importa empresas visitantes de tu web como boutiques M&A
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {totalBoutiques} boutiques importadas
        </Badge>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import" className="gap-2">
            <Search className="h-4 w-4" />
            Importar Visitantes
          </TabsTrigger>
          <TabsTrigger value="boutiques" className="gap-2">
            <Building2 className="h-4 w-4" />
            Boutiques Importadas
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Historial
          </TabsTrigger>
        </TabsList>

        {/* Import Tab */}
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Buscar Website Visitors</CardTitle>
              <CardDescription>
                Busca empresas que visitaron tu web y conviértelas en boutiques M&A
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date presets */}
              <div className="flex gap-2 items-center">
                <span className="text-sm text-muted-foreground">Rango rápido:</span>
                {[
                  { label: '7 días', days: 7 },
                  { label: '14 días', days: 14 },
                  { label: '30 días', days: 30 },
                  { label: '90 días', days: 90 },
                ].map(preset => (
                  <Button
                    key={preset.days}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      setDateFrom(format(subDays(new Date(), preset.days), 'yyyy-MM-dd'));
                      setDateTo(format(new Date(), 'yyyy-MM-dd'));
                    }}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="dateFrom">Fecha inicio</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="dateTo">Fecha fin</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Nivel de Intent</Label>
                  <div className="flex gap-2 mt-2">
                    {['high', 'medium', 'low'].map(level => (
                      <Button
                        key={level}
                        variant={intentLevels.includes(level) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleIntentLevel(level)}
                        className="text-xs"
                      >
                        {level === 'high' ? '🔥 Alto' : level === 'medium' ? '⚡ Medio' : 'Bajo'}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-2">
                    <Checkbox
                      id="onlyNew"
                      checked={onlyNew}
                      onCheckedChange={(checked) => setOnlyNew(checked === true)}
                    />
                    <Label htmlFor="onlyNew" className="text-sm cursor-pointer">
                      Solo visitantes nuevos
                    </Label>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button onClick={handleSearch} disabled={isSearching || isImporting} variant="outline">
                  {isSearching ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar y Previsualizar
                    </>
                  )}
                </Button>
                
                <Button 
                  onClick={handleEnrichAndImport} 
                  disabled={isSearching || isImporting}
                  className="gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Enriquecer y Guardar
                    </>
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground">
                💡 "Enriquecer y Guardar" busca visitantes, enriquece cada empresa por dominio y las guarda automáticamente como boutiques M&A.
              </p>
            </CardContent>
          </Card>

          {/* Search Warning */}
          {searchWarning && (
            <Alert variant="default" className="border-amber-200 bg-amber-50/50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">{searchWarning}</AlertDescription>
            </Alert>
          )}

          {/* Last Import Results */}
          {lastImportResults && (
            <Alert variant="default" className="border-green-200 bg-green-50/50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Última importación:</strong> {lastImportResults.imported} nuevas, {lastImportResults.updated} actualizadas, {lastImportResults.skipped} omitidas
                {lastImportResults.enriched && `, ${lastImportResults.enriched} enriquecidas`}
              </AlertDescription>
            </Alert>
          )}

          {/* Organizations Preview */}
          {organizations.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Previsualización ({organizations.length} de {totalFound})
                    </CardTitle>
                    <CardDescription>
                      Selecciona las empresas a importar como boutiques M&A
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                      {selectedOrgs.size === organizations.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleImport}
                      disabled={selectedOrgs.size === 0 || isImporting}
                    >
                      {isImporting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Importar {selectedOrgs.size} seleccionadas
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Empresa</TableHead>
                        <TableHead>Sector</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Intent</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {organizations.map((org) => (
                        <TableRow 
                          key={org.id}
                          className={org.existsInBoutiques ? 'opacity-60' : ''}
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedOrgs.has(org.id)}
                              onCheckedChange={() => toggleSelect(org.id)}
                              disabled={org.existsInBoutiques}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{org.name}</span>
                              {org.website_url && (
                                <a 
                                  href={org.website_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                                >
                                  {org.primary_domain || org.website_url}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {org.industry || '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {[org.city, org.country].filter(Boolean).join(', ') || '-'}
                          </TableCell>
                          <TableCell>
                            {getIntentBadge(org.intent_level)}
                          </TableCell>
                          <TableCell>
                            {org.existsInBoutiques ? (
                              <Badge variant="secondary">Ya existe</Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-600">Nueva</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Boutiques Tab */}
        <TabsContent value="boutiques" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Boutiques Importadas desde Apollo</CardTitle>
                  <CardDescription>
                    {totalBoutiques} boutiques con datos de Apollo
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchBoutiques()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {boutiquesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : importedBoutiques.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay boutiques importadas desde Apollo todavía
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Website</TableHead>
                        <TableHead>Ubicación</TableHead>
                        <TableHead>Especialización</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Sincronizado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importedBoutiques.map((boutique) => (
                        <TableRow key={boutique.id}>
                          <TableCell className="font-medium">{boutique.name}</TableCell>
                          <TableCell>
                            {boutique.website ? (
                              <a 
                                href={boutique.website.startsWith('http') ? boutique.website : `https://${boutique.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                {boutique.website}
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {[boutique.city, boutique.country].filter(Boolean).join(', ') || '-'}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{boutique.specialization || 'generalist'}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{boutique.tier || 'local'}</Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {boutique.apollo_last_synced_at
                              ? formatDistanceToNow(new Date(boutique.apollo_last_synced_at), { addSuffix: true, locale: es })
                              : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Historial de Importaciones</CardTitle>
                  <CardDescription>
                    Últimas {importHistory?.length || 0} importaciones
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetchHistory()}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !importHistory || importHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No hay importaciones en el historial
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead>Encontradas</TableHead>
                        <TableHead>Importadas</TableHead>
                        <TableHead>Actualizadas</TableHead>
                        <TableHead>Errores</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importHistory.map((imp) => (
                        <TableRow key={imp.id}>
                          <TableCell className="text-sm">
                            {formatDistanceToNow(new Date(imp.created_at), { addSuffix: true, locale: es })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{imp.list_type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                imp.status === 'completed' ? 'default' :
                                imp.status === 'failed' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {imp.status === 'completed' ? '✅ Completado' :
                               imp.status === 'failed' ? '❌ Error' :
                               imp.status === 'importing' ? '⏳ Importando' :
                               imp.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{imp.total_found}</TableCell>
                          <TableCell className="text-green-600">{imp.total_imported}</TableCell>
                          <TableCell className="text-blue-600">{imp.total_updated}</TableCell>
                          <TableCell className="text-red-600">{imp.total_errors}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteImport.mutate(imp.id)}
                              disabled={deleteImport.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}