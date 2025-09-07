import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, Download, FileText, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminMarketReports, useCreateMarketReport, useUpdateMarketReport, useDeleteMarketReport, type MarketReport } from '@/hooks/useMarketReports';

const CATEGORIES = [
  'Tecnología',
  'Retail',
  'Energía',
  'Salud',
  'Finanzas',
  'Manufactura',
  'Servicios',
  'General'
];

export const MarketReportsManager: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<MarketReport | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'General',
    pages: 1,
    file_url: '',
    cover_image_url: '',
    last_updated: new Date().toISOString().split('T')[0],
    is_active: true
  });

  const { toast } = useToast();
  const { data: reports, isLoading } = useAdminMarketReports();
  const createReport = useCreateMarketReport();
  const updateReport = useUpdateMarketReport();
  const deleteReport = useDeleteMarketReport();

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'General',
      pages: 1,
      file_url: '',
      cover_image_url: '',
      last_updated: new Date().toISOString().split('T')[0],
      is_active: true
    });
    setEditingReport(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingReport) {
        await updateReport.mutateAsync({ id: editingReport.id, ...formData });
        toast({ title: "Informe actualizado correctamente" });
      } else {
        await createReport.mutateAsync(formData);
        toast({ title: "Informe creado correctamente" });
      }
      
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el informe",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (report: MarketReport) => {
    setEditingReport(report);
    setFormData({
      title: report.title,
      description: report.description || '',
      category: report.category,
      pages: report.pages,
      file_url: report.file_url || '',
      cover_image_url: report.cover_image_url || '',
      last_updated: report.last_updated,
      is_active: report.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este informe?')) {
      try {
        await deleteReport.mutateAsync(id);
        toast({ title: "Informe eliminado correctamente" });
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudo eliminar el informe",
          variant: "destructive"
        });
      }
    }
  };

  const totalReports = reports?.length || 0;
  const activeReports = reports?.filter(r => r.is_active).length || 0;
  const totalDownloads = reports?.reduce((sum, r) => sum + r.download_count, 0) || 0;

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Cargando informes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with metrics */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Gestión de Informes de Mercado</h2>
          <p className="text-slate-600 mt-1">Administra los informes de mercado disponibles para descarga</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Informe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingReport ? 'Editar' : 'Crear'} Informe de Mercado</DialogTitle>
              <DialogDescription>
                {editingReport ? 'Modifica los datos del informe' : 'Añade un nuevo informe de mercado'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pages">Páginas</Label>
                  <Input
                    id="pages"
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({...formData, pages: parseInt(e.target.value) || 1})}
                    min="1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_updated">Última actualización</Label>
                  <Input
                    id="last_updated"
                    type="date"
                    value={formData.last_updated}
                    onChange={(e) => setFormData({...formData, last_updated: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="file_url">URL del archivo PDF</Label>
                <Input
                  id="file_url"
                  value={formData.file_url}
                  onChange={(e) => setFormData({...formData, file_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cover_image_url">URL imagen de portada</Label>
                <Input
                  id="cover_image_url"
                  value={formData.cover_image_url}
                  onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                />
                <Label htmlFor="is_active">Activo</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingReport ? 'Actualizar' : 'Crear'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Informes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Informes Activos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReports}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Descargas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads}</div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Informes</CardTitle>
          <CardDescription>
            Gestiona todos los informes de mercado disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Páginas</TableHead>
                <TableHead>Descargas</TableHead>
                <TableHead>Última actualización</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports?.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{report.category}</Badge>
                  </TableCell>
                  <TableCell>{report.pages}</TableCell>
                  <TableCell>{report.download_count}</TableCell>
                  <TableCell>{new Date(report.last_updated).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>
                    <Badge variant={report.is_active ? "default" : "secondary"}>
                      {report.is_active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(report)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(report.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {report.file_url && (
                        <Button size="sm" variant="outline" asChild>
                          <a href={report.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {reports?.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No hay informes disponibles
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};