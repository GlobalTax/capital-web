import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Grid, Plus, Settings, Save, LayoutDashboard, Share2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePersonalizedDashboard } from '@/hooks/usePersonalizedDashboard';
import { WidgetFactory, BaseWidget } from './widgets/WidgetFactory';
import { WidgetSelector } from './WidgetSelector';

export function PersonalizableDashboard() {
  const { toast } = useToast();
  const {
    layouts,
    activeLayout,
    activeLayoutId,
    setActiveLayoutId,
    customWidgets,
    isLoading,
    saveLayout,
    deleteLayout
  } = usePersonalizedDashboard();

  const [isEditing, setIsEditing] = useState(false);
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [showNewLayoutDialog, setShowNewLayoutDialog] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [localLayout, setLocalLayout] = useState(activeLayout);

  // Sincronizar layout local con el activo
  useEffect(() => {
    if (activeLayout) {
      setLocalLayout(activeLayout);
    }
  }, [activeLayout]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination || !localLayout) return;

    const newWidgets = Array.from(localLayout.widgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    setLocalLayout(prev => prev ? { ...prev, widgets: newWidgets } : null);
  }, [localLayout]);

  const handleSaveLayout = useCallback(async () => {
    if (!localLayout) return;

    const result = await saveLayout(localLayout);
    if (result.success) {
      setIsEditing(false);
    }
  }, [localLayout, saveLayout]);

  const addWidget = useCallback((widget: BaseWidget) => {
    if (!localLayout) return;
    
    setLocalLayout(prev => prev ? ({
      ...prev,
      widgets: [...prev.widgets, { ...widget, id: `widget-${Date.now()}` }]
    }) : null);
    setShowWidgetSelector(false);
  }, [localLayout]);

  const removeWidget = useCallback((widgetId: string) => {
    if (!localLayout) return;
    
    setLocalLayout(prev => prev ? ({
      ...prev,
      widgets: prev.widgets.filter(w => w.id !== widgetId)
    }) : null);
  }, [localLayout]);

  const editWidget = useCallback((widget: BaseWidget) => {
    // Implementar lógica de edición de widget
    console.log('Edit widget:', widget);
  }, []);

  const createNewLayout = useCallback(async () => {
    if (!newLayoutName.trim()) return;

    const newLayout = {
      id: 'new',
      name: newLayoutName,
      widgets: [],
      columns: 3
    };

    const result = await saveLayout(newLayout);
    if (result.success) {
      setNewLayoutName('');
      setShowNewLayoutDialog(false);
      setActiveLayoutId(result.data.id);
    }
  }, [newLayoutName, saveLayout, setActiveLayoutId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
          <p className="text-muted-foreground mt-2">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!localLayout) {
    return (
      <div className="text-center py-12">
        <LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-medium mt-4">No hay layouts disponibles</h3>
        <p className="text-muted-foreground">Crea tu primer layout personalizado</p>
        <Button 
          onClick={() => setShowNewLayoutDialog(true)}
          className="mt-4"
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Layout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header del Dashboard */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Grid className="h-5 w-5" />
            <h2 className="text-xl font-semibold">{localLayout.name}</h2>
          </div>
          
          {/* Selector de Layout */}
          <Select value={activeLayoutId} onValueChange={setActiveLayoutId}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Seleccionar layout" />
            </SelectTrigger>
            <SelectContent>
              {layouts.map((layout) => (
                <SelectItem key={layout.id} value={layout.id}>
                  {layout.name} {layout.isDefault && '(Por defecto)'}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          {/* Botones para modo edición */}
          {isEditing && (
            <>
              <Button variant="outline" onClick={() => setShowWidgetSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Widget
              </Button>
              <Button onClick={handleSaveLayout}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Layout
              </Button>
            </>
          )}
          
          {/* Botón para crear nuevo layout */}
          <Dialog open={showNewLayoutDialog} onOpenChange={setShowNewLayoutDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Nuevo Layout
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear Nuevo Layout</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="layout-name">Nombre del Layout</Label>
                  <Input
                    id="layout-name"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                    placeholder="Mi nuevo dashboard..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={createNewLayout} disabled={!newLayoutName.trim()}>
                    Crear Layout
                  </Button>
                  <Button variant="outline" onClick={() => setShowNewLayoutDialog(false)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          {/* Botón para personalizar */}
          <Button 
            variant={isEditing ? "secondary" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? 'Finalizar' : 'Personalizar'}
          </Button>
        </div>
      </div>

      {/* Dashboard Grid */}
      {isEditing ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid grid-cols-${localLayout.columns} gap-4`}
              >
                {localLayout.widgets.map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <WidgetFactory
                          widget={widget}
                          isEditing={isEditing}
                          onEdit={editWidget}
                          onDelete={removeWidget}
                          isDragging={snapshot.isDragging}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className={`grid grid-cols-${localLayout.columns} gap-4`}>
          {localLayout.widgets.map((widget) => (
            <WidgetFactory
              key={widget.id}
              widget={widget}
              isEditing={false}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <WidgetSelector
        open={showWidgetSelector}
        onOpenChange={setShowWidgetSelector}
        onSelectWidget={addWidget}
        customWidgets={customWidgets}
      />
    </div>
  );
}