import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, LayoutList, Lightbulb, Database } from 'lucide-react';
import CalendarView from './CalendarView';
import ListView from './ListView';
import IdeaBankView from './IdeaBankView';
import PESectorBrowser from './PESectorBrowser';
import ContentItemDialog from './ContentItemDialog';
import { useContentCalendar, type ContentCalendarItem } from '@/hooks/useContentCalendar';

const ContentCalendarManager = () => {
  const { items, isLoading, createItem, updateItem, deleteItem } = useContentCalendar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentCalendarItem | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<ContentCalendarItem>>({});

  const handleCreate = (prefill?: Partial<ContentCalendarItem>) => {
    setEditingItem(null);
    setPrefillData(prefill || {});
    setDialogOpen(true);
  };

  const handleEdit = (item: ContentCalendarItem) => {
    setEditingItem(item);
    setPrefillData({});
    setDialogOpen(true);
  };

  const handleSave = (data: Partial<ContentCalendarItem>) => {
    if (editingItem) {
      updateItem.mutate({ id: editingItem.id, ...data });
    } else {
      createItem.mutate(data);
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteItem.mutate(id);
  };

  const handleCreateFromSector = (sectorData: { title: string; pe_sector_id: string; category: string; notes: string }) => {
    handleCreate({
      title: sectorData.title,
      pe_sector_id: sectorData.pe_sector_id,
      category: sectorData.category,
      notes: sectorData.notes,
      status: 'idea',
      content_type: 'article',
    });
  };

  const stats = useMemo(() => ({
    ideas: items.filter(i => i.status === 'idea').length,
    drafts: items.filter(i => i.status === 'draft').length,
    review: items.filter(i => i.status === 'review').length,
    scheduled: items.filter(i => i.status === 'scheduled').length,
    published: items.filter(i => i.status === 'published').length,
  }), [items]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Calendario de Contenido
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Planifica, organiza y gestiona tu pipeline de contenido
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          {[
            { label: 'Ideas', count: stats.ideas, color: 'bg-slate-200 text-slate-700' },
            { label: 'Borrador', count: stats.drafts, color: 'bg-blue-100 text-blue-700' },
            { label: 'Revisión', count: stats.review, color: 'bg-amber-100 text-amber-700' },
            { label: 'Programado', count: stats.scheduled, color: 'bg-purple-100 text-purple-700' },
            { label: 'Publicado', count: stats.published, color: 'bg-green-100 text-green-700' },
          ].map(s => (
            <span key={s.label} className={`px-2 py-1 rounded-full font-medium ${s.color}`}>
              {s.count} {s.label}
            </span>
          ))}
        </div>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-4 w-4" /> Calendario
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <LayoutList className="h-4 w-4" /> Lista
          </TabsTrigger>
          <TabsTrigger value="ideas" className="gap-1.5">
            <Lightbulb className="h-4 w-4" /> Banco de Ideas
          </TabsTrigger>
          <TabsTrigger value="sectors" className="gap-1.5">
            <Database className="h-4 w-4" /> Sectores PE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <CalendarView
            items={items}
            isLoading={isLoading}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onUpdateStatus={(id, status) => updateItem.mutate({ id, status })}
          />
        </TabsContent>

        <TabsContent value="list">
          <ListView
            items={items}
            isLoading={isLoading}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateStatus={(id, status) => updateItem.mutate({ id, status })}
          />
        </TabsContent>

        <TabsContent value="ideas">
          <IdeaBankView
            items={items.filter(i => i.status === 'idea')}
            isLoading={isLoading}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onPromote={(id) => updateItem.mutate({ id, status: 'draft' })}
          />
        </TabsContent>

        <TabsContent value="sectors">
          <PESectorBrowser onCreateIdea={handleCreateFromSector} />
        </TabsContent>
      </Tabs>

      <ContentItemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        prefill={prefillData}
        onSave={handleSave}
      />
    </div>
  );
};

export default ContentCalendarManager;
