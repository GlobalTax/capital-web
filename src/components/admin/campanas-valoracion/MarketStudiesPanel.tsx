import { useState, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import SectorSelect from '@/components/admin/shared/SectorSelect';
import { Upload, Download, Trash2, Search, FileText, BookOpen, CheckCircle2, Clock, Eye, Presentation } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMarketStudies, MarketStudy } from '@/hooks/useMarketStudies';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function MarketStudiesPanel() {
  const { studies, isLoading, uploadStudy, deleteStudy, updateStatus, getFileBlob, getSignedUrl } = useMarketStudies();
  const [searchQuery, setSearchQuery] = useState('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<MarketStudy | null>(null);

  // Upload form state
  const [title, setTitle] = useState('');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const filtered = useMemo(() => {
    return studies.filter((s) => {
      const matchesSearch = !searchQuery || s.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSector = !sectorFilter || s.sector === sectorFilter;
      const matchesStatus = !statusFilter || s.status === statusFilter;
      return matchesSearch && matchesSector && matchesStatus;
    });
  }, [studies, searchQuery, sectorFilter, statusFilter]);

  const sectors = useMemo(() => {
    const set = new Set(studies.map((s) => s.sector).filter(Boolean) as string[]);
    return Array.from(set).sort();
  }, [studies]);

  const resetForm = () => {
    setTitle('');
    setSector('');
    setDescription('');
    setFile(null);
  };

  const handleUpload = async () => {
    if (!title.trim() || !file) return;
    await uploadStudy.mutateAsync({ title: title.trim(), sector, description, file });
    resetForm();
    setShowUpload(false);
  };

  const handleDownload = async (study: MarketStudy) => {
    try {
      const blob = await getFileBlob(study.storage_path, study.file_name);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = study.file_name;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({ title: 'Error al descargar', description: err?.message || 'No se pudo descargar el archivo', variant: 'destructive' });
    }
  };

  const handlePreview = async (study: MarketStudy) => {
    const ext = study.file_name.split('.').pop()?.toLowerCase();
    if (ext === 'ppt' || ext === 'pptx') {
      toast({ title: 'Los archivos PPT no se pueden previsualizar', description: 'Usa el botón Descargar para abrirlo en tu equipo.' });
      return;
    }
    try {
      const blob = await getFileBlob(study.storage_path, study.file_name);
      const url = URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      window.open(url, '_blank');
    } catch (err: any) {
      toast({ title: 'Error al previsualizar', description: err?.message || 'No se pudo abrir el archivo', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-40 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar estudio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {sectors.length > 0 && (
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Todos los sectores</option>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 rounded-md border border-border bg-background px-3 text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="validated">Validado</option>
          </select>
        </div>
        <Button onClick={() => setShowUpload(true)} size="sm">
          <Upload className="h-4 w-4 mr-1.5" />
          Subir Estudio
        </Button>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              {studies.length === 0
                ? 'No hay estudios de mercado. Sube el primero.'
                : 'No se encontraron estudios con los filtros actuales.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((study) => (
            <Card key={study.id} className="group hover:shadow-md transition-shadow">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-md bg-muted">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{study.title}</h4>
                    {study.sector && (
                      <Badge variant="secondary" className="mt-1 text-xs">{study.sector}</Badge>
                    )}
                  </div>
                  <Select
                    value={study.status}
                    onValueChange={(v) => updateStatus.mutate({ id: study.id, status: v as 'pending' | 'validated' })}
                  >
                    <SelectTrigger className="h-7 w-auto min-w-[120px] text-xs gap-1 border-0 bg-transparent p-0 px-1 hover:bg-muted">
                      {study.status === 'validated' ? (
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" />Validado</span>
                      ) : (
                        <span className="flex items-center gap-1 text-amber-600"><Clock className="h-3.5 w-3.5" />Pendiente</span>
                      )}
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-amber-600" />Pendiente</span>
                      </SelectItem>
                      <SelectItem value="validated">
                        <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />Validado</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {study.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{study.description}</p>
                )}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(study.file_size)}</span>
                  <span>{format(new Date(study.created_at), 'dd MMM yyyy', { locale: es })}</span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="xs" onClick={() => handlePreview(study)}>
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Ver
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => handleDownload(study)}>
                    <Download className="h-3.5 w-3.5 mr-1" />
                    Descargar
                  </Button>
                  <Button variant="outline" size="xs" onClick={() => setDeleteTarget(study)} className="text-destructive hover:text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={showUpload} onOpenChange={(open) => { if (!open) { resetForm(); setShowUpload(false); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Subir Estudio de Mercado</DialogTitle>
            <DialogDescription>Sube un PDF o PPT con el estudio de mercado.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Nombre del estudio" />
            </div>
            <div>
              <Label>Sector</Label>
              <SectorSelect value={sector} onChange={setSector} placeholder="Selecciona sector (opcional)" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción breve" rows={2} />
            </div>
            <div>
              <Label>Archivo PDF *</Label>
              <Input
                type="file"
                accept=".pdf,.ppt,.pptx"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
              {file && <p className="text-xs text-muted-foreground mt-1">{file.name} — {formatFileSize(file.size)}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowUpload(false); }}>Cancelar</Button>
            <Button onClick={handleUpload} disabled={!title.trim() || !file || uploadStudy.isPending}>
              {uploadStudy.isPending ? 'Subiendo...' : 'Subir'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar estudio?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará "{deleteTarget?.title}" permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { if (deleteTarget) { deleteStudy.mutate(deleteTarget); setDeleteTarget(null); } }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
