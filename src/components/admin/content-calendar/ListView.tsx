import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Pencil, ArrowRight, Sparkles, Copy } from 'lucide-react';
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

const CHANNEL_CONFIG: Record<string, string> = {
  linkedin_company: '🏢 LI Empresa',
  linkedin_personal: '👤 LI Personal',
  blog: '📝 Blog',
  newsletter: '📧 Newsletter',
  crm_internal: '🔒 CRM',
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
  const [filterChannel, setFilterChannel] = useState<string>('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = items.filter(i => {
    if (filterStatus !== 'all' && i.status !== filterStatus) return false;
    if (filterPriority !== 'all' && i.priority !== filterPriority) return false;
    if (filterChannel !== 'all' && (i as any).channel !== filterChannel) return false;
    return true;
  });

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(i => i.id)));
    }
  };

  const bulkDelete = () => {
    if (!window.confirm(`¿Eliminar ${selected.size} elementos? Esta acción no se puede deshacer.`)) return;
    selected.forEach(id => onDelete(id));
    setSelected(new Set());
  };

  const bulkAdvance = () => {
    selected.forEach(id => {
      const item = items.find(i => i.id === id);
      if (item && NEXT_STATUS[item.status]) {
        onUpdateStatus(id, NEXT_STATUS[item.status] as ContentCalendarItem['status']);
      }
    });
    setSelected(new Set());
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2 flex-wrap">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[130px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo estado</SelectItem>
                {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 w-[120px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Prioridad</SelectItem>
                {Object.entries(PRIORITY_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterChannel} onValueChange={setFilterChannel}>
              <SelectTrigger className="h-8 w-[140px] text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo canal</SelectItem>
                {Object.entries(CHANNEL_CONFIG).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2">
            {selected.size > 0 && (
              <>
                <Button size="sm" variant="outline" className="h-8 text-xs" onClick={bulkAdvance}>
                  <ArrowRight className="h-3 w-3 mr-1" /> Avanzar ({selected.size})
                </Button>
                <Button size="sm" variant="outline" className="h-8 text-xs text-destructive" onClick={bulkDelete}>
                  <Trash2 className="h-3 w-3 mr-1" /> Eliminar ({selected.size})
                </Button>
              </>
            )}
            <Button size="sm" onClick={() => onCreate()}>
              <Plus className="h-4 w-4 mr-1" /> Nuevo
            </Button>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs text-muted-foreground">
                <th className="p-2 w-[32px]">
                  <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                </th>
                <th className="text-left p-2 font-medium">Título</th>
                <th className="text-left p-2 font-medium w-[80px]">Canal</th>
                <th className="text-left p-2 font-medium w-[90px]">Estado</th>
                <th className="text-left p-2 font-medium w-[70px]">Prio</th>
                <th className="text-left p-2 font-medium w-[80px]">Tipo</th>
                <th className="text-left p-2 font-medium w-[80px]">Fecha</th>
                <th className="text-left p-2 font-medium w-[110px]">Sector</th>
                <th className="text-center p-2 font-medium w-[30px]">IA</th>
                <th className="text-right p-2 font-medium w-[90px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const statusConf = STATUS_CONFIG[item.status];
                const prioConf = PRIORITY_CONFIG[item.priority];
                const nextStatus = NEXT_STATUS[item.status];
                const ch = CHANNEL_CONFIG[(item as any).channel] || '📝 Blog';
                return (
                  <tr key={item.id} className="border-t hover:bg-muted/20 h-[40px]">
                    <td className="p-2">
                      <Checkbox checked={selected.has(item.id)} onCheckedChange={() => toggleSelect(item.id)} />
                    </td>
                    <td className="p-2">
                      <button onClick={() => onEdit(item)} className="text-left hover:underline font-medium truncate max-w-[250px] block">
                        {item.title}
                      </button>
                    </td>
                    <td className="p-2 text-xs">{ch}</td>
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
                    <td className="p-2 text-xs text-muted-foreground truncate max-w-[110px]">{item.category || '—'}</td>
                    <td className="p-2 text-center">
                      {(item as any).ai_generated_content ? (
                        <Sparkles className="h-3.5 w-3.5 text-primary mx-auto" />
                      ) : (
                        <span className="text-muted-foreground text-[10px]">—</span>
                      )}
                    </td>
                    <td className="p-2 text-right">
                      <div className="flex gap-0.5 justify-end">
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
                <tr><td colSpan={10} className="p-8 text-center text-muted-foreground text-sm">No hay elementos</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground">{filtered.length} de {items.length} elementos</p>
      </CardContent>
    </Card>
  );
};

export default ListView;
