import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Globe, 
  Search, 
  Download, 
  Building2, 
  Users, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  UserPlus,
  Calendar,
  List,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { 
  useApolloVisitorImport, 
  useVisitorImportHistory, 
  useImportedEmpresas,
  useDeleteVisitorImport,
  ApolloOrganization,
  ImportResults,
} from '@/hooks/useApolloVisitorImport';
import { OrganizationPreviewTable } from '@/components/admin/apollo-visitors/OrganizationPreviewTable';
import { ImportedEmpresasTable } from '@/components/admin/apollo-visitors/ImportedEmpresasTable';
import { ContactSearchSheet } from '@/components/admin/apollo-visitors/ContactSearchSheet';
import { VisitorImportHistory } from '@/components/admin/apollo-visitors/VisitorImportHistory';
import { formatDistanceToNow, subDays, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

type SearchMode = 'website_visitors' | 'list_id';

export default function ApolloVisitorsPage() {
  // Search mode
  const [searchMode, setSearchMode] = useState<SearchMode>('website_visitors');
  
  // List ID mode state
  const [listId, setListId] = useState('');
  const [listType, setListType] = useState<'contacts' | 'accounts'>('contacts');
  
  // Website Visitors mode state
  const [dateFrom, setDateFrom] = useState(() => format(subDays(new Date(), 30), 'yyyy-MM-dd'));
  const [dateTo, setDateTo] = useState(() => format(new Date(), 'yyyy-MM-dd'));
  const [intentLevels, setIntentLevels] = useState<string[]>(['high', 'medium']);
  const [onlyNew, setOnlyNew] = useState(true);
  
  // Common state
  const [organizations, setOrganizations] = useState<ApolloOrganization[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);
  const [searchWarning, setSearchWarning] = useState<string | null>(null);
  
  // Auto-import contacts settings
  const [autoImportContacts, setAutoImportContacts] = useState(true);
  const [maxContactsPerCompany, setMaxContactsPerCompany] = useState<string>('5');
  
  // Last import results
  const [lastImportResults, setLastImportResults] = useState<ImportResults | null>(null);
  
  // Contact search state
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<{ id: string; name: string; apolloOrgId: string } | null>(null);

  const {
    isSearching,
    isImporting,
    createImport,
    searchOrganizations,
    searchWebsiteVisitors,
    importOrganizations,
    enrichAndImport,
  } = useApolloVisitorImport();

  const { data: importHistory, isLoading: historyLoading, refetch: refetchHistory } = useVisitorImportHistory();
  const { data: importedEmpresas, isLoading: empresasLoading, refetch: refetchEmpresas } = useImportedEmpresas();
  const deleteImport = useDeleteVisitorImport();

  // Extract list ID from URL or use raw ID
  const parseListId = (input: string): string => {
    // Handle full Apollo URL
    const match = input.match(/lists\/([a-f0-9-]+)/i);
    if (match) return match[1];
    // Handle raw ID
    return input.trim();
  };

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
      
      if (searchMode === 'website_visitors') {
        // Use native website visitors search
        if (!dateFrom || !dateTo) {
          toast.error('Selecciona un rango de fechas');
          return;
        }
        
        const importJob = await createImport(`visitors_${dateFrom}_${dateTo}`, 'static');
        setCurrentImportId(importJob.id);
        
        const result = await searchWebsiteVisitors(
          { dateFrom, dateTo, intentLevels, onlyNew },
          importJob.id
        );
        setOrganizations(result.organizations);
        setTotalFound(result.total);
        setSelectedOrgs(new Set());
        setLastImportResults(null);
      } else {
        // Use list ID search
        if (!listId.trim()) {
          toast.error('Introduce un ID de lista');
          return;
        }
        
        const parsedId = parseListId(listId);
        const importJob = await createImport(parsedId, listType);
        setCurrentImportId(importJob.id);
        
        const result = await searchOrganizations(parsedId, listType, importJob.id);
        setOrganizations(result.organizations);
        setTotalFound(result.total);
        setSelectedOrgs(new Set());
        setLastImportResults(null);
        
        // Show warning if present (means filter may not be working)
        if ((result as any).warning) {
          setSearchWarning((result as any).warning);
        }
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error al buscar: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  // NEW: Enrich and import in one step
  const handleEnrichAndImport = async () => {
    if (!dateFrom || !dateTo) {
      toast.error('Selecciona un rango de fechas');
      return;
    }
    
    try {
      const importJob = await createImport(`enrich_${dateFrom}_${dateTo}`, 'static');
      setCurrentImportId(importJob.id);
      
      const results = await enrichAndImport({
        dateFrom,
        dateTo,
        intentLevels,
        onlyNew,
        autoImportContacts,
        maxContactsPerCompany: parseInt(maxContactsPerCompany, 10),
      }, importJob.id);
      
      setLastImportResults(results);
      refetchEmpresas();
    } catch (error) {
      console.error('Enrich & Import error:', error);
      toast.error('Error: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    }
  };

  const handleImport = async () => {
    const orgsToImport = organizations.filter(org => selectedOrgs.has(org.id));
    if (orgsToImport.length === 0) return;
    
    try {
      const results = await importOrganizations(orgsToImport, currentImportId || undefined, {
        autoImportContacts,
        maxContactsPerCompany: parseInt(maxContactsPerCompany, 10),
      });
      
      setLastImportResults(results);
      // Refresh the lists
      setOrganizations([]);
      setSelectedOrgs(new Set());
      refetchEmpresas();
    } catch (error) {
      console.error('Import error:', error);
    }
  };

  const handleSearchContacts = (empresa: { id: string; name: string; apolloOrgId: string }) => {
    setSelectedEmpresa(empresa);
    setContactSearchOpen(true);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Apollo Website Visitors
          </h1>
          <p className="text-muted-foreground">
            Importa empresas que visitan tu web desde Apollo
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          {importedEmpresas?.length || 0} empresas importadas
        </Badge>
      </div>

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList>
          <TabsTrigger value="import" className="gap-2">
            <Search className="h-4 w-4" />
            Importar Lista
          </TabsTrigger>
          <TabsTrigger value="empresas" className="gap-2">
            <Building2 className="h-4 w-4" />
            Empresas Importadas
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
              <CardTitle className="text-lg">Buscar Visitantes o Lista Apollo</CardTitle>
              <CardDescription>
                Elige el modo de búsqueda: Website Visitors (recomendado) o Lista por ID
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Selector */}
              <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
                <Button
                  variant={searchMode === 'website_visitors' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSearchMode('website_visitors')}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Website Visitors
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-primary/10 text-primary">
                    Recomendado
                  </Badge>
                </Button>
                <Button
                  variant={searchMode === 'list_id' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSearchMode('list_id')}
                  className="gap-2"
                >
                  <List className="h-4 w-4" />
                  Lista por ID
                  <Badge variant="outline" className="ml-1 text-[10px] px-1.5 py-0 text-muted-foreground">
                    Solo CRM
                  </Badge>
                </Button>
              </div>

              {/* Warning for List ID mode */}
              {searchMode === 'list_id' && (
                <Alert variant="default" className="border-amber-200 bg-amber-50/50">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-700">
                    <strong>Limitación:</strong> Este modo solo muestra empresas que ya están en el CRM de Apollo, 
                    no visitantes "Net New". Para importar nuevos visitantes del sitio web, usa el modo "Website Visitors".
                  </AlertDescription>
                </Alert>
              )}

              {/* Website Visitors Mode */}
              {searchMode === 'website_visitors' && (
                <div className="space-y-4">
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
                    💡 "Enriquecer y Guardar" busca visitantes, enriquece cada empresa por dominio y las guarda automáticamente en tu CRM.
                  </p>
                </div>
              )}

              {/* List ID Mode */}
              {searchMode === 'list_id' && (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Label htmlFor="listId">URL o ID de Lista</Label>
                      <Input
                        id="listId"
                        placeholder="https://app.apollo.io/lists/abc123 o abc123"
                        value={listId}
                        onChange={(e) => setListId(e.target.value)}
                      />
                    </div>
                    <div className="w-48">
                      <Label htmlFor="listType">Tipo de Lista</Label>
                      <select
                        id="listType"
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        value={listType}
                        onChange={(e) => setListType(e.target.value as 'contacts' | 'accounts')}
                      >
                        <option value="contacts">👤 Contactos (Personas)</option>
                        <option value="accounts">🏢 Cuentas (Empresas)</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <Button onClick={handleSearch} disabled={isSearching || !listId.trim()}>
                        {isSearching ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Buscando...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Buscar
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Selecciona "Contactos" si tu lista es de personas, o "Cuentas" si es de empresas. 
                    Esto usa los endpoints correctos de Apollo: <code>contact_list_ids</code> o <code>account_list_ids</code>.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Warning message */}
          {searchWarning && (
            <Card className="border-amber-200 bg-amber-50/50">
              <CardContent className="py-4">
                <p className="text-sm text-amber-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {searchWarning}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Results */}
          {organizations.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Resultados</CardTitle>
                  <CardDescription>
                    {totalFound} empresas encontradas • {selectedOrgs.size} seleccionadas
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                    {selectedOrgs.size === organizations.length ? 'Deseleccionar' : 'Seleccionar'} todas
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Auto-import contacts option */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      id="autoImportContacts"
                      checked={autoImportContacts} 
                      onCheckedChange={(checked) => setAutoImportContacts(checked === true)}
                    />
                    <Label htmlFor="autoImportContacts" className="flex items-center gap-2 cursor-pointer">
                      <UserPlus className="h-4 w-4 text-primary" />
                      Importar contactos automáticamente
                    </Label>
                  </div>
                  {autoImportContacts && (
                    <div className="flex items-center gap-2">
                      <Label htmlFor="maxContacts" className="text-sm text-muted-foreground whitespace-nowrap">
                        Máximo por empresa:
                      </Label>
                      <Select value={maxContactsPerCompany} onValueChange={setMaxContactsPerCompany}>
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3">3</SelectItem>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <OrganizationPreviewTable
                  organizations={organizations}
                  selectedIds={selectedOrgs}
                  onToggleSelect={toggleSelect}
                />
                
                {/* Import button and progress */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {autoImportContacts && (
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Se buscarán hasta {maxContactsPerCompany} contactos por empresa (CEO, CFO, Directors...)
                      </span>
                    )}
                  </div>
                  <Button 
                    size="lg" 
                    onClick={handleImport} 
                    disabled={selectedOrgs.size === 0 || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando {selectedOrgs.size} empresas...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Importar ({selectedOrgs.size}) {autoImportContacts ? '+ contactos' : ''}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Last import results */}
          {lastImportResults && (
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-5 w-5" />
                  Importación Completada
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-2xl font-bold text-green-600">{lastImportResults.imported}</p>
                    <p className="text-sm text-muted-foreground">Empresas nuevas</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-2xl font-bold text-blue-600">{lastImportResults.updated}</p>
                    <p className="text-sm text-muted-foreground">Empresas actualizadas</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-2xl font-bold text-green-600">{lastImportResults.contacts.imported}</p>
                    <p className="text-sm text-muted-foreground">Contactos nuevos</p>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <p className="text-2xl font-bold text-blue-600">{lastImportResults.contacts.updated}</p>
                    <p className="text-sm text-muted-foreground">Contactos actualizados</p>
                  </div>
                </div>
                {(lastImportResults.skipped > 0 || lastImportResults.contacts.skipped > 0) && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-700">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      {lastImportResults.skipped > 0 && `${lastImportResults.skipped} empresas omitidas. `}
                      {lastImportResults.contacts.skipped > 0 && `${lastImportResults.contacts.skipped} contactos omitidos (sin email).`}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Imported Empresas Tab */}
        <TabsContent value="empresas" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Empresas Importadas desde Apollo</CardTitle>
                <CardDescription>
                  Empresas con datos de Apollo sincronizados
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchEmpresas()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar
              </Button>
            </CardHeader>
            <CardContent>
              {empresasLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : importedEmpresas && importedEmpresas.length > 0 ? (
                <ImportedEmpresasTable
                  empresas={importedEmpresas}
                  onSearchContacts={handleSearchContacts}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay empresas importadas todavía</p>
                  <p className="text-sm">Usa la pestaña "Importar Lista" para comenzar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          {/* Summary Stats Card */}
          <Card>
            <CardContent className="py-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {importHistory?.reduce((sum, i) => sum + (i.imported_count || 0), 0) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Empresas Nuevas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {importHistory?.reduce((sum, i) => sum + (i.updated_count || 0), 0) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Actualizadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {importHistory?.reduce((sum, i) => sum + (i.results?.contacts?.imported || 0), 0) || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Contactos Nuevos</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-muted-foreground">
                    {importHistory?.length || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Importaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Historial de Importaciones</CardTitle>
              <CardDescription>
                Registro detallado de todas las importaciones realizadas desde Apollo
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <VisitorImportHistory
                imports={importHistory || []}
                isLoading={historyLoading}
                onRefresh={() => refetchHistory()}
                onDelete={(id) => deleteImport.mutate(id)}
                isDeleting={deleteImport.isPending}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Search Sheet */}
      <ContactSearchSheet
        open={contactSearchOpen}
        onOpenChange={setContactSearchOpen}
        empresa={selectedEmpresa}
      />
    </div>
  );
}
