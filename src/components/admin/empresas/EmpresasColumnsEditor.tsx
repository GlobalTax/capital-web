/**
 * Panel lateral para configurar columnas de la tabla de empresas
 */

import { useState, useCallback, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings2, 
  RotateCcw,
  Building2,
  Briefcase,
  MapPin,
  Users,
  TrendingUp,
  BarChart3,
  Percent,
  Landmark,
  Calendar,
  Hash,
  Target,
  Star,
  Tag,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmpresasTableColumns, EmpresaTableColumn } from '@/hooks/useEmpresasTableColumns';
import { Skeleton } from '@/components/ui/skeleton';

interface EmpresasColumnsEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Map icon names to components
const iconMap: Record<string, React.ElementType> = {
  Star,
  Building2,
  Briefcase,
  MapPin,
  Users,
  TrendingUp,
  BarChart3,
  Percent,
  Landmark,
  Calendar,
  Hash,
  Target,
  Tag,
  MoreHorizontal,
};

export const EmpresasColumnsEditor = ({ open, onOpenChange }: EmpresasColumnsEditorProps) => {
  const { 
    columns, 
    isLoading, 
    toggleVisibility, 
    reorderColumns,
    isReordering 
  } = useEmpresasTableColumns();
  
  const [localColumns, setLocalColumns] = useState<EmpresaTableColumn[]>([]);

  // Sync local state when columns change from DB
  useEffect(() => {
    if (columns.length > 0) {
      setLocalColumns(columns);
    }
  }, [columns]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(localColumns);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLocalColumns(items);
    
    // Persist to database
    const orderedIds = items.map(item => item.id);
    reorderColumns(orderedIds);
  }, [localColumns, reorderColumns]);

  const handleToggleVisibility = useCallback((column: EmpresaTableColumn) => {
    // Update local state immediately for responsiveness
    setLocalColumns(prev => 
      prev.map(c => 
        c.id === column.id ? { ...c, is_visible: !c.is_visible } : c
      )
    );
    
    // Persist to database
    toggleVisibility({ id: column.id, isVisible: !column.is_visible });
  }, [toggleVisibility]);

  const visibleCount = localColumns.filter(c => c.is_visible).length;
  const totalCount = localColumns.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[400px] sm:w-[450px]">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5 text-primary" />
            Configurar Columnas
          </SheetTitle>
          <SheetDescription>
            Arrastra para reordenar, toggle para mostrar/ocultar columnas
          </SheetDescription>
        </SheetHeader>

        <div className="py-4">
          <div className="flex items-center justify-between mb-4 px-1">
            <span className="text-sm text-muted-foreground">
              {visibleCount} de {totalCount} columnas visibles
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs"
              onClick={() => window.location.reload()}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Restablecer
            </Button>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="columns">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-1"
                  >
                    {localColumns.map((column, index) => {
                      const IconComponent = iconMap[column.icon || ''] || Tag;
                      const isSystemColumn = column.column_key === 'acciones';
                      
                      return (
                        <Draggable 
                          key={column.id} 
                          draggableId={column.id} 
                          index={index}
                          isDragDisabled={isReordering}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-lg border bg-card transition-all",
                                snapshot.isDragging && "shadow-lg ring-2 ring-primary/20",
                                !column.is_visible && "opacity-60 bg-muted/30"
                              )}
                            >
                              {/* Drag handle */}
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <GripVertical className="h-4 w-4" />
                              </div>

                              {/* Icon */}
                              <div className={cn(
                                "p-1.5 rounded-md",
                                column.is_visible 
                                  ? "bg-primary/10 text-primary" 
                                  : "bg-muted text-muted-foreground"
                              )}>
                                <IconComponent className="h-4 w-4" />
                              </div>

                              {/* Label */}
                              <div className="flex-1 min-w-0">
                                <span className={cn(
                                  "text-sm font-medium",
                                  !column.is_visible && "text-muted-foreground"
                                )}>
                                  {column.label || column.column_key}
                                </span>
                                {column.is_sortable && (
                                  <span className="ml-2 text-xs text-muted-foreground">
                                    (ordenable)
                                  </span>
                                )}
                              </div>

                              {/* Visibility toggle */}
                              {!isSystemColumn && (
                                <div className="flex items-center gap-2">
                                  {column.is_visible ? (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  )}
                                  <Switch
                                    checked={column.is_visible}
                                    onCheckedChange={() => handleToggleVisibility(column)}
                                    disabled={isSystemColumn}
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
          <Button 
            className="w-full" 
            onClick={() => onOpenChange(false)}
          >
            Aplicar cambios
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
