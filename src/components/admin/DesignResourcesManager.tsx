import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, ExternalLink, Edit, Trash2, Image, Palette, FileText, Type, Layers, Star } from 'lucide-react';

interface DesignResource {
  id: string;
  title: string;
  description: string | null;
  url: string;
  category: string;
  thumbnail_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = {
  'style-guide': { label: 'Guías de Estilo', icon: Palette },
  'graphics': { label: 'Assets Gráficos', icon: Image },
  'templates': { label: 'Templates', icon: FileText },
  'fonts': { label: 'Tipografías', icon: Type },
  'icons': { label: 'Iconos', icon: Star },
  'components': { label: 'Componentes UI', icon: Layers },
  'other': { label: 'Otros', icon: FileText }
};

const DesignResourcesManager = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<DesignResource | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch design resources
  const { data: resources = [], isLoading } = useQuery({
    queryKey: ['design-resources'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('design_resources')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      return data as DesignResource[];
    }
  });

  // Create/Update mutation
  const createOrUpdateMutation = useMutation({
    mutationFn: async (resource: Partial<DesignResource>) => {
      if (editingResource) {
        const { error } = await supabase
          .from('design_resources')
          .update(resource)
          .eq('id', editingResource.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('design_resources')
          .insert([resource as any]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-resources'] });
      setIsDialogOpen(false);
      setEditingResource(null);
      toast.success(editingResource ? 'Recurso actualizado' : 'Recurso creado');
    },
    onError: (error) => {
      toast.error('Error al guardar: ' + error.message);
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('design_resources')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-resources'] });
      toast.success('Recurso eliminado');
    },
    onError: (error) => {
      toast.error('Error al eliminar: ' + error.message);
    }
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('design_resources')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-resources'] });
    }
  });

  const filteredResources = resources.filter(resource => 
    filterCategory === 'all' || resource.category === filterCategory
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const resource = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      url: formData.get('url') as string,
      category: formData.get('category') as string,
      thumbnail_url: formData.get('thumbnail_url') as string || null,
      display_order: parseInt(formData.get('display_order') as string) || 0,
      is_active: formData.get('is_active') === 'on'
    };

    createOrUpdateMutation.mutate(resource);
  };

  const getCategoryIcon = (category: string) => {
    const CategoryIcon = CATEGORIES[category as keyof typeof CATEGORIES]?.icon || FileText;
    return <CategoryIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Recursos de Diseño</h1>
          <p className="text-muted-foreground">
            Gestiona enlaces a materiales y assets de diseño para la página web
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingResource(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Recurso
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingResource ? 'Editar Recurso' : 'Nuevo Recurso de Diseño'}
              </DialogTitle>
              <DialogDescription>
                Agrega un nuevo enlace a recursos de diseño o material web
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={editingResource?.title}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select name="category" defaultValue={editingResource?.category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CATEGORIES).map(([value, { label }]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="url">URL *</Label>
                <Input
                  id="url"
                  name="url"
                  type="url"
                  defaultValue={editingResource?.url}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={editingResource?.description || ''}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="thumbnail_url">URL de Miniatura</Label>
                  <Input
                    id="thumbnail_url"
                    name="thumbnail_url"
                    type="url"
                    defaultValue={editingResource?.thumbnail_url || ''}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="display_order">Orden de Visualización</Label>
                  <Input
                    id="display_order"
                    name="display_order"
                    type="number"
                    defaultValue={editingResource?.display_order || 0}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  name="is_active"
                  defaultChecked={editingResource?.is_active ?? true}
                />
                <Label htmlFor="is_active">Recurso activo</Label>
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={createOrUpdateMutation.isPending}>
                  {createOrUpdateMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {Object.entries(CATEGORIES).map(([value, { label }]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recursos de Diseño ({filteredResources.length})</CardTitle>
          <CardDescription>
            Enlaces a materiales y assets utilizados en el diseño web
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Cargando recursos...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredResources.map((resource) => (
                  <TableRow key={resource.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-primary hover:underline flex items-center gap-1"
                          >
                            {resource.title}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                        {resource.description && (
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(resource.category)}
                        <span className="text-sm">
                          {CATEGORIES[resource.category as keyof typeof CATEGORIES]?.label}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={resource.is_active}
                          onCheckedChange={(checked) =>
                            toggleActiveMutation.mutate({
                              id: resource.id,
                              is_active: checked
                            })
                          }
                        />
                        <Badge variant={resource.is_active ? 'default' : 'secondary'}>
                          {resource.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{resource.display_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingResource(resource);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(resource.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredResources.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No hay recursos de diseño disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DesignResourcesManager;