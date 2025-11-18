import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Operation } from '../../types/operations';
import { KanbanCard } from './KanbanCard';
import { formatCurrency } from '@/shared/utils/format';

interface KanbanColumnProps {
  columnId: string;
  label: string;
  operations: Operation[];
  color: string;
  adminUsersMap: Record<string, { full_name: string | null; email: string | null }>;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
  columnId,
  label,
  operations,
  color,
  adminUsersMap,
}) => {
  const totalValue = operations.reduce((sum, op) => sum + op.valuation_amount, 0);

  return (
    <div className="flex-shrink-0 w-80">
      <Card className={`h-full flex flex-col ${color}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span>{label}</span>
            <Badge variant="secondary" className="ml-2">
              {operations.length}
            </Badge>
          </CardTitle>
          {operations.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              Total: {formatCurrency(totalValue, 'EUR')}
            </p>
          )}
        </CardHeader>

        <Droppable droppableId={columnId}>
          {(provided, snapshot) => (
            <CardContent
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`flex-1 space-y-3 min-h-[200px] transition-colors ${
                snapshot.isDraggingOver ? 'bg-muted/50' : ''
              }`}
            >
              {operations.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                  Sin operaciones
                </div>
              ) : (
                operations.map((operation, index) => (
                  <Draggable
                    key={operation.id}
                    draggableId={operation.id}
                    index={index}
                  >
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={snapshot.isDragging ? 'opacity-50' : ''}
                      >
                        <KanbanCard
                          operation={operation}
                          assignedUserName={
                            operation.assigned_to
                              ? adminUsersMap[operation.assigned_to]?.full_name ||
                                adminUsersMap[operation.assigned_to]?.email ||
                                undefined
                              : undefined
                          }
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </CardContent>
          )}
        </Droppable>
      </Card>
    </div>
  );
};
