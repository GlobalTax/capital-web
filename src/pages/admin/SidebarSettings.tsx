import React, { useState } from 'react';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import { icons, LucideIcon, GripVertical, Plus, Pencil, Trash2, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { cn } from '@/lib/utils';
import { useSidebarConfig } from '@/hooks/useSidebarConfig';
import { useSidebarAdmin } from '@/hooks/useSidebarAdmin';
import { SidebarPreview } from '@/components/admin/sidebar-settings/SidebarPreview';
import { SectionDialog } from '@/components/admin/sidebar-settings/SectionDialog';
import { ItemDialog } from '@/components/admin/sidebar-settings/ItemDialog';
import { 
  SidebarSection, 
  SidebarItem, 
  SidebarSectionFormData, 
  SidebarItemFormData 
} from '@/types/sidebar-config';

const SidebarSettings: React.FC = () => {
  const { sections, isLoading, isError } = useSidebarConfig();
  const { 
    createSection, updateSection, deleteSection, reorderSections,
    createItem, updateItem, deleteItem, reorderItems 
  } = useSidebarAdmin();

  // UI State
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SidebarSection | null>(null);
  const [editingItem, setEditingItem] = useState<SidebarItem | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'section' | 'item'; id: string; title: string } | null>(null);

  const selectedSection = sections.find(s => s.id === selectedSectionId);

  // Handlers
  const handleSectionDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const reordered = Array.from(sections);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updates = reordered.map((section, index) => ({
      id: section.id,
      position: index
    }));

    reorderSections.mutate(updates);
  };

  const handleItemDragEnd = (result: DropResult) => {
    if (!result.destination || !selectedSection) return;

    const reordered = Array.from(selectedSection.items);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const updates = reordered.map((item, index) => ({
      id: item.id,
      position: index
    }));

    reorderItems.mutate(updates);
  };

  const handleSaveSection = (data: SidebarSectionFormData) => {
    if (editingSection) {
      updateSection.mutate({ id: editingSection.id, data }, {
        onSuccess: () => {
          setSectionDialogOpen(false);
          setEditingSection(null);
        }
      });
    } else {
      createSection.mutate({ ...data, position: sections.length }, {
        onSuccess: () => {
          setSectionDialogOpen(false);
        }
      });
    }
  };

  const handleSaveItem = (data: SidebarItemFormData) => {
    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, data }, {
        onSuccess: () => {
          setItemDialogOpen(false);
          setEditingItem(null);
        }
      });
    } else if (selectedSectionId) {
      createItem.mutate({ 
        ...data, 
        section_id: selectedSectionId, 
        position: selectedSection?.items.length || 0 
      }, {
        onSuccess: () => {
          setItemDialogOpen(false);
        }
      });
    }
  };

  const handleDelete = () => {
    if (!deleteConfirm) return;
    
    if (deleteConfirm.type === 'section') {
      deleteSection.mutate(deleteConfirm.id, {
        onSuccess: () => {
          setDeleteConfirm(null);
          if (selectedSectionId === deleteConfirm.id) {
            setSelectedSectionId(null);
          }
        }
      });
    } else {
      deleteItem.mutate(deleteConfirm.id, {
        onSuccess: () => setDeleteConfirm(null)
      });
    }
  };

  const openEditSection = (section: SidebarSection) => {
    setEditingSection(section);
    setSectionDialogOpen(true);
  };

  const openEditItem = (item: SidebarItem) => {
    setEditingItem(item);
    setItemDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-destructive">Error al cargar la configuración</p>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Configuración del Sidebar</h1>
        <p className="text-muted-foreground">
          Gestiona las secciones e items del menú de navegación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
        {/* Main content */}
        <div className="space-y-6">
          {/* Sections list */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg">Secciones</CardTitle>
                <CardDescription>Arrastra para reordenar</CardDescription>
              </div>
              <Button 
                size="sm" 
                onClick={() => {
                  setEditingSection(null);
                  setSectionDialogOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Nueva Sección
              </Button>
            </CardHeader>
            <CardContent>
              <DragDropContext onDragEnd={handleSectionDragEnd}>
                <Droppable droppableId="sections">
                  {(provided) => (
                    <div 
                      ref={provided.innerRef} 
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {sections.map((section, index) => (
                        <Draggable key={section.id} draggableId={section.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                                snapshot.isDragging && 'bg-accent shadow-lg',
                                selectedSectionId === section.id && 'border-primary bg-primary/5',
                                !section.is_active && 'opacity-50'
                              )}
                            >
                              <div {...provided.dragHandleProps}>
                                <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                              </div>
                              
                              <button
                                onClick={() => setSelectedSectionId(section.id)}
                                className="flex-1 flex items-center gap-2 text-left"
                              >
                                <span className="text-lg">{section.emoji}</span>
                                <span className="font-medium">{section.title.replace(/^[^\s]+\s/, '')}</span>
                                <Badge variant="secondary" className="ml-auto">
                                  {section.items?.length || 0} items
                                </Badge>
                              </button>

                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => openEditSection(section)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                  onClick={() => setDeleteConfirm({ 
                                    type: 'section', 
                                    id: section.id, 
                                    title: section.title 
                                  })}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
            </CardContent>
          </Card>

          {/* Items list */}
          {selectedSection && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                  <CardTitle className="text-lg">
                    Items de "{selectedSection.title}"
                  </CardTitle>
                  <CardDescription>Arrastra para reordenar</CardDescription>
                </div>
                <Button 
                  size="sm" 
                  onClick={() => {
                    setEditingItem(null);
                    setItemDialogOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Item
                </Button>
              </CardHeader>
              <CardContent>
                <DragDropContext onDragEnd={handleItemDragEnd}>
                  <Droppable droppableId="items">
                    {(provided) => (
                      <div 
                        ref={provided.innerRef} 
                        {...provided.droppableProps}
                        className="space-y-2"
                      >
                        {selectedSection.items.map((item, index) => {
                          const Icon = icons[item.icon as keyof typeof icons] as LucideIcon;
                          return (
                            <Draggable key={item.id} draggableId={item.id} index={index}>
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg border transition-colors',
                                    snapshot.isDragging && 'bg-accent shadow-lg',
                                    !item.is_active && 'opacity-50'
                                  )}
                                >
                                  <div {...provided.dragHandleProps}>
                                    <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                                  </div>

                                  <div className="flex items-center gap-2 flex-1">
                                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                                    <span className="font-medium">{item.title}</span>
                                    {item.badge && (
                                      <Badge variant={
                                        item.badge === 'URGENTE' ? 'destructive' :
                                        item.badge === 'AI' ? 'default' : 'secondary'
                                      } className="text-xs">
                                        {item.badge}
                                      </Badge>
                                    )}
                                    <span className="text-xs text-muted-foreground ml-auto">
                                      {item.url}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => openEditItem(item)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteConfirm({ 
                                        type: 'item', 
                                        id: item.id, 
                                        title: item.title 
                                      })}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                        {selectedSection.items.length === 0 && (
                          <p className="text-center text-muted-foreground py-8">
                            No hay items en esta sección
                          </p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview sidebar */}
        <div className="hidden lg:block sticky top-6">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Vista previa</p>
            <SidebarPreview 
              sections={sections}
              selectedSectionId={selectedSectionId}
              onSelectSection={setSelectedSectionId}
            />
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SectionDialog
        open={sectionDialogOpen}
        onOpenChange={(open) => {
          setSectionDialogOpen(open);
          if (!open) setEditingSection(null);
        }}
        section={editingSection}
        onSave={handleSaveSection}
        isLoading={createSection.isPending || updateSection.isPending}
      />

      <ItemDialog
        open={itemDialogOpen}
        onOpenChange={(open) => {
          setItemDialogOpen(open);
          if (!open) setEditingItem(null);
        }}
        item={editingItem}
        onSave={handleSaveItem}
        isLoading={createItem.isPending || updateItem.isPending}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar {deleteConfirm?.type === 'section' ? 'sección' : 'item'}?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de eliminar "{deleteConfirm?.title}". 
              {deleteConfirm?.type === 'section' && ' Esto también eliminará todos sus items.'}
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SidebarSettings;
