import React, { useState } from 'react';
import { Plus, Search, Download, Users, TrendingUp, ImagePlus, Loader2, MoreVertical, Pencil, Trash2, Eye, EyeOff, Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLeadMagnets } from '@/hooks/useLeadMagnets';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LeadMagnetFormDialog from './lead-magnets/LeadMagnetFormDialog';
import type { LeadMagnet } from '@/types/leadMagnets';

const LeadMagnetsManager = () => {
  const { leadMagnets, isLoading, error, toggleStatus, deleteLeadMagnet } = useLeadMagnets();
  const [searchTerm, setSearchTerm] = useState('');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMagnet, setEditingMagnet] = useState<LeadMagnet | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LeadMagnet | null>(null);
  const [downloadsPage, setDownloadsPage] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const DOWNLOADS_PER_PAGE = 20;

  // Fetch recent downloads
  const { data: downloadsData } = useQuery({
    queryKey: ['lead_magnet_downloads', downloadsPage],
    queryFn: async () => {
      const from = downloadsPage * DOWNLOADS_PER_PAGE;
      const to = from + DOWNLOADS_PER_PAGE - 1;

      const { data, error, count } = await supabase
        .from('lead_magnet_downloads')
        .select('id, user_email, user_name, user_company, user_phone, created_at, lead_magnet_id', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { downloads: data || [], total: count || 0 };
    }
  });

  const downloads = downloadsData?.downloads || [];
  const totalDownloads = downloadsData?.total || 0;
  const totalPages = Math.ceil(totalDownloads / DOWNLOADS_PER_PAGE);

  // Map lead magnet IDs to titles
  const getMagnetTitle = (id: string) => {
    const magnet = leadMagnets.find(m => m.id === id);
    return magnet?.title || id.substring(0, 8) + '...';
  };

  const filteredLeadMagnets = leadMagnets.filter(magnet =>
    magnet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    magnet.sector.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerateImage = async (magnetId: string) => {
    setGeneratingId(magnetId);
    try {
      const { data, error } = await supabase.functions.invoke('generate-resource-image', {
        body: { lead_magnet_id: magnetId },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: 'Imagen generada', description: 'La portada se ha generado y guardado correctamente.' });
      queryClient.invalidateQueries({ queryKey: ['lead_magnets'] });
    } catch (err) {
      toast({ title: 'Error', description: err instanceof Error ? err.message : 'No se pudo generar la imagen', variant: 'destructive' });
    } finally {
      setGeneratingId(null);
    }
  };

  const handleEdit = (magnet: LeadMagnet) => {
    setEditingMagnet(magnet);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setEditingMagnet(null);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteLeadMagnet.mutateAsync(deleteTarget.id);
      toast({ title: 'Recurso eliminado' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
    setDeleteTarget(null);
  };

  const handleToggleStatus = async (magnet: LeadMagnet, newStatus: 'active' | 'draft' | 'archived') => {
    try {
      await toggleStatus.mutateAsync({ id: magnet.id, status: newStatus });
      toast({ title: `Estado cambiado a ${newStatus}` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo cambiar el estado', variant: 'destructive' });
    }
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      report: 'bg-blue-100 text-blue-800',
      whitepaper: 'bg-purple-100 text-purple-800',
      checklist: 'bg-green-100 text-green-800',
      template: 'bg-orange-100 text-orange-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando recursos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <p className="text-destructive mb-2">Error al cargar recursos</p>
          <p className="text-muted-foreground text-sm">{String(error)}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Recursos</h1>
          <p className="text-muted-foreground">Gestiona recursos descargables para capturar leads</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Recurso
        </Button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input placeholder="Buscar recursos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recursos</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadMagnets.length}</div>
            <p className="text-xs text-muted-foreground">recursos disponibles</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Descargas Totales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadMagnets.reduce((s, m) => s + m.download_count, 0)}</div>
            <p className="text-xs text-muted-foreground">descargas registradas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversiones</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leadMagnets.reduce((s, m) => s + m.lead_conversion_count, 0)}</div>
            <p className="text-xs text-muted-foreground">leads generados</p>
          </CardContent>
        </Card>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLeadMagnets.map((magnet) => (
          <Card key={magnet.id} className="hover:shadow-md transition-shadow overflow-hidden group">
            {magnet.featured_image_url ? (
              <div className="aspect-video w-full overflow-hidden relative">
                <img src={magnet.featured_image_url} alt={magnet.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <CardActions magnet={magnet} onEdit={handleEdit} onDelete={setDeleteTarget} onToggle={handleToggleStatus} onRegenImage={handleGenerateImage} generatingId={generatingId} />
                </div>
              </div>
            ) : (
              <div className="aspect-video w-full bg-muted flex flex-col items-center justify-center gap-2 relative">
                <Download className="h-8 w-8 text-muted-foreground" />
                <Button size="sm" variant="outline" onClick={() => handleGenerateImage(magnet.id)} disabled={generatingId === magnet.id}>
                  {generatingId === magnet.id ? <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Generando...</> : <><ImagePlus className="h-3 w-3 mr-1" />Generar imagen con IA</>}
                </Button>
                <div className="absolute top-2 right-2">
                  <CardActions magnet={magnet} onEdit={handleEdit} onDelete={setDeleteTarget} onToggle={handleToggleStatus} onRegenImage={handleGenerateImage} generatingId={generatingId} />
                </div>
              </div>
            )}
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">{magnet.title}</CardTitle>
                  <CardDescription>{magnet.sector}</CardDescription>
                </div>
                <div className="flex flex-col gap-1 ml-2 shrink-0">
                  <Badge className={getTypeColor(magnet.type)}>{magnet.type}</Badge>
                  <Badge className={getStatusColor(magnet.status)}>{magnet.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{magnet.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Descargas:</span>
                  <div className="text-lg font-bold">{magnet.download_count}</div>
                </div>
                <div>
                  <span className="font-medium">Conversiones:</span>
                  <div className="text-lg font-bold">{magnet.lead_conversion_count}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLeadMagnets.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay recursos</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'No se encontraron resultados.' : 'Aún no has creado ningún recurso.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleNew}>
                <Plus className="h-4 w-4 mr-2" />
                Crear tu primer recurso
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Downloads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Descargas Recientes
          </CardTitle>
          <CardDescription>
            {totalDownloads} descarga{totalDownloads !== 1 ? 's' : ''} registrada{totalDownloads !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {downloads.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recurso</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Fecha</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {downloads.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {getMagnetTitle(d.lead_magnet_id)}
                      </TableCell>
                      <TableCell>{d.user_name || '-'}</TableCell>
                      <TableCell>
                        <a href={`mailto:${d.user_email}`} className="text-primary hover:underline">
                          {d.user_email}
                        </a>
                      </TableCell>
                      <TableCell>{d.user_company || '-'}</TableCell>
                      <TableCell>{d.user_phone || '-'}</TableCell>
                      <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                        {new Date(d.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Página {downloadsPage + 1} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" disabled={downloadsPage === 0} onClick={() => setDownloadsPage(p => p - 1)}>
                      Anterior
                    </Button>
                    <Button size="sm" variant="outline" disabled={downloadsPage >= totalPages - 1} onClick={() => setDownloadsPage(p => p + 1)}>
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-muted-foreground py-8">No hay descargas registradas aún.</p>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <LeadMagnetFormDialog open={dialogOpen} onOpenChange={setDialogOpen} editingMagnet={editingMagnet} />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar recurso?</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará permanentemente "{deleteTarget?.title}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Dropdown actions per card
const CardActions: React.FC<{
  magnet: LeadMagnet;
  onEdit: (m: LeadMagnet) => void;
  onDelete: (m: LeadMagnet) => void;
  onToggle: (m: LeadMagnet, s: 'active' | 'draft' | 'archived') => void;
  onRegenImage: (id: string) => void;
  generatingId: string | null;
}> = ({ magnet, onEdit, onDelete, onToggle, onRegenImage, generatingId }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="secondary" size="icon" className="h-8 w-8">
        <MoreVertical className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem onClick={() => onEdit(magnet)}>
        <Pencil className="h-4 w-4 mr-2" />Editar
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      {magnet.status !== 'active' && (
        <DropdownMenuItem onClick={() => onToggle(magnet, 'active')}>
          <Eye className="h-4 w-4 mr-2" />Activar
        </DropdownMenuItem>
      )}
      {magnet.status !== 'draft' && (
        <DropdownMenuItem onClick={() => onToggle(magnet, 'draft')}>
          <EyeOff className="h-4 w-4 mr-2" />Borrador
        </DropdownMenuItem>
      )}
      {magnet.status !== 'archived' && (
        <DropdownMenuItem onClick={() => onToggle(magnet, 'archived')}>
          <Archive className="h-4 w-4 mr-2" />Archivar
        </DropdownMenuItem>
      )}
      {magnet.featured_image_url && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onRegenImage(magnet.id)} disabled={generatingId === magnet.id}>
            <ImagePlus className="h-4 w-4 mr-2" />Regenerar imagen
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(magnet)}>
        <Trash2 className="h-4 w-4 mr-2" />Eliminar
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

export default LeadMagnetsManager;