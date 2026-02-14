import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { type ContentCalendarItem } from '@/hooks/useContentCalendar';
import { cn } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  idea: 'bg-slate-200 border-slate-300 text-slate-700',
  draft: 'bg-blue-100 border-blue-300 text-blue-700',
  review: 'bg-amber-100 border-amber-300 text-amber-700',
  scheduled: 'bg-purple-100 border-purple-300 text-purple-700',
  published: 'bg-green-100 border-green-300 text-green-700',
  archived: 'bg-gray-100 border-gray-300 text-gray-500',
};

const CHANNEL_INDICATOR: Record<string, string> = {
  linkedin_company: '🏢',
  linkedin_personal: '👤',
  blog: '📝',
  newsletter: '📧',
  crm_internal: '🔒',
};

const PRIORITY_DOT: Record<string, string> = {
  urgent: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-slate-400',
};

interface CalendarViewProps {
  items: ContentCalendarItem[];
  isLoading: boolean;
  onCreate: (prefill?: Partial<ContentCalendarItem>) => void;
  onEdit: (item: ContentCalendarItem) => void;
  onUpdateStatus: (id: string, status: ContentCalendarItem['status']) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ items, isLoading, onCreate, onEdit }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const itemsByDate = useMemo(() => {
    const map: Record<string, ContentCalendarItem[]> = {};
    items.forEach(item => {
      const date = item.scheduled_date || item.published_date;
      if (date) {
        const key = format(new Date(date), 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(item);
      }
    });
    return map;
  }, [items]);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-medium capitalize min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentMonth(m => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={() => onCreate()}>
            <Plus className="h-4 w-4 mr-1" /> Nuevo
          </Button>
        </div>

        <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
            <div key={day} className="bg-muted/50 p-2 text-center text-xs font-medium text-muted-foreground">
              {day}
            </div>
          ))}
          {days.map(day => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayItems = itemsByDate[dateKey] || [];
            const inMonth = isSameMonth(day, currentMonth);

            return (
              <div
                key={dateKey}
                className={cn(
                  'bg-background min-h-[100px] p-1.5 cursor-pointer hover:bg-muted/30 transition-colors',
                  !inMonth && 'opacity-40',
                  isToday(day) && 'ring-2 ring-primary/30 ring-inset'
                )}
                onClick={() => onCreate({ scheduled_date: dateKey })}
              >
                <div className={cn('text-xs font-medium mb-1', isToday(day) ? 'text-primary font-bold' : 'text-muted-foreground')}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-0.5">
                  {dayItems.slice(0, 3).map(item => (
                    <div
                      key={item.id}
                      className={cn('text-[10px] leading-tight px-1.5 py-0.5 rounded border truncate cursor-pointer', STATUS_COLORS[item.status])}
                      onClick={(e) => { e.stopPropagation(); onEdit(item); }}
                      title={item.title}
                    >
                      <span className={cn('inline-block w-1.5 h-1.5 rounded-full mr-0.5', PRIORITY_DOT[item.priority])} />
                      <span className="mr-0.5">{CHANNEL_INDICATOR[(item as any).channel] || '📝'}</span>
                      {item.title}
                    </div>
                  ))}
                  {dayItems.length > 3 && (
                    <div className="text-[10px] text-muted-foreground px-1.5">+{dayItems.length - 3} más</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default CalendarView;
