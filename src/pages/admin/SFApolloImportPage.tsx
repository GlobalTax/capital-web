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
} from 'lucide-react';
import { useApolloSearchImport, ApolloSearchCriteria, ApolloPersonResult } from '@/hooks/useApolloSearchImport';
import { ApolloSearchForm } from '@/components/admin/search-funds/ApolloSearchForm';
import { ApolloSearchResults } from '@/components/admin/search-funds/ApolloSearchResults';
import { ApolloImportHistory } from '@/components/admin/search-funds/ApolloImportHistory';

const SFApolloImportPage: React.FC = () => {
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
    isImporting,
    importResults,
    searchFromList,
    isSearchingFromList,
  } = useApolloSearchImport();

  const [searchResults, setSearchResults] = useState<ApolloPersonResult[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [currentCriteria, setCurrentCriteria] = useState<ApolloSearchCriteria | null>(null);
  const [listName, setListName] = useState<string | null>(null);

  const handleSearch = async (criteria: ApolloSearchCriteria) => {
    try {
      setListName(null);
      // Crear job de import
      const importId = await createImport(criteria);
      setCurrentImportId(importId);
      setCurrentCriteria(criteria);

      // Ejecutar búsqueda
      const result = await search({ criteria, import_id: importId });
      setSearchResults(result.people);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSearchFromList = async (listId: string) => {
    try {
      // Crear job de import para la lista
      const importId = await createImport({ q_keywords: `list:${listId}` });
      setCurrentImportId(importId);
      setCurrentCriteria(null);

      // Cargar contactos de la lista
      const result = await searchFromList({ list_id: listId });
      setSearchResults(result.people);
      setPagination(result.pagination);
      setListName(result.list_name);
    } catch (error) {
      console.error('List search error:', error);
    }
  };

  const handleImport = async (people: ApolloPersonResult[], enrich: boolean) => {
    if (!currentImportId) return;
    
    await importSelected({
      import_id: currentImportId,
      people,
      enrich,
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

  // Stats from history
  const totalImported = history.reduce((sum, h) => sum + (h.imported_count || 0), 0);
  const totalSearched = history.reduce((sum, h) => sum + (h.total_results || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="h-6 w-6" />
            Apollo Search Import
          </h1>
          <p className="text-muted-foreground mt-1">
            Importa contactos desde tus listas de Apollo o busca en la base de datos global
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
                <div className="text-sm text-muted-foreground">Personas importadas</div>
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
      <ApolloSearchForm
        presets={presets}
        onSearch={handleSearch}
        onSearchFromList={handleSearchFromList}
        isSearching={isSearching || isCreatingImport}
        isSearchingFromList={isSearchingFromList || isCreatingImport}
      />

      {/* Search Results */}
      {(searchResults.length > 0 || importResults) && (
        <>
          {listName && (
            <Alert className="bg-primary/5 border-primary/20">
              <AlertDescription className="flex items-center gap-2">
                <Badge variant="default" className="gap-1">
                  <Database className="h-3 w-3" />
                  Lista: {listName}
                </Badge>
                <span className="text-muted-foreground">
                  {searchResults.length} contactos cargados
                </span>
              </AlertDescription>
            </Alert>
          )}
          <ApolloSearchResults
            people={searchResults}
            pagination={pagination}
            onImport={handleImport}
            isImporting={isImporting}
            importResults={importResults}
            onLoadMore={handleLoadMore}
            isLoadingMore={isSearching}
          />
        </>
      )}

      {/* Import History */}
      <ApolloImportHistory
        imports={history}
        isLoading={historyLoading}
        onRefresh={refetchHistory}
      />
    </div>
  );
};

export default SFApolloImportPage;
