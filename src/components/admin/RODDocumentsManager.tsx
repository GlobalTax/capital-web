import { useState, useCallback } from 'react';
import { FileText, Upload, Trash2, Download, CheckCircle, AlertCircle, FileSpreadsheet, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useDropzone } from 'react-dropzone';

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
  language: 'es' | 'en';
}

type SlotKey = 'pdf-es' | 'pdf-en' | 'excel-es' | 'excel-en';

const SLOT_CONFIG: Record<SlotKey, { label: string; flag: string; fileType: 'pdf' | 'excel'; language: 'es' | 'en'; accept: string; icon: typeof FileText }> = {
  'pdf-es': { label: 'PDF Español', flag: '🇪🇸', fileType: 'pdf', language: 'es', accept: '.pdf', icon: FileText },
  'pdf-en': { label: 'PDF English', flag: '🇬🇧', fileType: 'pdf', language: 'en', accept: '.pdf', icon: FileText },
  'excel-es': { label: 'Excel Español', flag: '🇪🇸', fileType: 'excel', language: 'es', accept: '.xlsx,.xls', icon: FileSpreadsheet },
  'excel-en': { label: 'Excel English', flag: '🇬🇧', fileType: 'excel', language: 'en', accept: '.xlsx,.xls', icon: FileSpreadsheet },
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

const SlotCard = ({ 
  slotKey, 
  activeDoc, 
  onUpload, 
  onReplace, 
  onRemove, 
  isUploading 
}: { 
  slotKey: SlotKey; 
  activeDoc: RODDocument | null; 
  onUpload: (file: File, slotKey: SlotKey) => void;
  onReplace: (file: File, slotKey: SlotKey) => void;
  onRemove: (docId: string) => void;
  isUploading: string | null;
}) => {
  const config = SLOT_CONFIG[slotKey];
  const Icon = config.icon;
  const uploading = isUploading === slotKey;

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      if (activeDoc) {
        onReplace(acceptedFiles[0], slotKey);
      } else {
        onUpload(acceptedFiles[0], slotKey);
      }
    }
  }, [activeDoc, onUpload, onReplace, slotKey]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: config.fileType === 'pdf' 
      ? { 'application/pdf': ['.pdf'] } 
      : { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'], 'application/vnd.ms-excel': ['.xls'] },
    maxFiles: 1,
    disabled: uploading,
  });

  if (uploading) {
    return (
      <Card className="border-2 border-primary/30 bg-primary/5">
        <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[180px] gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-primary">Subiendo {config.label}...</p>
        </CardContent>
      </Card>
    );
  }

  if (activeDoc) {
    return (
      <Card className="border-2 border-green-400 bg-green-50/50 dark:bg-green-950/10">
        <CardContent className="pt-6 min-h-[180px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">{config.flag}</span>
              <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" /> ACTIVO
              </Badge>
              <Badge variant="secondary" className="text-xs">{config.fileType.toUpperCase()}</Badge>
            </div>
            <p className="font-semibold text-sm truncate" title={activeDoc.title}>{activeDoc.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              v{activeDoc.version} • {activeDoc.file_size_bytes ? formatBytes(activeDoc.file_size_bytes) : '—'}
            </p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(activeDoc.created_at), "d MMM yyyy", { locale: es })} • {activeDoc.total_downloads} descargas
            </p>
          </div>
          <div className="flex gap-2 mt-3">
            <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => window.open(activeDoc.file_url, '_blank')}>
              <Download className="h-3 w-3 mr-1" /> Ver
            </Button>
            <div {...getRootProps()} className="flex-1">
              <input {...getInputProps()} />
              <Button size="sm" variant="outline" className="w-full text-xs">
                <RefreshCw className="h-3 w-3 mr-1" /> Reemplazar
              </Button>
            </div>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-xs text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`¿Desactivar ${config.label}? Los usuarios ya no podrán descargarlo.`)) {
                  onRemove(activeDoc.id);
                }
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={`border-2 border-dashed transition-colors cursor-pointer ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <CardContent className="pt-6 min-h-[180px] flex flex-col items-center justify-center gap-3" {...getRootProps()}>
        <input {...getInputProps()} />
        <div className="flex items-center gap-2">
          <span className="text-xl">{config.flag}</span>
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {isDragActive ? 'Suelta aquí...' : 'Arrastra un archivo o haz clic'}
          </p>
        </div>
        <AlertCircle className="h-4 w-4 text-amber-500" />
        <p className="text-xs text-amber-600 font-medium">Sin documento activo</p>
      </CardContent>
    </Card>
  );
};

export const RODDocumentsManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);

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
    },
    staleTime: 0,
  });

  const getActiveDoc = (fileType: 'pdf' | 'excel', language: 'es' | 'en') => {
    return documents?.find(d => d.is_active && d.file_type === fileType && d.language === language) || null;
  };

  const uploadAndActivate = async (file: File, slotKey: SlotKey) => {
    const config = SLOT_CONFIG[slotKey];
    setUploadingSlot(slotKey);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `rod_${Date.now()}.${fileExt}`;
      const filePath = `rod/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { contentType: file.type, upsert: false });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

      // Deactivate previous docs of same type+language
      await supabase
        .from('rod_documents')
        .update({ is_active: false, deactivated_at: new Date().toISOString() })
        .eq('language', config.language)
        .eq('file_type', config.fileType)
        .eq('is_deleted', false);

      // Generate auto version
      const now = new Date();
      const version = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const { error: dbError } = await supabase
        .from('rod_documents')
        .insert({
          title: `ROD ${config.fileType.toUpperCase()} ${config.flag} ${version}`,
          version,
          file_url: publicUrl,
          file_type: config.fileType,
          file_size_bytes: file.size,
          language: config.language,
          is_active: true,
          is_latest: true,
          activated_at: new Date().toISOString(),
        });
      if (dbError) throw dbError;

      toast({ title: '✅ ROD actualizada', description: `${config.label} subido y activado correctamente` });
      queryClient.invalidateQueries({ queryKey: ['rod-documents'] });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    } finally {
      setUploadingSlot(null);
    }
  };

  const deactivateDoc = async (docId: string) => {
    try {
      const { error } = await supabase
        .from('rod_documents')
        .update({ is_active: false, deactivated_at: new Date().toISOString() })
        .eq('id', docId);
      if (error) throw error;
      toast({ title: '⚠️ ROD desactivada' });
      queryClient.invalidateQueries({ queryKey: ['rod-documents'] });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message, variant: 'destructive' });
    }
  };

  const inactiveDocs = documents?.filter(d => !d.is_active) || [];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Documentos ROD</h1>
        <p className="text-muted-foreground">
          Sube la Relación de Oportunidades actualizada. Arrastra el archivo en su casilla correspondiente.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* 4 Slots Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Documentos Activos en el Marketplace</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(Object.keys(SLOT_CONFIG) as SlotKey[]).map(slotKey => {
                const config = SLOT_CONFIG[slotKey];
                return (
                  <SlotCard
                    key={slotKey}
                    slotKey={slotKey}
                    activeDoc={getActiveDoc(config.fileType, config.language)}
                    onUpload={uploadAndActivate}
                    onReplace={uploadAndActivate}
                    onRemove={deactivateDoc}
                    isUploading={uploadingSlot}
                  />
                );
              })}
            </div>
          </div>

          {/* Previous Versions */}
          {inactiveDocs.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Versiones Anteriores</CardTitle>
                <CardDescription>{inactiveDocs.length} documentos archivados</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y">
                  {inactiveDocs.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-3">
                        {doc.file_type === 'pdf' ? <FileText className="h-4 w-4 text-muted-foreground" /> : <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />}
                        <div>
                          <p className="text-sm font-medium">{doc.title}</p>
                          <p className="text-xs text-muted-foreground">
                            v{doc.version} • {format(new Date(doc.created_at), "d MMM yyyy", { locale: es })} • {doc.total_downloads} descargas
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {doc.language === 'es' ? '🇪🇸' : '🇬🇧'} {doc.file_type.toUpperCase()}
                        </Badge>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(doc.file_url, '_blank')}>
                          <Download className="h-3.5 w-3.5" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => {
                            if (confirm('¿Eliminar esta versión?')) {
                              supabase.from('rod_documents').update({ is_deleted: true, deleted_at: new Date().toISOString() }).eq('id', doc.id).then(() => {
                                queryClient.invalidateQueries({ queryKey: ['rod-documents'] });
                              });
                            }
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
