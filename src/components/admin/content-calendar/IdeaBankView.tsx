import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Lightbulb, ArrowUpRight, Trash2 } from 'lucide-react';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';
import { cn } from '@/lib/utils';

const PRIORITY_COLORS: Record<string, string> = {
  urgent: 'border-l-red-500',
  high: 'border-l-orange-500',
  medium: 'border-l-yellow-500',
  low: 'border-l-slate-300',
};

interface IdeaBankViewProps {
  items: ContentCalendarItem[];
  isLoading: boolean;
  onCreate: (prefill?: Partial<ContentCalendarItem>) => void;
  onEdit: (item: ContentCalendarItem) => void;
  onDelete: (id: string) => void;
  onPromote: (id: string) => void;
}

const IdeaBankView: React.FC<IdeaBankViewProps> = ({ items, onCreate, onEdit, onDelete, onPromote }) => {
  const grouped = items.reduce<Record<string, ContentCalendarItem[]>>((acc, item) => {
    const cat = item.category || 'Sin categoría';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length} ideas en el banco. Promueve una idea a borrador para empezar a trabajar en ella.
        </p>
        <Button size="sm" onClick={() => onCreate({ status: 'idea' })}>
          <Plus className="h-4 w-4 mr-1" /> Nueva Idea
        </Button>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Lightbulb className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No hay ideas aún. Crea una o genera desde los datos de Sectores PE.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(grouped).map(([category, categoryItems]) => (
            <div key={category} className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground px-1">{category} ({categoryItems.length})</h3>
              {categoryItems.map(item => (
                <Card key={item.id} className={cn('border-l-4 hover:shadow-md transition-shadow', PRIORITY_COLORS[item.priority])}>
                  <CardContent className="p-3 space-y-2">
                    <button onClick={() => onEdit(item)} className="text-sm font-medium text-left hover:underline block w-full">
                      {item.title}
                    </button>
                    {item.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{item.notes}</p>
                    )}
                    <div className="flex items-center gap-1 flex-wrap">
                      {item.target_keywords?.slice(0, 3).map(kw => (
                        <Badge key={kw} variant="secondary" className="text-[10px]">{kw}</Badge>
                      ))}
                      <Badge variant="outline" className="text-[10px]">{item.content_type}</Badge>
                    </div>
                    <div className="flex gap-1 justify-end pt-1">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => onPromote(item.id)}>
                        <ArrowUpRight className="h-3 w-3 mr-1" /> A borrador
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default IdeaBankView;
