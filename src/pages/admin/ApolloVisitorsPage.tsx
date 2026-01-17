import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Globe, 
  Search, 
  Download, 
  Building2, 
  Users, 
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { 
  useApolloVisitorImport, 
  useVisitorImportHistory, 
  useImportedEmpresas,
  ApolloOrganization,
} from '@/hooks/useApolloVisitorImport';
import { OrganizationPreviewTable } from '@/components/admin/apollo-visitors/OrganizationPreviewTable';
import { ImportedEmpresasTable } from '@/components/admin/apollo-visitors/ImportedEmpresasTable';
import { ContactSearchSheet } from '@/components/admin/apollo-visitors/ContactSearchSheet';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ApolloVisitorsPage() {
  const [listId, setListId] = useState('');
  const [listType, setListType] = useState<'static' | 'dynamic'>('static');
  const [organizations, setOrganizations] = useState<ApolloOrganization[]>([]);
  const [selectedOrgs, setSelectedOrgs] = useState<Set<string>>(new Set());
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [totalFound, setTotalFound] = useState(0);
  
  // Contact search state
  const [contactSearchOpen, setContactSearchOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<{ id: string; name: string; apolloOrgId: string } | null>(null);

  const {
    isSearching,
    isImporting,
    createImport,
    searchOrganizations,
    importOrganizations,
  } = useApolloVisitorImport();

  const { data: importHistory, isLoading: historyLoading } = useVisitorImportHistory();
  const { data: importedEmpresas, isLoading: empresasLoading, refetch: refetchEmpresas } = useImportedEmpresas();

  // Extract list ID from URL or use raw ID
  const parseListId = (input: string): string => {
    // Handle full Apollo URL
    const match = input.match(/lists\/([a-f0-9-]+)/i);
    if (match) return match[1];
    // Handle raw ID
    return input.trim();
  };

  const handleSearch = async () => {
    if (!listId.trim()) return;
    
    try {
      const parsedId = parseListId(listId);
      const importJob = await createImport(parsedId, listType);
      setCurrentImportId(importJob.id);
      
      const result = await searchOrganizations(parsedId, listType, importJob.id);
      setOrganizations(result.organizations);
      setTotalFound(result.total);
      setSelectedOrgs(new Set());
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleImport = async () => {
    const orgsToImport = organizations.filter(org => selectedOrgs.has(org.id));
    if (orgsToImport.length === 0) return;
    
    try {
      await importOrganizations(orgsToImport, currentImportId || undefined);
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
              <CardTitle className="text-lg">Buscar en Lista Apollo</CardTitle>
              <CardDescription>
                Pega la URL o ID de tu lista de Apollo (ej: "webbers")
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <div className="w-40">
                  <Label htmlFor="listType">Tipo de Lista</Label>
                  <select
                    id="listType"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={listType}
                    onChange={(e) => setListType(e.target.value as 'static' | 'dynamic')}
                  >
                    <option value="static">Estática</option>
                    <option value="dynamic">Dinámica</option>
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
            </CardContent>
          </Card>

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
                  <Button 
                    size="sm" 
                    onClick={handleImport} 
                    disabled={selectedOrgs.size === 0 || isImporting}
                  >
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Importando...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Importar ({selectedOrgs.size})
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <OrganizationPreviewTable
                  organizations={organizations}
                  selectedIds={selectedOrgs}
                  onToggleSelect={toggleSelect}
                />
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial de Importaciones</CardTitle>
              <CardDescription>
                Últimas importaciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : importHistory && importHistory.length > 0 ? (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {importHistory.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg border bg-card"
                      >
                        <div className="flex items-center gap-3">
                          {item.status === 'completed' ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : item.status === 'failed' ? (
                            <AlertCircle className="h-5 w-5 text-destructive" />
                          ) : (
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          )}
                          <div>
                            <p className="font-medium text-sm">Lista: {item.list_id}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(item.created_at), { 
                                addSuffix: true, 
                                locale: es 
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="text-right">
                            <p className="text-muted-foreground">Encontradas</p>
                            <p className="font-medium">{item.total_found}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Importadas</p>
                            <p className="font-medium text-green-600">{item.imported_count}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-muted-foreground">Actualizadas</p>
                            <p className="font-medium text-blue-600">{item.updated_count}</p>
                          </div>
                          <Badge variant={item.status === 'completed' ? 'default' : item.status === 'failed' ? 'destructive' : 'secondary'}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No hay importaciones en el historial</p>
                </div>
              )}
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
