import React, { useState } from 'react';
import { FileText, Plus, Edit, Copy, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useJobTemplates, type JobTemplate } from '@/hooks/useJobTemplates';

const CATEGORIES = [
  { value: 'all', label: 'Todas las categorías' },
  { value: 'tecnologia', label: 'Tecnología' },
  { value: 'finanzas', label: 'Finanzas' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'ventas', label: 'Ventas' },
  { value: 'gestion', label: 'Gestión' },
];

export const JobTemplatesManager = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTemplate, setEditingTemplate] = useState<JobTemplate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTemplateId, setDeleteTemplateId] = useState<string | null>(null);

  const filters = selectedCategory !== 'all' ? { category: selectedCategory } : undefined;
  const { templates, isLoading, createTemplate, updateTemplate, deleteTemplate } = useJobTemplates(filters);

  const filteredTemplates = templates?.filter(template =>
    searchQuery === '' ||
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveTemplate = async (formData: FormData) => {
    const templateData: Partial<JobTemplate> = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      title_template: formData.get('title_template') as string,
      short_description_template: formData.get('short_description_template') as string,
      description_template: formData.get('description_template') as string,
      default_location: formData.get('default_location') as string,
      default_sector: formData.get('default_sector') as string,
    };

    try {
      if (editingTemplate) {
        await updateTemplate({ id: editingTemplate.id, updates: templateData });
      } else {
        await createTemplate(templateData);
      }
      setIsDialogOpen(false);
      setEditingTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDuplicate = async (template: JobTemplate) => {
    const duplicateData: Partial<JobTemplate> = {
      ...template,
      id: undefined,
      name: `${template.name} (Copia)`,
      times_used: 0,
      created_at: undefined,
      updated_at: undefined,
    };
    
    try {
      await createTemplate(duplicateData);
    } catch (error) {
      console.error('Error duplicating template:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteTemplateId) return;
    try {
      await deleteTemplate(deleteTemplateId);
      setDeleteTemplateId(null);
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  if (isLoading) {
    return <div className="p-8">Cargando plantillas...</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Plantillas de Ofertas de Trabajo</h1>
        <p className="text-muted-foreground">
          Gestiona plantillas reutilizables para crear ofertas de trabajo más rápido
        </p>
      </div>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input
            placeholder="Buscar plantillas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-64">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTemplate(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Plantilla
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
              </DialogTitle>
              <DialogDescription>
                {editingTemplate ? 'Modifica los datos de la plantilla' : 'Crea una nueva plantilla reutilizable'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleSaveTemplate(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nombre de la plantilla *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingTemplate?.name}
                    required
                    placeholder="Ej: Desarrollador Full Stack Senior"
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={editingTemplate?.description || ''}
                    placeholder="Breve descripción de cuándo usar esta plantilla"
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select name="category" defaultValue={editingTemplate?.category || 'tecnologia'}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter(c => c.value !== 'all').map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="default_sector">Sector</Label>
                  <Input
                    id="default_sector"
                    name="default_sector"
                    defaultValue={editingTemplate?.default_sector || ''}
                    placeholder="Ej: Tecnología"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="title_template">Título de ejemplo</Label>
                <Input
                  id="title_template"
                  name="title_template"
                  defaultValue={editingTemplate?.title_template || ''}
                  placeholder="Título típico para este tipo de oferta"
                />
              </div>

              <div>
                <Label htmlFor="short_description_template">Descripción corta de ejemplo</Label>
                <Textarea
                  id="short_description_template"
                  name="short_description_template"
                  defaultValue={editingTemplate?.short_description_template || ''}
                  placeholder="Descripción corta típica"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="description_template">Descripción completa de ejemplo</Label>
                <Textarea
                  id="description_template"
                  name="description_template"
                  defaultValue={editingTemplate?.description_template || ''}
                  placeholder="Descripción detallada típica"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="default_location">Ubicación por defecto</Label>
                <Input
                  id="default_location"
                  name="default_location"
                  defaultValue={editingTemplate?.default_location || ''}
                  placeholder="Ej: Madrid, España"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingTemplate ? 'Actualizar' : 'Crear'} Plantilla
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Grid de plantillas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates?.map((template) => (
          <Card key={template.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary">{template.category}</Badge>
                    <Badge variant="outline">{template.times_used || 0} usos</Badge>
                  </div>
                </div>
              </div>
              {template.description && (
                <CardDescription className="mt-2">
                  {template.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-end">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingTemplate(template);
                    setIsDialogOpen(true);
                  }}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDuplicate(template)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  Duplicar
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteTemplateId(template.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates?.length === 0 && (
        <Card className="p-12 text-center">
          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No hay plantillas</h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery ? 'No se encontraron plantillas con ese criterio' : 'Crea tu primera plantilla para empezar'}
          </p>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Plantilla
          </Button>
        </Card>
      )}

      {/* Diálogo de confirmación de eliminación */}
      <AlertDialog open={!!deleteTemplateId} onOpenChange={(open) => !open && setDeleteTemplateId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar plantilla?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La plantilla se desactivará pero sus datos se conservarán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
