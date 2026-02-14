import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { CalendarDays, LayoutList, Lightbulb, Database, Sparkles, BarChart3, Columns3, Search } from 'lucide-react';
import CalendarView from './CalendarView';
import ListView from './ListView';
import KanbanView from './KanbanView';
import IdeaBankView from './IdeaBankView';
import PESectorBrowser from './PESectorBrowser';
import AIContentEngine from './AIContentEngine';
import ContentDashboard from './ContentDashboard';
import ContentItemDialog from './ContentItemDialog';
import { useContentCalendar, type ContentCalendarItem } from '@/hooks/useContentCalendar';

const ContentCalendarManager = () => {
  const { items, isLoading, createItem, updateItem, deleteItem } = useContentCalendar();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentCalendarItem | null>(null);
  const [prefillData, setPrefillData] = useState<Partial<ContentCalendarItem>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(i =>
      i.title.toLowerCase().includes(q) ||
      i.category?.toLowerCase().includes(q) ||
      i.notes?.toLowerCase().includes(q) ||
      (i as any).key_data?.toLowerCase().includes(q) ||
      (i as any).channel?.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

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

  const handleAddFromAI = (data: Partial<ContentCalendarItem>) => {
    createItem.mutate(data);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-6 w-6" />
            Content Command Center
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Planifica, genera y gestiona contenido multicanal con inteligencia PE
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status pills */}
          <div className="flex gap-1.5 text-xs">
            {[
              { label: 'Ideas', count: stats.ideas, color: 'bg-slate-200 text-slate-700' },
              { label: 'Draft', count: stats.drafts, color: 'bg-blue-100 text-blue-700' },
              { label: 'Review', count: stats.review, color: 'bg-amber-100 text-amber-700' },
              { label: 'Sched', count: stats.scheduled, color: 'bg-purple-100 text-purple-700' },
              { label: 'Pub', count: stats.published, color: 'bg-green-100 text-green-700' },
            ].map(s => (
              <span key={s.label} className={`px-2 py-0.5 rounded-full font-medium ${s.color}`}>
                {s.count}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Global Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por título, sector, canal, dato clave..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      <Tabs defaultValue="kanban" className="space-y-4">
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="kanban" className="gap-1.5">
            <Columns3 className="h-4 w-4" /> Kanban
          </TabsTrigger>
          <TabsTrigger value="calendar" className="gap-1.5">
            <CalendarDays className="h-4 w-4" /> Calendario
          </TabsTrigger>
          <TabsTrigger value="list" className="gap-1.5">
            <LayoutList className="h-4 w-4" /> Lista
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1.5">
            <Sparkles className="h-4 w-4" /> IA Engine
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="gap-1.5">
            <BarChart3 className="h-4 w-4" /> Dashboard
          </TabsTrigger>
          <TabsTrigger value="ideas" className="gap-1.5">
            <Lightbulb className="h-4 w-4" /> Ideas
          </TabsTrigger>
          <TabsTrigger value="sectors" className="gap-1.5">
            <Database className="h-4 w-4" /> Sectores PE
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban">
          <KanbanView
            items={filteredItems}
            isLoading={isLoading}
            onEdit={handleEdit}
            onUpdateStatus={(id, status) => updateItem.mutate({ id, status })}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarView
            items={filteredItems}
            isLoading={isLoading}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onUpdateStatus={(id, status) => updateItem.mutate({ id, status })}
          />
        </TabsContent>

        <TabsContent value="list">
          <ListView
            items={filteredItems}
            isLoading={isLoading}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onUpdateStatus={(id, status) => updateItem.mutate({ id, status })}
          />
        </TabsContent>

        <TabsContent value="ai">
          <AIContentEngine onAddToCalendar={handleAddFromAI} />
        </TabsContent>

        <TabsContent value="dashboard">
          <ContentDashboard items={items} />
        </TabsContent>

        <TabsContent value="ideas">
          <IdeaBankView
            items={filteredItems.filter(i => i.status === 'idea')}
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
