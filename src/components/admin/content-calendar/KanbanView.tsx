import React, { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Pencil } from 'lucide-react';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const COLUMNS: { id: ContentCalendarItem['status']; label: string; color: string; dotColor: string }[] = [
  { id: 'idea', label: '💡 Ideas', color: 'border-t-slate-400', dotColor: 'bg-slate-400' },
  { id: 'draft', label: '📝 Borrador', color: 'border-t-blue-500', dotColor: 'bg-blue-500' },
  { id: 'review', label: '👀 Revisión', color: 'border-t-amber-500', dotColor: 'bg-amber-500' },
  { id: 'scheduled', label: '📅 Programado', color: 'border-t-purple-500', dotColor: 'bg-purple-500' },
  { id: 'published', label: '✅ Publicado', color: 'border-t-green-500', dotColor: 'bg-green-500' },
];

const CHANNEL_EMOJI: Record<string, string> = {
  linkedin_company: '🏢',
  linkedin_personal: '👤',
  blog: '📝',
  newsletter: '📧',
  crm_internal: '🔒',
};

const PRIORITY_BORDER: Record<string, string> = {
  urgent: 'border-l-red-500 border-l-4',
  high: 'border-l-orange-400 border-l-4',
  medium: 'border-l-yellow-400 border-l-2',
  low: '',
};

interface KanbanViewProps {
  items: ContentCalendarItem[];
  isLoading: boolean;
  onEdit: (item: ContentCalendarItem) => void;
  onUpdateStatus: (id: string, status: ContentCalendarItem['status']) => void;
}

const KanbanView: React.FC<KanbanViewProps> = ({ items, onEdit, onUpdateStatus }) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId as ContentCalendarItem['status'];
    const itemId = result.draggableId;
    const item = items.find(i => i.id === itemId);
    if (item && item.status !== newStatus) {
      onUpdateStatus(itemId, newStatus);
    }
  };

  const itemsByStatus = useMemo(() => {
    const prio: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const map: Record<string, ContentCalendarItem[]> = {};
    COLUMNS.forEach(col => {
      map[col.id] = items
        .filter(i => i.status === col.id)
        .sort((a, b) => (prio[a.priority] ?? 2) - (prio[b.priority] ?? 2));
    });
    return map;
  }, [items]);

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 min-h-[600px]">
        {COLUMNS.map(col => {
          const colItems = itemsByStatus[col.id] || [];
          return (
            <div key={col.id} className="flex-shrink-0 w-[280px]">
              <div className={cn('rounded-t-lg border-t-4 bg-muted/30 px-3 py-2 flex items-center justify-between', col.color)}>
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge variant="secondary" className="text-[10px] h-5 min-w-[22px] justify-center">
                  {colItems.length}
                </Badge>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      'min-h-[500px] space-y-2 p-2 rounded-b-lg border border-t-0 transition-colors',
                      snapshot.isDraggingOver ? 'bg-primary/5 border-primary/20' : 'bg-background'
                    )}
                  >
                    {colItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(prov, snap) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className={cn(
                              'group',
                              snap.isDragging && 'rotate-2'
                            )}
                          >
                            <Card
                              className={cn(
                                'cursor-grab active:cursor-grabbing hover:shadow-md transition-all',
                                PRIORITY_BORDER[item.priority],
                                snap.isDragging && 'shadow-lg ring-2 ring-primary/20'
                              )}
                            >
                              <CardContent className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="text-xs font-semibold leading-tight line-clamp-2 flex-1">
                                    {item.title}
                                  </h4>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                    onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-xs" title={(item as any).channel}>
                                    {CHANNEL_EMOJI[(item as any).channel] || '📝'}
                                  </span>
                                  {item.category && (
                                    <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4">
                                      {item.category}
                                    </Badge>
                                  )}
                                  {(item as any).key_data && (
                                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 max-w-[140px] truncate">
                                      📊 {(item as any).key_data}
                                    </Badge>
                                  )}
                                </div>

                                {item.notes && (
                                  <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">
                                    {item.notes}
                                  </p>
                                )}

                                <div className="flex items-center justify-between pt-1">
                                  <div className="flex items-center gap-1.5">
                                    {item.scheduled_date && (
                                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                        <Calendar className="h-2.5 w-2.5" />
                                        {format(new Date(item.scheduled_date), 'dd MMM', { locale: es })}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    {(item as any).ai_generated_content && (
                                      <Sparkles className="h-3 w-3 text-primary/60" />
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};

export default KanbanView;
