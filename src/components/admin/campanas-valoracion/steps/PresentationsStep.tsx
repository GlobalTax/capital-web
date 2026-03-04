import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Upload, Sparkles, Check, AlertCircle, Trash2, FileText } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCampaignPresentations } from '@/hooks/useCampaignPresentations';
import { useCampaignCompanies } from '@/hooks/useCampaignCompanies';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PresentationsStepProps {
  campaignId: string;
}

export function PresentationsStep({ campaignId }: PresentationsStepProps) {
  const {
    presentations, isLoading, uploadFiles, isUploading, uploadProgress,
    assignCompany, autoMatch, isMatching, matchProgress, deletePresentation,
  } = useCampaignPresentations(campaignId);
  const { companies } = useCampaignCompanies(campaignId);
  const [manualAssignments, setManualAssignments] = useState<Record<string, string>>({});
  const [editingAssignment, setEditingAssignment] = useState<Record<string, boolean>>({});

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      toast({ title: 'Solo se aceptan archivos en formato PDF', variant: 'destructive' });
    }
    if (acceptedFiles.length > 0) {
      await uploadFiles(acceptedFiles);
    }
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    multiple: true,
  });

  const handleAutoMatch = async () => {
    const candidates = companies.map(c => ({ id: c.id, company_name: c.client_company || '' }));
    await autoMatch(candidates);
  };

  const handleManualAssign = async (presentationId: string) => {
    const companyId = manualAssignments[presentationId];
    if (!companyId) return;
    await assignCompany({ presentationId, companyId });
    setManualAssignments(prev => { const next = { ...prev }; delete next[presentationId]; return next; });
    setEditingAssignment(prev => { const next = { ...prev }; delete next[presentationId]; return next; });
  };

  const assigned = presentations.filter(p => p.status === 'assigned').length;
  const unassigned = presentations.filter(p => p.status === 'unassigned').length;

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return null;
    const c = companies.find(co => co.id === companyId);
    return c?.client_company || 'Desconocida';
  };

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-32" /><Skeleton className="h-64" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-sm"><span className="font-semibold">{presentations.length}</span> archivos subidos</div>
        <Badge variant="default" className="bg-green-600">{assigned} asignadas</Badge>
        <Badge variant="secondary" className="bg-yellow-500 text-white">{unassigned} sin asignar</Badge>
        <div className="flex-1" />
        <Button variant="outline" onClick={handleAutoMatch} disabled={isMatching || unassigned === 0} size="sm">
          <Sparkles className="h-4 w-4 mr-2" />
          {isMatching ? 'Asignando...' : 'Asignar con IA'}
        </Button>
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
          <div className="flex justify-between text-sm">
            <span>Subiendo {uploadProgress.current}/{uploadProgress.total}...</span>
            <span className="text-muted-foreground truncate max-w-[200px]">{uploadProgress.currentFile}</span>
          </div>
          <Progress value={(uploadProgress.current / uploadProgress.total) * 100} className="h-2" />
        </div>
      )}

      {/* Match progress */}
      {matchProgress && (
        <div className="space-y-2 p-4 border rounded-lg bg-muted/30">
          <div className="flex justify-between text-sm">
            <span>Procesando {matchProgress.current}/{matchProgress.total}...</span>
            <span className="text-muted-foreground truncate max-w-[200px]">{matchProgress.currentFile}</span>
          </div>
          <Progress value={(matchProgress.current / matchProgress.total) * 100} className="h-2" />
        </div>
      )}

      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
        {isDragActive ? (
          <p className="text-sm text-primary font-medium">Suelta los PDFs aquí</p>
        ) : (
          <div>
            <p className="text-sm font-medium">Arrastra PDFs aquí o haz clic para seleccionar</p>
            <p className="text-xs text-muted-foreground mt-1">Solo archivos .pdf · Formato: NNN_NOMBRE_EMPRESA.pdf</p>
          </div>
        )}
      </div>

      {/* Table */}
      {presentations.length > 0 && (
        <div className="border rounded-lg overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">#</TableHead>
                <TableHead>Nombre archivo</TableHead>
                <TableHead>Fecha subida</TableHead>
                <TableHead>Empresa asignada</TableHead>
                <TableHead className="text-center">Confianza</TableHead>
                <TableHead className="text-center">Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {presentations.map((pres, idx) => {
                const isEditing = editingAssignment[pres.id];
                const showDropdown = pres.status === 'unassigned' || isEditing;

                return (
                  <TableRow key={pres.id}>
                    <TableCell className="text-muted-foreground text-xs">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-red-500 shrink-0" />
                        <span className="text-sm truncate max-w-[200px]">{pres.file_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {pres.created_at ? format(new Date(pres.created_at), 'dd MMM yyyy HH:mm', { locale: es }) : '—'}
                    </TableCell>
                    <TableCell>
                      {showDropdown ? (
                        <div className="flex items-center gap-2">
                          <Select
                            value={manualAssignments[pres.id] || (isEditing && pres.company_id ? pres.company_id : '')}
                            onValueChange={(val) => setManualAssignments(prev => ({ ...prev, [pres.id]: val }))}
                          >
                            <SelectTrigger className="h-8 w-[200px] text-xs">
                              <SelectValue placeholder="Seleccionar empresa" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.client_company}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleManualAssign(pres.id)} disabled={!manualAssignments[pres.id]}>
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{getCompanyName(pres.company_id)}</span>
                          <Button size="sm" variant="ghost" className="h-6 text-xs text-muted-foreground" onClick={() => setEditingAssignment(prev => ({ ...prev, [pres.id]: true }))}>
                            Cambiar
                          </Button>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {pres.status === 'assigned' ? (
                        <span className="text-xs text-muted-foreground">
                          {pres.assigned_manually ? 'Manual' : `${Math.round((pres.match_confidence || 0) * 100)}%`}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {pres.status === 'assigned' && !pres.assigned_manually && (
                        <Badge variant="default" className="bg-green-600 text-xs">Asignado IA</Badge>
                      )}
                      {pres.status === 'assigned' && pres.assigned_manually && (
                        <Badge className="bg-blue-600 text-white text-xs">Asignado manual</Badge>
                      )}
                      {pres.status === 'unassigned' && (
                        <Badge variant="secondary" className="bg-yellow-500 text-white text-xs">Sin asignar</Badge>
                      )}
                      {pres.status === 'error' && (
                        <Badge variant="destructive" className="text-xs"><AlertCircle className="h-3 w-3 mr-1" />Error</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Se eliminará "{pres.file_name}" de Storage y de la base de datos. Esta acción no se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deletePresentation(pres.id)}>Eliminar</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
