import { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Grid, Plus, Settings, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface Widget {
  id: string;
  type: 'kpi' | 'chart' | 'table' | 'text';
  title: string;
  size: 'small' | 'medium' | 'large';
  config: Record<string, any>;
}

interface DashboardLayout {
  id: string;
  name: string;
  widgets: Widget[];
  columns: number;
}

export function PersonalizableDashboard() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [layout, setLayout] = useState<DashboardLayout>({
    id: 'default',
    name: 'Mi Dashboard',
    columns: 3,
    widgets: [
      {
        id: 'leads-total',
        type: 'kpi',
        title: 'Total Leads',
        size: 'small',
        config: { metric: 'total_leads', format: 'number' }
      },
      {
        id: 'conversion-rate',
        type: 'kpi', 
        title: 'Tasa Conversión',
        size: 'small',
        config: { metric: 'conversion_rate', format: 'percentage' }
      },
      {
        id: 'revenue-chart',
        type: 'chart',
        title: 'Ingresos Mensuales',
        size: 'large',
        config: { chartType: 'line', metric: 'revenue' }
      }
    ]
  });

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const newWidgets = Array.from(layout.widgets);
    const [reorderedWidget] = newWidgets.splice(result.source.index, 1);
    newWidgets.splice(result.destination.index, 0, reorderedWidget);

    setLayout(prev => ({ ...prev, widgets: newWidgets }));
  }, [layout.widgets]);

  const saveLayout = useCallback(async () => {
    try {
      // Aquí guardarías el layout en Supabase
      toast({
        title: "Layout guardado",
        description: "Tu configuración de dashboard ha sido guardada.",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la configuración.",
        variant: "destructive",
      });
    }
  }, [layout, toast]);

  const addWidget = useCallback(() => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type: 'kpi',
      title: 'Nuevo Widget',
      size: 'small',
      config: {}
    };
    
    setLayout(prev => ({
      ...prev,
      widgets: [...prev.widgets, newWidget]
    }));
  }, []);

  const renderWidget = (widget: Widget, isDragging: boolean) => (
    <Card className={`${isDragging ? 'opacity-50' : ''} ${
      widget.size === 'small' ? 'col-span-1' : 
      widget.size === 'medium' ? 'col-span-2' : 'col-span-3'
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
        {isEditing && (
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {widget.type === 'kpi' && (
          <div className="text-2xl font-bold">1,234</div>
        )}
        {widget.type === 'chart' && (
          <div className="h-32 bg-muted rounded flex items-center justify-center">
            Gráfico: {widget.config.chartType}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Grid className="h-5 w-5" />
          <h2 className="text-xl font-semibold">{layout.name}</h2>
        </div>
        
        <div className="flex gap-2">
          {isEditing && (
            <>
              <Button variant="outline" onClick={addWidget}>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Widget
              </Button>
              <Button onClick={saveLayout}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Layout
              </Button>
            </>
          )}
          <Button 
            variant={isEditing ? "secondary" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isEditing ? 'Finalizar' : 'Personalizar'}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="dashboard">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`grid grid-cols-${layout.columns} gap-4`}
              >
                {layout.widgets.map((widget, index) => (
                  <Draggable key={widget.id} draggableId={widget.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        {renderWidget(widget, snapshot.isDragging)}
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
        <div className={`grid grid-cols-${layout.columns} gap-4`}>
          {layout.widgets.map((widget) => (
            <div key={widget.id}>
              {renderWidget(widget, false)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}