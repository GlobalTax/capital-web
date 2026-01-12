import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Zap, 
  Database,
  AlertCircle,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import { useCRApolloSearchImport, CRApolloSearchCriteria, CRApolloPersonResult, CRApolloImportJob } from '@/hooks/useCRApolloSearchImport';
import { CRApolloSearchForm } from '@/components/admin/capital-riesgo/CRApolloSearchForm';
import { CRApolloSearchResults } from '@/components/admin/capital-riesgo/CRApolloSearchResults';
import { CRApolloImportHistory } from '@/components/admin/capital-riesgo/CRApolloImportHistory';
import { toast } from 'sonner';

const CRApolloImportPage: React.FC = () => {
  const {
    presets,
    presetsLoading,
    history,
    historyLoading,
    refetchHistory,
    search,
    isSearching,
    createImport,
    isCreatingImport,
    importSelected,
    importInBatches,
    isImporting,
    importResults,
    searchFromList,
    isSearchingFromList,
    deleteImport,
    isDeleting,
  } = useCRApolloSearchImport();

  const [searchResults, setSearchResults] = useState<CRApolloPersonResult[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [currentCriteria, setCurrentCriteria] = useState<CRApolloSearchCriteria | null>(null);
  const [listName, setListName] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const handleSearch = async (criteria: CRApolloSearchCriteria) => {
    try {
      setListName(null);
      const importId = await createImport(criteria);
      
      if (!importId) {
        toast.error('No se pudo crear la sesión de importación');
        return;
      }
      
      setCurrentImportId(importId);
      setCurrentCriteria(criteria);

      const result = await search({ criteria, import_id: importId });
      setSearchResults(result.people);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchFromList = async (listId: string) => {
    console.log('[UI] Starting list import for:', listId);
    
    try {
      const importId = await createImport({ q_keywords: `list:${listId}` });
      console.log('[UI] Created import job:', importId);
      
      if (!importId) {
        toast.error('No se pudo crear la sesión de importación');
        return;
      }
      
      setCurrentImportId(importId);
      setCurrentCriteria(null);

      console.log('[UI] Calling searchFromList with list_id:', listId);
      const result = await searchFromList({ list_id: listId });
      console.log('[UI] searchFromList returned:', result?.people?.length || 0, 'people');
      
      if (!result?.people || result.people.length === 0) {
        toast.error('La lista está vacía o hubo un error al cargarla. Verifica el ID de la lista.');
        setSearchResults([]);
        return;
      }
      
      setSearchResults(result.people);
      setPagination(result.pagination);
      setListName(result.list_name);
      toast.success(`${result.people.length} contactos cargados correctamente`);
    } catch (error) {
      console.error('[UI] List search error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error cargando lista: ${errorMsg}`);
      setSearchResults([]);
    }
  };

  const handleImport = async (people: CRApolloPersonResult[], enrich: boolean) => {
    if (!currentImportId) {
      toast.error('No hay sesión de importación activa. Por favor, vuelve a cargar la lista.');
      return;
    }
    
    if (people.length === 0) {
      toast.error('Selecciona al menos una persona para importar');
      return;
    }
    
    // Use legacy import for small batches
    await importSelected({
      import_id: currentImportId,
      people,
      enrich,
    });
  };

  const handleBatchImport = async (
    people: CRApolloPersonResult[], 
    enrich: boolean, 
    onProgress: (progress: any) => void
  ) => {
    if (!currentImportId) {
      toast.error('No hay sesión de importación activa. Por favor, vuelve a cargar la lista.');
      throw new Error('No active import session');
    }
    
    if (people.length === 0) {
      toast.error('Selecciona al menos una persona para importar');
      throw new Error('No people selected');
    }
    
    // Use batch import for large imports
    return await importInBatches({
      import_id: currentImportId,
      people,
      enrich,
      onProgress,
    });
  };

  const handleLoadMore = async () => {
    if (!currentCriteria || !currentImportId) return;
    
    const nextPage = (pagination?.page || 1) + 1;
    const result = await search({ 
      criteria: { ...currentCriteria, page: nextPage },
      import_id: currentImportId,
    });
    
    setSearchResults(prev => [...prev, ...result.people]);
    setPagination(result.pagination);
  };

  const handleRetryImport = async (importJob: CRApolloImportJob) => {
    const listKeyword = importJob.search_criteria?.q_keywords;
    if (!listKeyword?.startsWith('list:')) {
      toast.error('Este import no puede reintentarse');
      return;
    }
    
    const listId = listKeyword.replace('list:', '');
    setIsRetrying(true);
    setCurrentImportId(importJob.id);
    
    try {
      const result = await searchFromList({ list_id: listId });
      
      if (!result?.people || result.people.length === 0) {
        toast.error('La lista está vacía o hubo un error al cargarla');
        setSearchResults([]);
        return;
      }
      
      setSearchResults(result.people);
      setPagination(result.pagination);
      setListName(result.list_name);
      toast.success(`${result.people.length} contactos recuperados`);
    } catch (error) {
      console.error('[Retry] Error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error reintentando: ${errorMsg}`);
    } finally {
      setIsRetrying(false);
    }
  };

  const totalImported = history.reduce((sum, h) => sum + (h.imported_count || 0), 0);
  const totalSearched = history.reduce((sum, h) => sum + (h.total_results || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Apollo Import - Capital Riesgo
          </h1>
          <p className="text-muted-foreground mt-1">
            Importa contactos de Private Equity y Venture Capital desde Apollo.io
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Sparkles className="h-3 w-3" />
          API Apollo Conectada
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalImported}</div>
                <div className="text-sm text-muted-foreground">Personas PE/VC importadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalSearched}</div>
                <div className="text-sm text-muted-foreground">Total encontrados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Zap className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{history.length}</div>
                <div className="text-sm text-muted-foreground">Importaciones realizadas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Importante:</strong> Importar desde listas guardadas no consume créditos. 
          La búsqueda global es gratuita. Activar "Enriquecer emails" consume créditos de Apollo.
        </AlertDescription>
      </Alert>

      {/* Search Form */}
      <CRApolloSearchForm
        presets={presets}
        onSearch={handleSearch}
        onSearchFromList={handleSearchFromList}
        isSearching={isSearching || isCreatingImport}
        isSearchingFromList={isSearchingFromList || isCreatingImport}
      />

      {/* Search Results */}
      {(searchResults.length > 0 || importResults) && (
        <>
          <div className="flex items-center gap-2">
            {currentImportId ? (
              <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50">
                <CheckCircle className="h-3 w-3" />
                Sesión activa
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                <AlertCircle className="h-3 w-3" />
                Sin sesión de importación
              </Badge>
            )}
            {listName && (
              <Badge variant="default" className="gap-1">
                <Database className="h-3 w-3" />
                Lista: {listName}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {searchResults.length} contactos PE/VC cargados
            </span>
          </div>
          
          <CRApolloSearchResults
            people={searchResults}
            pagination={pagination}
            onImport={handleImport}
            onBatchImport={handleBatchImport}
            isImporting={isImporting}
            importResults={importResults}
            onLoadMore={handleLoadMore}
            isLoadingMore={isSearching}
            hasActiveSession={!!currentImportId}
          />
        </>
      )}

      {/* Import History */}
      <CRApolloImportHistory
        imports={history}
        isLoading={historyLoading}
        onRefresh={refetchHistory}
        onDelete={deleteImport}
        isDeleting={isDeleting}
        onRetry={handleRetryImport}
        isRetrying={isRetrying}
      />
    </div>
  );
};

export default CRApolloImportPage;
