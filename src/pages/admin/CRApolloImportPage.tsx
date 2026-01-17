import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  Building2,
} from 'lucide-react';
import { useCRApolloSearchImport, CRApolloSearchCriteria, CRApolloPersonResult, CRApolloImportJob } from '@/hooks/useCRApolloSearchImport';
import { CRApolloSearchForm, ListType } from '@/components/admin/capital-riesgo/CRApolloSearchForm';
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
  const [currentListType, setCurrentListType] = useState<ListType>('contacts');
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
      
      // Update the job in database to 'previewing' status with total_results
      if (result.people.length > 0) {
        await supabase
          .from('cr_apollo_imports')
          .update({ 
            status: 'previewing', 
            total_results: result.people.length,
          })
          .eq('id', importId);
        refetchHistory();
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchFromList = async (listId: string, listType: ListType = 'contacts') => {
    console.log('[UI] Starting list import for:', listId, 'type:', listType);
    
    let createdImportId: string | null = null;
    
    try {
      createdImportId = await createImport({ q_keywords: `list:${listId}:${listType}` });
      console.log('[UI] Created import job:', createdImportId);
      
      if (!createdImportId) {
        toast.error('No se pudo crear la sesión de importación');
        return;
      }
      
      setCurrentImportId(createdImportId);
      setCurrentCriteria(null);
      setCurrentListType(listType);

      console.log('[UI] Calling searchFromList with list_id:', listId, 'list_type:', listType);
      const result = await searchFromList({ list_id: listId, list_type: listType });
      console.log('[UI] searchFromList returned:', result);
      
      // Handle error returned in result (not thrown)
      if (result.error) {
        console.error('[UI] List search returned error:', result.error);
        
        // Mark the job as failed with error message
        if (createdImportId) {
          await supabase
            .from('cr_apollo_imports')
            .update({ 
              status: 'failed', 
              error_message: result.error 
            })
            .eq('id', createdImportId);
          refetchHistory();
        }
        
        // Show error toast
        toast.error(result.error, { duration: 8000 });
        setSearchResults([]);
        return;
      }
      
      if (!result.people || result.people.length === 0) {
        // Mark the job as failed so it doesn't stay pending
        await supabase
          .from('cr_apollo_imports')
          .update({ 
            status: 'failed', 
            error_message: `La lista de ${listType === 'organizations' ? 'empresas' : 'contactos'} está vacía o el ID es incorrecto` 
          })
          .eq('id', createdImportId);
        
        toast.error(`La lista está vacía o el ID es incorrecto. Verifica el ID en Apollo.`);
        setSearchResults([]);
        refetchHistory();
        return;
      }
      
      setSearchResults(result.people);
      setPagination(result.pagination);
      setListName(result.list_name);
      
      // Update the job in database to 'previewing' status with total_results
      await supabase
        .from('cr_apollo_imports')
        .update({ 
          status: 'previewing', 
          total_results: result.people.length,
        })
        .eq('id', createdImportId);
      refetchHistory();
      
      // Show info toast for large lists
      if (result.pagination?.total_entries > 5000) {
        toast.info(
          `Lista grande: ${result.pagination.total_entries.toLocaleString()} contactos totales`,
          { duration: 4000 }
        );
      }
    } catch (error: any) {
      // This catch is for unexpected errors (network, etc.)
      console.error('[UI] Unexpected error:', error);
      
      if (createdImportId) {
        await supabase
          .from('cr_apollo_imports')
          .update({ 
            status: 'failed', 
            error_message: error?.message || 'Error inesperado'
          })
          .eq('id', createdImportId);
        refetchHistory();
      }
      
      toast.error(`Error inesperado: ${error?.message || 'Error desconocido'}`);
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
      toast.error('Selecciona al menos un elemento para importar');
      throw new Error('No items selected');
    }
    
    // Determine import type based on current list type
    const importType = currentListType === 'organizations' ? 'organizations' : 'people';
    
    // Use batch import for large imports
    return await importInBatches({
      import_id: currentImportId,
      people,
      enrich,
      import_type: importType,
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
    
    // Parse correctly: "list:<id>:<type>" or "list:<id>"
    const parts = listKeyword.replace('list:', '').split(':');
    const listId = parts[0];
    const listType: ListType = parts[1] === 'organizations' ? 'organizations' : 'contacts';
    
    console.log('[Retry] Parsed listId:', listId, 'listType:', listType);
    
    setIsRetrying(true);
    setCurrentImportId(importJob.id);
    setCurrentListType(listType);
    
    try {
      const result = await searchFromList({ list_id: listId, list_type: listType });
      
      if (!result?.people || result.people.length === 0) {
        await supabase
          .from('cr_apollo_imports')
          .update({ 
            status: 'failed', 
            error_message: `La lista de ${listType === 'organizations' ? 'empresas' : 'contactos'} está vacía o el ID es incorrecto` 
          })
          .eq('id', importJob.id);
        
        toast.error('La lista está vacía o el ID es incorrecto');
        setSearchResults([]);
        refetchHistory();
        return;
      }
      
      setSearchResults(result.people);
      setPagination(result.pagination);
      setListName(result.list_name);
      
      // Update the job in database to 'previewing' status with total_results
      await supabase
        .from('cr_apollo_imports')
        .update({ 
          status: 'previewing', 
          total_results: result.people.length,
        })
        .eq('id', importJob.id);
      refetchHistory();
      
      const typeLabel = listType === 'organizations' ? 'empresas' : 'contactos';
      toast.success(`${result.people.length} ${typeLabel} recuperados`);
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
                {currentListType === 'organizations' ? <Building2 className="h-3 w-3" /> : <Database className="h-3 w-3" />}
                Lista: {listName}
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              {searchResults.length} {currentListType === 'organizations' ? 'empresas' : 'contactos PE/VC'} cargados
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
