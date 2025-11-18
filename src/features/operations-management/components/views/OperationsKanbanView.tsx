import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { STATUS_COLUMNS } from '../../utils/operationStatus';
import { useOperationMutations } from '../../hooks/useOperationMutations';
import { KanbanCard } from './KanbanCard';
import type { Operation } from '../../types/operations';

interface OperationsKanbanViewProps {
  operations: Operation[];
  isLoading: boolean;
  onOperationClick: (operation: Operation) => void;
}

export const OperationsKanbanView: React.FC<OperationsKanbanViewProps> = ({
  operations,
  isLoading,
  onOperationClick,
}) => {
  const { updateStatus, isUpdating } = useOperationMutations();

  // Group operations by status
  const operationsByStatus = operations.reduce((acc, operation) => {
    const status = operation.status || 'proposal';
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(operation);
    return acc;
  }, {} as Record<string, Operation[]>);

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Update operation status
    const newStatus = destination.droppableId;
    const oldStatus = source.droppableId;
    
    updateStatus({
      operationId: draggableId,
      newStatus,
      oldStatus,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Pipeline de Operaciones</h2>
          <p className="text-muted-foreground">
            Arrastra las operaciones entre columnas para cambiar su estado
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {operations.length} operaciones totales
        </Badge>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATUS_COLUMNS.map((column) => {
            const columnOperations = operationsByStatus[column.id] || [];
            const columnValue = columnOperations.reduce(
              (sum, op) => sum + op.valuation_amount,
              0
            );

            return (
              <div key={column.id} className="flex flex-col min-h-[500px]">
                <Card className={`flex flex-col h-full ${column.bgColor}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-sm font-semibold ${column.color}`}>
                        {column.title}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {columnOperations.length}
                      </Badge>
                    </div>
                    {columnValue > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        €{(columnValue / 1000000).toFixed(1)}M
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden">
                    <Droppable droppableId={column.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[400px] transition-colors ${
                            snapshot.isDraggingOver ? 'bg-accent/20 rounded-lg p-2' : ''
                          }`}
                        >
                          {columnOperations.map((operation, index) => (
                            <Draggable
                              key={operation.id}
                              draggableId={operation.id}
                              index={index}
                              isDragDisabled={isUpdating}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`transition-shadow ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  }`}
                                >
                                  <KanbanCard
                                    operation={operation}
                                    onClick={onOperationClick}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                          {columnOperations.length === 0 && (
                            <div className="text-center py-8 text-sm text-muted-foreground">
                              No hay operaciones
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};
