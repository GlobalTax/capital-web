import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Pencil, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';
import { cn } from '@/lib/utils';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  idea: { label: 'Idea', color: 'bg-slate-200 text-slate-700' },
  draft: { label: 'Borrador', color: 'bg-blue-100 text-blue-700' },
  review: { label: 'Revisión', color: 'bg-amber-100 text-amber-700' },
  scheduled: { label: 'Programado', color: 'bg-purple-100 text-purple-700' },
  published: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
  archived: { label: 'Archivado', color: 'bg-gray-100 text-gray-500' },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  urgent: { label: 'Urgente', color: 'bg-red-100 text-red-700' },
  high: { label: 'Alta', color: 'bg-orange-100 text-orange-700' },
  medium: { label: 'Media', color: 'bg-yellow-100 text-yellow-700' },
  low: { label: 'Baja', color: 'bg-slate-100 text-slate-600' },
};

const NEXT_STATUS: Record<string, string> = {
  idea: 'draft',
  draft: 'review',
  review: 'scheduled',
  scheduled: 'published',
};

interface ListViewProps {
  items: ContentCalendarItem[];
  isLoading: boolean;
  onCreate: (prefill?: Partial<ContentCalendarItem>) => void;
  onEdit: (item: ContentCalendarItem) => void;
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: ContentCalendarItem['status']) => void;
}

const ListView: React.FC<ListViewProps> = ({ items, isLoading, onCreate, onEdit, onDelete, onUpdateStatus }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const filtered = items.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterPriority !== 'all' && i.priority !== filterPriority) return false;
    return true;
  });

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toda prioridad</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" onClick={() => onCreate()}>
            <Plus className="h-4 w-4 mr-1" /> Nuevo
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="text-left p-2 font-medium">Título</th>
                <th className="text-left p-2 font-medium w-[100px]">Estado</th>
                <th className="text-left p-2 font-medium w-[80px]">Prioridad</th>
                <th className="text-left p-2 font-medium w-[90px]">Tipo</th>
                <th className="text-left p-2 font-medium w-[100px]">Fecha</th>
                <th className="text-left p-2 font-medium w-[130px]">Categoría</th>
                <th className="text-right p-2 font-medium w-[100px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const statusConf = STATUS_CONFIG[item.status];
                const prioConf = PRIORITY_CONFIG[item.priority];
                const nextStatus = NEXT_STATUS[item.status];
                return (
                  <tr key={item.id} className="border-t hover:bg-muted/20 h-[40px]">
                    <td className="p-2">
                      <button onClick={() => onEdit(item)} className="text-left hover:underline font-medium truncate max-w-[300px] block">
                        {item.title}
                      </button>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className={cn('text-[10px]', statusConf.color)}>
                        {statusConf.label}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline" className={cn('text-[10px]', prioConf.color)}>
                        {prioConf.label}
                      </Badge>
                    </td>
                    <td className="p-2 text-xs text-muted-foreground">{item.content_type}</td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {item.scheduled_date ? format(new Date(item.scheduled_date), 'dd MMM', { locale: es }) : '—'}
                    </td>
                    <td className="p-2 text-xs text-muted-foreground truncate max-w-[130px]">{item.category || '—'}</td>
                    <td className="p-2 text-right">
                      <div className="flex gap-1 justify-end">
                        {nextStatus && (
                          <Button size="icon" variant="ghost" className="h-7 w-7" title={`Avanzar a ${STATUS_CONFIG[nextStatus]?.label}`}
                            onClick={() => onUpdateStatus(item.id, nextStatus as ContentCalendarItem['status'])}>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => onEdit(item)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => onDelete(item.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">No hay elementos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ListView;
