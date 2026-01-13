import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Zap, 
  Database,
  AlertCircle,
  Sparkles,
  TrendingUp,
  CheckCircle,
  Building2,
  User,
  List,
  Link2,
  Loader2,
  Trash2,
  Clock,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { 
  useMNAApolloSearchImport, 
  MNAApolloPersonResult, 
  MNAApolloImportJob,
  MNAListType 
} from '@/hooks/useMNAApolloSearchImport';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

const extractListId = (input: string): string => {
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/lists\/([a-f0-9]+)/i);
  if (urlMatch) return urlMatch[1];
  if (/^[a-f0-9]{24}$/i.test(trimmed)) return trimmed;
  return trimmed;
};

const MNAApolloImportPage: React.FC = () => {
  const {
    presets,
    presetsLoading,
    history,
    historyLoading,
    refetchHistory,
    createImport,
    isCreatingImport,
    importInBatches,
    isImporting,
    importResults,
    searchFromList,
    isSearchingFromList,
    deleteImport,
    isDeleting,
  } = useMNAApolloSearchImport();

  const [searchResults, setSearchResults] = useState<MNAApolloPersonResult[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [currentImportId, setCurrentImportId] = useState<string | null>(null);
  const [listName, setListName] = useState<string | null>(null);
  const [currentListType, setCurrentListType] = useState<MNAListType>('contacts');
  const [listInput, setListInput] = useState('');
  const [listType, setListType] = useState<MNAListType>('contacts');
  const [importProgress, setImportProgress] = useState<{ current: number; total: number } | null>(null);

  const handleSearchFromList = async () => {
    const listId = extractListId(listInput);
    if (!listId) {
      toast.error('Introduce un ID de lista válido');
      return;
    }
    
    let createdImportId: string | null = null;
    
    try {
      createdImportId = await createImport({ 
        criteria: { q_keywords: `list:${listId}:${listType}` },
        import_type: listType,
      });
      
      if (!createdImportId) {
        toast.error('No se pudo crear la sesión de importación');
        return;
      }
      
      setCurrentImportId(createdImportId);
      setCurrentListType(listType);

      const result = await searchFromList({ list_id: listId, list_type: listType });
      
      if (!result?.people || result.people.length === 0) {
        await supabase
          .from('mna_apollo_imports')
          .update({ 
            status: 'failed', 
            error_message: 'La lista está vacía o el ID es incorrecto' 
          })
          .eq('id', createdImportId);
        
        toast.error('La lista está vacía o el ID es incorrecto');
        setSearchResults([]);
        refetchHistory();
        return;
      }
      
      setSearchResults(result.people);
      setListName(result.list_name);
      setSelectedIds(new Set(result.people.map(p => p.id)));
    } catch (error) {
      console.error('[UI] List search error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      
      if (createdImportId) {
        await supabase
          .from('mna_apollo_imports')
          .update({ status: 'failed', error_message: errorMsg })
          .eq('id', createdImportId);
        refetchHistory();
      }
      
      toast.error(`Error cargando lista: ${errorMsg}`);
      setSearchResults([]);
    }
  };

  const handleImport = async () => {
    if (!currentImportId) {
      toast.error('No hay sesión de importación activa');
      return;
    }
    
    const selectedPeople = searchResults.filter(p => selectedIds.has(p.id));
    if (selectedPeople.length === 0) {
      toast.error('Selecciona al menos un elemento para importar');
      return;
    }
    
    const importType = currentListType === 'organizations' ? 'organizations' : 'people';
    
    try {
      await importInBatches({
        import_id: currentImportId,
        people: selectedPeople,
        import_type: importType,
        onProgress: (progress) => {
          setImportProgress({ current: progress.currentBatch, total: progress.totalBatches });
        },
      });
      
      setImportProgress(null);
      setSearchResults([]);
      setSelectedIds(new Set());
      setCurrentImportId(null);
    } catch (error) {
      setImportProgress(null);
      console.error('Import error:', error);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === searchResults.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(searchResults.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleDeleteImport = async (importId: string) => {
    try {
      await deleteImport(importId);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const totalImported = history.reduce((sum, h) => sum + (h.imported_count || 0), 0);
  const totalSearched = history.reduce((sum, h) => sum + (h.total_results || 0), 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="gap-1 bg-green-600"><CheckCircle className="h-3 w-3" /> Completado</Badge>;
      case 'importing':
        return <Badge variant="secondary" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" /> Importando</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" /> Fallido</Badge>;
      default:
        return <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" /> {status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Building2 className="h-6 w-6" />
            Apollo Import - Boutiques M&A
          </h1>
          <p className="text-muted-foreground mt-1">
            Importa boutiques de M&A y sus profesionales desde Apollo.io
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
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{totalImported}</div>
                <div className="text-sm text-muted-foreground">Boutiques/Personas importadas</div>
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
          <strong>Importante:</strong> Importar desde listas guardadas no consume créditos de Apollo. 
          Las personas se importan junto con su boutique (se crea automáticamente si no existe).
        </AlertDescription>
      </Alert>

      {/* Import from List */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <List className="h-4 w-4 text-primary" />
            Importar desde Lista de Apollo
          </Label>
          
          {/* List Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Tipo de lista</Label>
            <Select value={listType} onValueChange={(v: MNAListType) => setListType(v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de lista" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contacts">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Contactos (personas M&A)</span>
                  </div>
                </SelectItem>
                <SelectItem value="organizations">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>Empresas (boutiques directamente)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {listType === 'contacts' 
                ? '👤 Importa personas M&A → se crean boutiques automáticamente desde su empresa' 
                : '🏢 Importa boutiques directamente como empresas'}
            </p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={listInput}
                onChange={(e) => setListInput(e.target.value)}
                placeholder="Ej: 6963a8a0d67d450011d306e1 o app.apollo.io/#/lists/..."
                className="pl-9"
              />
            </div>
            <Button
              onClick={handleSearchFromList}
              disabled={isSearchingFromList || isCreatingImport || !listInput.trim()}
              className="gap-2 whitespace-nowrap"
            >
              {isSearchingFromList || isCreatingImport ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  {listType === 'organizations' ? <Building2 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  Cargar Lista
                </>
              )}
            </Button>
          </div>
          
          {isSearchingFromList && (
            <p className="text-sm text-muted-foreground animate-pulse flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando {listType === 'organizations' ? 'empresas' : 'contactos'}... puede tardar hasta 30 segundos.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {currentImportId ? (
                  <Badge variant="outline" className="gap-1 text-green-600 border-green-200 bg-green-50">
                    <CheckCircle className="h-3 w-3" />
                    Sesión activa
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                    <AlertCircle className="h-3 w-3" />
                    Sin sesión
                  </Badge>
                )}
                {listName && (
                  <Badge variant="default" className="gap-1">
                    {currentListType === 'organizations' ? <Building2 className="h-3 w-3" /> : <Database className="h-3 w-3" />}
                    {listName}
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  {searchResults.length} {currentListType === 'organizations' ? 'boutiques' : 'contactos'} • 
                  {selectedIds.size} seleccionados
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={toggleSelectAll}>
                  {selectedIds.size === searchResults.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                </Button>
                <Button 
                  onClick={handleImport} 
                  disabled={isImporting || selectedIds.size === 0}
                  className="gap-2"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>
                      <Users className="h-4 w-4" />
                      Importar ({selectedIds.size})
                    </>
                  )}
                </Button>
              </div>
            </div>

            {importProgress && (
              <div className="space-y-2">
                <Progress value={(importProgress.current / importProgress.total) * 100} />
                <p className="text-sm text-muted-foreground text-center">
                  Procesando lote {importProgress.current} de {importProgress.total}
                </p>
              </div>
            )}

            <ScrollArea className="h-[400px] border rounded-lg">
              <div className="divide-y">
                {searchResults.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 flex items-center gap-3 hover:bg-muted/50 cursor-pointer ${
                      selectedIds.has(item.id) ? 'bg-primary/5' : ''
                    }`}
                    onClick={() => toggleSelect(item.id)}
                  >
                    <Checkbox 
                      checked={selectedIds.has(item.id)}
                      onCheckedChange={() => toggleSelect(item.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{item.name}</div>
                      <div className="text-sm text-muted-foreground truncate">
                        {item.title} {item.organization?.name && `@ ${item.organization.name}`}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.country || item.organization?.country || '-'}
                    </div>
                    {item.organization?.estimated_num_employees && (
                      <Badge variant="outline" className="text-xs">
                        {item.organization.estimated_num_employees} emp
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Import History */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Historial de Importaciones
            </h3>
            <Button variant="ghost" size="sm" onClick={() => refetchHistory()} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Actualizar
            </Button>
          </div>
          
          {historyLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay importaciones registradas
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusBadge(job.status)}
                    <div>
                      <div className="text-sm">
                        {job.import_type === 'organizations' ? 'Empresas' : 'Contactos'}
                        {job.imported_count > 0 && ` • ${job.imported_count} importados`}
                        {job.updated_count > 0 && ` • ${job.updated_count} actualizados`}
                        {job.error_count > 0 && ` • ${job.error_count} errores`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: es })}
                      </div>
                    </div>
                  </div>
                  {['pending', 'failed', 'importing'].includes(job.status) && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteImport(job.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MNAApolloImportPage;
