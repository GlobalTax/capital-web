import { useState, useMemo } from 'react';
import { FileText, Upload, Trash2, Eye, Download, CheckCircle, XCircle, BarChart3, GitCompare, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { RODFilters, RODFiltersState } from './rod/RODFilters';
import { RODVersionStats } from './rod/RODVersionStats';
import { RODTimeline } from './rod/RODTimeline';
import { RODComparison } from './rod/RODComparison';
import { RODImpactAnalysis } from './rod/RODImpactAnalysis';
import { RODExportButton } from './rod/RODExportButton';

// Helper function to format bytes
const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

interface RODDocument {
  id: string;
  title: string;
  version: string;
  file_url: string;
  file_type: 'pdf' | 'excel';
  file_size_bytes: number | null;
  description: string | null;
  is_active: boolean;
  is_latest: boolean;
  total_downloads: number;
  created_at: string;
  activated_at: string | null;
  deactivated_at: string | null;
  is_deleted: boolean;
  deleted_at: string | null;
}

export const RODDocumentsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadData, setUploadData] = useState({
    title: '',
    version: '',
    file_type: 'pdf' as 'pdf' | 'excel',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Filters and comparison state
  const [filters, setFilters] = useState<RODFiltersState>({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    fileType: 'all',
    minDownloads: '',
    maxDownloads: '',
    sortBy: 'created_at',
    sortOrder: 'desc',
    searchQuery: ''
  });
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [expandedStats, setExpandedStats] = useState<string[]>([]);

  // Fetch ROD documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ['rod-documents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rod_documents')
        .select('*')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as RODDocument[];
    }
  });

  // Upload document mutation
  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error('No file selected');

      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `rod_${Date.now()}.${fileExt}`;
      const filePath = `rod/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      // Create document record
      const { error: dbError } = await supabase
        .from('rod_documents')
        .insert({
          title: uploadData.title,
          version: uploadData.version,
          file_url: publicUrl,
          file_type: uploadData.file_type,
          file_size_bytes: selectedFile.size,
          description: uploadData.description,
          is_latest: true
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast({
        title: "✅ Documento ROD subido",
        description: "El documento se ha cargado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ['rod-documents'] });
      setSelectedFile(null);
      setUploadData({ title: '', version: '', file_type: 'pdf', description: '' });
    },
    onError: (error: any) => {
      toast({
        title: "❌ Error al subir documento",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Activate document mutation
  const activateMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from('rod_documents')
        .update({ is_active: true })
        .eq('id', docId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "✅ ROD activada",
        description: "Este documento ahora se enviará a nuevos leads"
      });
      queryClient.invalidateQueries({ queryKey: ['rod-documents'] });
    }
  });

  // Deactivate document mutation
  const deactivateMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from('rod_documents')
        .update({ is_active: false })
        .eq('id', docId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "⚠️ ROD desactivada",
        description: "Este documento ya no se enviará a nuevos leads"
      });
      queryClient.invalidateQueries({ queryKey: ['rod-documents'] });
    }
  });

  // Delete document mutation
  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const { error } = await supabase
        .from('rod_documents')
        .update({ is_deleted: true, deleted_at: new Date().toISOString() })
        .eq('id', docId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "🗑️ ROD eliminada",
        description: "El documento se ha eliminado correctamente"
      });
      queryClient.invalidateQueries({ queryKey: ['rod-documents'] });
    }
  });

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.title || !uploadData.version) {
      toast({
        title: "⚠️ Campos requeridos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    await uploadMutation.mutateAsync();
    setIsUploading(false);
  };

  const activeDoc = documents?.find(d => d.is_active);
  const totalDownloads = documents?.reduce((sum, d) => sum + d.total_downloads, 0) || 0;

  // Filter documents
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    
    return documents.filter(doc => {
      // Status filter
      if (filters.status === 'active' && !doc.is_active) return false;
      if (filters.status === 'inactive' && doc.is_active) return false;
      if (filters.status === 'archived' && !doc.is_deleted) return false;
      
      // File type filter
      if (filters.fileType !== 'all' && doc.file_type !== filters.fileType) return false;
      
      // Date range filter
      if (filters.dateFrom) {
        const docDate = new Date(doc.created_at);
        const fromDate = new Date(filters.dateFrom);
        if (docDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const docDate = new Date(doc.created_at);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59);
        if (docDate > toDate) return false;
      }
      
      // Downloads range filter
      if (filters.minDownloads && doc.total_downloads < parseInt(filters.minDownloads)) return false;
      if (filters.maxDownloads && doc.total_downloads > parseInt(filters.maxDownloads)) return false;
      
      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(query);
        const matchesVersion = doc.version.toLowerCase().includes(query);
        const matchesDescription = doc.description?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesVersion && !matchesDescription) return false;
      }
      
      return true;
    }).sort((a, b) => {
      const sortBy = filters.sortBy;
      const order = filters.sortOrder === 'asc' ? 1 : -1;
      
      if (sortBy === 'total_downloads') {
        return (a.total_downloads - b.total_downloads) * order;
      } else if (sortBy === 'activated_at') {
        const aDate = a.activated_at ? new Date(a.activated_at).getTime() : 0;
        const bDate = b.activated_at ? new Date(b.activated_at).getTime() : 0;
        return (aDate - bDate) * order;
      } else {
        // Default: created_at
        const aDate = new Date(a.created_at).getTime();
        const bDate = new Date(b.created_at).getTime();
        return (aDate - bDate) * order;
      }
    });
  }, [documents, filters]);

  const toggleComparisonSelection = (docId: string) => {
    setSelectedForComparison(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const toggleStatsExpanded = (docId: string) => {
    setExpandedStats(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header with stats and export */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Documentos ROD</h1>
          <p className="text-muted-foreground">
            Relación de Open Deals - Control de versiones y distribución
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <RODExportButton documents={filteredDocuments} />
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{documents?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Versiones</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{totalDownloads}</div>
              <p className="text-xs text-muted-foreground">Descargas totales</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Subir Nueva Versión ROD
          </CardTitle>
          <CardDescription>
            Sube un documento PDF o Excel que se enviará a los inversores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                placeholder="ej: ROD Capittal Q1 2025"
                value={uploadData.title}
                onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="version">Versión *</Label>
              <Input
                id="version"
                placeholder="ej: 2025-Q1"
                value={uploadData.version}
                onChange={(e) => setUploadData({ ...uploadData, version: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              placeholder="Breve descripción de esta versión..."
              value={uploadData.description}
              onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="file_type">Tipo de Documento *</Label>
              <Select
                value={uploadData.file_type}
                onValueChange={(value: 'pdf' | 'excel') => setUploadData({ ...uploadData, file_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Archivo *</Label>
              <Input
                id="file"
                type="file"
                accept={uploadData.file_type === 'pdf' ? '.pdf' : '.xlsx,.xls'}
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          <Button 
            onClick={handleUpload} 
            disabled={isUploading}
            className="w-full"
          >
            <Upload className="mr-2 h-4 w-4" />
            {isUploading ? 'Subiendo...' : 'Subir Documento ROD'}
          </Button>
        </CardContent>
      </Card>

      {/* Main content with tabs */}
      <Tabs defaultValue="lista" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="lista">
            📋 Lista
          </TabsTrigger>
          <TabsTrigger value="timeline">
            📅 Timeline
          </TabsTrigger>
          <TabsTrigger value="comparar">
            📊 Comparar
          </TabsTrigger>
        </TabsList>

        {/* Lista Tab */}
        <TabsContent value="lista" className="space-y-4">
          {/* Filters */}
          <RODFilters 
            filters={filters}
            onFiltersChange={setFilters}
            totalResults={documents?.length || 0}
            filteredResults={filteredDocuments.length}
          />

          {/* Comparison actions */}
          {selectedForComparison.length > 0 && (
            <Card className="border-blue-500 bg-blue-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    {selectedForComparison.length} versiones seleccionadas para comparar
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedForComparison([])}
                    >
                      Limpiar selección
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => setShowComparison(true)}
                      disabled={selectedForComparison.length < 2}
                    >
                      <GitCompare className="h-4 w-4 mr-2" />
                      Comparar versiones
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Documents list */}
          <Card>
            <CardHeader>
              <CardTitle>Versiones de ROD</CardTitle>
              <CardDescription>
                {activeDoc ? (
                  <span className="text-green-600 font-medium">
                    ✅ Versión activa: {activeDoc.version}
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    ⚠️ No hay ninguna versión activa
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-muted-foreground">Cargando documentos...</p>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <Collapsible 
                      key={doc.id}
                      open={expandedStats.includes(doc.id)}
                      onOpenChange={() => toggleStatsExpanded(doc.id)}
                    >
                      <div
                        className={`rounded-lg border ${
                          doc.is_active ? 'border-green-500 bg-green-50' : 'border-border'
                        }`}
                      >
                        {/* Document header */}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4 flex-1">
                            <Checkbox
                              checked={selectedForComparison.includes(doc.id)}
                              onCheckedChange={() => toggleComparisonSelection(doc.id)}
                            />
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">{doc.title}</h4>
                                {doc.is_active && <Badge variant="default">ACTIVA</Badge>}
                                {doc.is_latest && <Badge variant="outline">ÚLTIMA</Badge>}
                                <Badge variant="secondary">{doc.file_type.toUpperCase()}</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Versión {doc.version} • {format(new Date(doc.created_at), "d 'de' MMMM yyyy", { locale: es })}
                              </p>
                              {doc.description && (
                                <p className="text-sm text-muted-foreground mt-1">{doc.description}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {doc.file_size_bytes && formatBytes(doc.file_size_bytes)} • {doc.total_downloads} descargas
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <BarChart3 className="h-4 w-4 mr-1" />
                                Stats
                                {expandedStats.includes(doc.id) ? (
                                  <ChevronUp className="h-4 w-4 ml-1" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 ml-1" />
                                )}
                              </Button>
                            </CollapsibleTrigger>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Ver
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(doc.file_url, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Descargar
                            </Button>
                            
                            {doc.is_active ? (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => deactivateMutation.mutate(doc.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Desactivar
                              </Button>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => activateMutation.mutate(doc.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Activar
                              </Button>
                            )}

                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm('¿Seguro que deseas eliminar esta versión?')) {
                                  deleteMutation.mutate(doc.id);
                                }
                              }}
                              disabled={doc.is_active}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Collapsible stats */}
                        <CollapsibleContent>
                          <div className="px-4 pb-4 space-y-4">
                            <RODVersionStats documentId={doc.id} />
                            <RODImpactAnalysis documentId={doc.id} />
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {documents && documents.length > 0 
                    ? 'No se encontraron documentos con los filtros aplicados'
                    : 'No hay documentos ROD. Sube el primero usando el formulario de arriba.'
                  }
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <RODTimeline />
        </TabsContent>

        {/* Comparar Tab */}
        <TabsContent value="comparar">
          <Card>
            <CardHeader>
              <CardTitle>Comparativa de Versiones</CardTitle>
              <CardDescription>
                Selecciona versiones desde la pestaña "Lista" para compararlas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedForComparison.length >= 2 ? (
                <Button onClick={() => setShowComparison(true)}>
                  <GitCompare className="h-4 w-4 mr-2" />
                  Ver comparativa de {selectedForComparison.length} versiones
                </Button>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  Selecciona al menos 2 versiones en la pestaña "Lista" para poder compararlas
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Comparison Dialog */}
      <RODComparison 
        open={showComparison}
        onOpenChange={setShowComparison}
        documentIds={selectedForComparison}
      />
    </div>
  );
};
