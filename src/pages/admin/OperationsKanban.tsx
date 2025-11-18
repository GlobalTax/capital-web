import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, List, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { useKanbanOperations, KANBAN_COLUMNS } from '@/features/operations-management/hooks/useKanbanOperations';
import { KanbanColumn, KanbanFilters } from '@/features/operations-management/components/kanban';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { Skeleton } from '@/components/ui/skeleton';

const OperationsKanban: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<{
    assigned_to?: string;
    sector?: string;
    search?: string;
  }>({});

  const { operationsByStatus, isLoading, updateStatus, isUpdating, operations } = useKanbanOperations(filters);
  const { users: adminUsers } = useAdminUsers();

  // Mapa de usuarios para mostrar nombres
  const adminUsersMap = useMemo(() => {
    return adminUsers.reduce((acc, user) => {
      acc[user.user_id] = {
        full_name: user.full_name,
        email: user.email,
      };
      return acc;
    }, {} as Record<string, { full_name: string | null; email: string | null }>);
  }, [adminUsers]);

  // Obtener sectores únicos para filtros
  const uniqueSectors = useMemo(() => {
    const sectors = new Set<string>();
    (operations || []).forEach(op => {
      if (op.sector) sectors.add(op.sector);
    });
    return Array.from(sectors).sort();
  }, [operations]);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Si no hay destino o es el mismo, no hacer nada
    if (!destination || destination.droppableId === source.droppableId) {
      return;
    }

    // Actualizar el estado de la operación
    updateStatus({
      operationId: draggableId,
      newStatus: destination.droppableId,
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <Skeleton className="h-20 w-full" />

        {/* Columns Skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-80 flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => navigate('/admin/operations')}
            variant="ghost"
            size="icon"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Vista Kanban</h1>
            <p className="text-muted-foreground">
              Gestión visual de operaciones con drag & drop
            </p>
          </div>
        </div>

        <Button onClick={() => navigate('/admin/operations')} variant="outline">
          <List className="h-4 w-4 mr-2" />
          Vista Lista
        </Button>
      </div>

      {/* Filtros */}
      <KanbanFilters
        filters={filters}
        onFiltersChange={setFilters}
        sectors={uniqueSectors}
      />

      {/* Loading overlay cuando se está actualizando */}
      {isUpdating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="text-lg font-medium">Actualizando...</span>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              columnId={column.id}
              label={column.label}
              operations={operationsByStatus[column.id] || []}
              color={column.color}
              adminUsersMap={adminUsersMap}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Empty state */}
      {operations && operations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            No hay operaciones activas. {filters.assigned_to || filters.sector || filters.search ? 'Prueba ajustando los filtros.' : ''}
          </p>
          <Button
            onClick={() => navigate('/admin/operations')}
            variant="outline"
            className="mt-4"
          >
            Ir a Lista de Operaciones
          </Button>
        </div>
      )}
    </div>
  );
};

export default OperationsKanban;
