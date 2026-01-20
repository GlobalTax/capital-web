import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { SlideRenderer } from './SlideRenderer';
import { VersionManager } from './VersionManager';
import { VersionHistory } from './VersionHistory';
import { SlideApprovalControls } from './SlideApprovalControls';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Monitor, 
  Smartphone, 
  FileText,
  Save,
  Share2,
  Settings,
  Palette,
  GitBranch,
  Lock,
  History
} from 'lucide-react';
import type { 
  PresentationProject, 
  Slide, 
  SlideLayout, 
  UpdateSlideInput,
  PresentationType,
  SLIDE_LAYOUT_LABELS 
} from '../types/presentation.types';
import { useUpdateSlide, useCreateSlide, useDeleteSlide, useReorderSlides, useUpdatePresentation } from '../hooks/usePresentations';
import { usePresentationVersioning } from '../hooks/usePresentationVersioning';
import { toast } from 'sonner';

interface PresentationEditorProps {
  presentation: PresentationProject;
  onSave?: () => void;
  onShare?: () => void;
}

const LAYOUT_OPTIONS: { value: SlideLayout; label: string }[] = [
  { value: 'title', label: 'Title Slide' },
  { value: 'hero', label: 'Hero / Highlights' },
  { value: 'stats', label: 'Statistics' },
  { value: 'bullets', label: 'Bullet Points' },
  { value: 'comparison', label: 'Comparison' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'team', label: 'Team' },
  { value: 'financials', label: 'Financials' },
  { value: 'closing', label: 'Closing / CTA' },
  { value: 'custom', label: 'Custom' },
];

export const PresentationEditor: React.FC<PresentationEditorProps> = ({
  presentation,
  onSave,
  onShare
}) => {
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(
    presentation.slides?.[0]?.id || null
  );
  const [previewMode, setPreviewMode] = useState<'web' | 'mobile' | 'pdf'>('web');
  const [hasChanges, setHasChanges] = useState(false);
  const [versionManagerOpen, setVersionManagerOpen] = useState(false);

  const slides = presentation.slides || [];
  const selectedSlide = slides.find(s => s.id === selectedSlideId);

  const updateSlide = useUpdateSlide();
  const createSlide = useCreateSlide();
  const deleteSlide = useDeleteSlide();
  const reorderSlides = useReorderSlides();
  const updatePresentation = useUpdatePresentation();
  
  const { 
    approveSlide, 
    unlockSlide, 
    createVersionWithRegeneration,
    useVersionHistory,
    useCurrentVersion 
  } = usePresentationVersioning();
  
  const { data: versionHistory = [], isLoading: historyLoading } = useVersionHistory(presentation.id);
  const { data: currentVersion = 1 } = useCurrentVersion(presentation.id);

  const handleCreateVersion = async (options: { versionNotes: string; regenerateDrafts: boolean }) => {
    const metadata = presentation.metadata as Record<string, unknown> | null;
    await createVersionWithRegeneration.mutateAsync({
      projectId: presentation.id,
      versionNotes: options.versionNotes,
      regenerateDrafts: options.regenerateDrafts,
      presentationType: (metadata?.presentation_type as PresentationType) || undefined,
      inputs: (metadata?.inputs_json as Record<string, unknown>) || undefined
    });
  };

  const handleApproveSlide = (slideId: string) => {
    approveSlide.mutate({ slideId, projectId: presentation.id });
  };

  const handleUnlockSlide = (slideId: string) => {
    unlockSlide.mutate({ slideId, projectId: presentation.id });
  };

  const handleSlideUpdate = useCallback((updates: UpdateSlideInput) => {
    if (!selectedSlideId) return;
    
    updateSlide.mutate({
      id: selectedSlideId,
      projectId: presentation.id,
      ...updates
    });
    setHasChanges(true);
  }, [selectedSlideId, presentation.id, updateSlide]);

  const handleAddSlide = useCallback(() => {
    createSlide.mutate({
      projectId: presentation.id,
      layout: 'bullets',
      headline: 'New Slide',
      content: { bullets: ['Point 1', 'Point 2', 'Point 3'] }
    }, {
      onSuccess: ({ slide }) => {
        setSelectedSlideId(slide.id);
      }
    });
  }, [presentation.id, createSlide]);

  const handleDeleteSlide = useCallback((id: string) => {
    if (slides.length <= 1) {
      toast.error('Cannot delete the last slide');
      return;
    }
    
    deleteSlide.mutate({ id, projectId: presentation.id });
    
    if (selectedSlideId === id) {
      const idx = slides.findIndex(s => s.id === id);
      const newSelected = slides[idx - 1]?.id || slides[idx + 1]?.id;
      setSelectedSlideId(newSelected);
    }
  }, [slides, selectedSlideId, presentation.id, deleteSlide]);

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(slides);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    reorderSlides.mutate({
      projectId: presentation.id,
      slideIds: items.map(s => s.id)
    });
  }, [slides, presentation.id, reorderSlides]);

  const handleBulletChange = (index: number, value: string) => {
    const bullets = [...(selectedSlide?.content?.bullets || [])];
    bullets[index] = value;
    handleSlideUpdate({ content: { ...selectedSlide?.content, bullets } });
  };

  const handleAddBullet = () => {
    const bullets = [...(selectedSlide?.content?.bullets || []), 'New point'];
    handleSlideUpdate({ content: { ...selectedSlide?.content, bullets } });
  };

  const handleRemoveBullet = (index: number) => {
    const bullets = (selectedSlide?.content?.bullets || []).filter((_, i) => i !== index);
    handleSlideUpdate({ content: { ...selectedSlide?.content, bullets } });
  };

  const handleStatChange = (index: number, field: 'label' | 'value', value: string) => {
    const stats = [...(selectedSlide?.content?.stats || [])];
    stats[index] = { ...stats[index], [field]: value };
    handleSlideUpdate({ content: { ...selectedSlide?.content, stats } });
  };

  const handleAddStat = () => {
    const stats = [...(selectedSlide?.content?.stats || []), { label: 'Metric', value: '0' }];
    handleSlideUpdate({ content: { ...selectedSlide?.content, stats } });
  };

  const handleRemoveStat = (index: number) => {
    const stats = (selectedSlide?.content?.stats || []).filter((_, i) => i !== index);
    handleSlideUpdate({ content: { ...selectedSlide?.content, stats } });
  };

  return (
    <div className="h-screen flex flex-col bg-muted/30">
      {/* Header */}
      <header className="h-14 border-b bg-background flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold truncate max-w-[300px]">{presentation.title}</h1>
          {hasChanges && (
            <span className="text-xs text-muted-foreground">Unsaved changes</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg overflow-hidden">
            <button
              onClick={() => setPreviewMode('web')}
              className={cn(
                'p-2 transition-colors',
                previewMode === 'web' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              title="Web Preview"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={cn(
                'p-2 transition-colors',
                previewMode === 'mobile' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              title="Mobile Preview"
            >
              <Smartphone className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode('pdf')}
              className={cn(
                'p-2 transition-colors',
                previewMode === 'pdf' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
              )}
              title="PDF Preview"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setVersionManagerOpen(true)}>
            <GitBranch className="w-4 h-4 mr-2" />
            v{currentVersion}
          </Button>

          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          
          <Button size="sm" onClick={onSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </header>

      {/* Version Manager Dialog */}
      <VersionManager
        open={versionManagerOpen}
        onOpenChange={setVersionManagerOpen}
        projectId={presentation.id}
        currentVersion={currentVersion}
        slides={slides}
        onCreateVersion={handleCreateVersion}
        isCreating={createVersionWithRegeneration.isPending}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Slide List */}
        <aside className="w-64 border-r bg-background overflow-y-auto">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="text-sm font-medium">Slides</span>
            <Button variant="ghost" size="sm" onClick={handleAddSlide}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="slides">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="p-2 space-y-2"
                >
                  {slides.map((slide, index) => (
                    <Draggable key={slide.id} draggableId={slide.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            'group relative rounded-lg border overflow-hidden cursor-pointer transition-all',
                            selectedSlideId === slide.id ? 'ring-2 ring-primary' : 'hover:border-primary/50',
                            snapshot.isDragging && 'shadow-lg',
                            slide.is_hidden && 'opacity-50'
                          )}
                          onClick={() => setSelectedSlideId(slide.id)}
                        >
                          {/* Thumbnail */}
                          <div className="aspect-video bg-white relative overflow-hidden">
                            <div className="absolute inset-0 transform scale-[0.15] origin-top-left" style={{ width: '666%', height: '666%' }}>
                              <SlideRenderer
                                slide={slide}
                                brandKit={presentation.brand_kit}
                                theme={presentation.theme}
                              />
                            </div>
                          </div>
                          
                          {/* Slide number */}
                          <div className="absolute top-1 left-1 bg-black/60 text-white text-xs px-1.5 py-0.5 rounded">
                            {index + 1}
                          </div>
                          
                          {/* Actions */}
                          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              {...provided.dragHandleProps}
                              className="p-1 bg-black/60 rounded text-white hover:bg-black/80"
                            >
                              <GripVertical className="w-3 h-3" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlideUpdate({ is_hidden: !slide.is_hidden });
                              }}
                              className="p-1 bg-black/60 rounded text-white hover:bg-black/80"
                            >
                              {slide.is_hidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSlide(slide.id);
                              }}
                              className="p-1 bg-red-500/80 rounded text-white hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </aside>

        {/* Preview */}
        <main className="flex-1 bg-slate-800 flex items-center justify-center p-8 overflow-hidden">
          <div 
            className={cn(
              'bg-white shadow-2xl overflow-hidden transition-all duration-300',
              previewMode === 'mobile' 
                ? 'w-[375px] h-[667px] rounded-3xl' 
                : previewMode === 'pdf'
                ? 'w-[842px] h-[595px]' // A4 landscape ratio
                : 'w-full max-w-5xl aspect-video rounded-lg'
            )}
          >
            {selectedSlide && (
              <SlideRenderer
                slide={selectedSlide}
                brandKit={presentation.brand_kit}
                theme={presentation.theme}
                isPdfMode={previewMode === 'pdf'}
              />
            )}
          </div>
        </main>

        {/* Properties Panel */}
        <aside className="w-80 border-l bg-background overflow-y-auto">
          <Tabs defaultValue="content" className="h-full flex flex-col">
            <TabsList className="w-full rounded-none border-b h-10">
              <TabsTrigger value="content" className="flex-1">Content</TabsTrigger>
              <TabsTrigger value="style" className="flex-1">Style</TabsTrigger>
              <TabsTrigger value="settings" className="flex-1">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="flex-1 p-4 space-y-4 overflow-y-auto m-0">
              {selectedSlide && (
                <>
                  {/* Layout */}
                  <div className="space-y-2">
                    <Label>Layout</Label>
                    <Select
                      value={selectedSlide.layout}
                      onValueChange={(value) => handleSlideUpdate({ layout: value as SlideLayout })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LAYOUT_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Headline */}
                  <div className="space-y-2">
                    <Label>Headline</Label>
                    <Input
                      value={selectedSlide.headline || ''}
                      onChange={(e) => handleSlideUpdate({ headline: e.target.value })}
                      placeholder="Enter headline..."
                    />
                  </div>

                  {/* Subline */}
                  <div className="space-y-2">
                    <Label>Subline</Label>
                    <Textarea
                      value={selectedSlide.subline || ''}
                      onChange={(e) => handleSlideUpdate({ subline: e.target.value })}
                      placeholder="Enter subline..."
                      rows={2}
                    />
                  </div>

                  {/* Bullets */}
                  {(selectedSlide.layout === 'bullets' || selectedSlide.layout === 'hero') && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Bullet Points</Label>
                        <Button variant="ghost" size="sm" onClick={handleAddBullet}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {(selectedSlide.content?.bullets || []).map((bullet, idx) => (
                          <div key={idx} className="flex gap-2">
                            <Input
                              value={bullet}
                              onChange={(e) => handleBulletChange(idx, e.target.value)}
                              placeholder={`Point ${idx + 1}`}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveBullet(idx)}
                              className="flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  {selectedSlide.layout === 'stats' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Statistics</Label>
                        <Button variant="ghost" size="sm" onClick={handleAddStat}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add
                        </Button>
                      </div>
                      <div className="space-y-3">
                        {(selectedSlide.content?.stats || []).map((stat, idx) => (
                          <Card key={idx} className="p-3">
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <Input
                                  value={stat.value}
                                  onChange={(e) => handleStatChange(idx, 'value', e.target.value)}
                                  placeholder="Value"
                                  className="font-bold"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveStat(idx)}
                                  className="flex-shrink-0"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                              <Input
                                value={stat.label}
                                onChange={(e) => handleStatChange(idx, 'label', e.target.value)}
                                placeholder="Label"
                                className="text-sm"
                              />
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label>Speaker Notes</Label>
                    <Textarea
                      value={selectedSlide.notes || ''}
                      onChange={(e) => handleSlideUpdate({ notes: e.target.value })}
                      placeholder="Notes for presenter..."
                      rows={4}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="style" className="flex-1 p-4 space-y-4 overflow-y-auto m-0">
              {selectedSlide && (
                <>
                  {/* Background Color */}
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedSlide.background_color || '#ffffff'}
                        onChange={(e) => handleSlideUpdate({ background_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={selectedSlide.background_color || ''}
                        onChange={(e) => handleSlideUpdate({ background_color: e.target.value })}
                        placeholder="Use theme default"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Text Color */}
                  <div className="space-y-2">
                    <Label>Text Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={selectedSlide.text_color || '#0f172a'}
                        onChange={(e) => handleSlideUpdate({ text_color: e.target.value })}
                        className="w-12 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={selectedSlide.text_color || ''}
                        onChange={(e) => handleSlideUpdate({ text_color: e.target.value })}
                        placeholder="Use theme default"
                        className="flex-1"
                      />
                    </div>
                  </div>

                  {/* Background Image */}
                  <div className="space-y-2">
                    <Label>Background Image URL</Label>
                    <Input
                      value={selectedSlide.background_image_url || ''}
                      onChange={(e) => handleSlideUpdate({ background_image_url: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="settings" className="flex-1 p-4 space-y-4 overflow-y-auto m-0">
              {/* Presentation Settings */}
              <div className="space-y-4">
                <h3 className="font-medium">Presentation Settings</h3>
                
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={presentation.title}
                    onChange={(e) => updatePresentation.mutate({ id: presentation.id, title: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <Select
                    value={presentation.theme}
                    onValueChange={(value) => updatePresentation.mutate({ id: presentation.id, theme: value as 'light' | 'dark' })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label>Confidential</Label>
                  <Switch
                    checked={presentation.is_confidential}
                    onCheckedChange={(checked) => updatePresentation.mutate({ id: presentation.id, is_confidential: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client Name</Label>
                  <Input
                    value={presentation.client_name || ''}
                    onChange={(e) => updatePresentation.mutate({ id: presentation.id, client_name: e.target.value })}
                    placeholder="Client name..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project Code</Label>
                  <Input
                    value={presentation.project_code || ''}
                    onChange={(e) => updatePresentation.mutate({ id: presentation.id, project_code: e.target.value })}
                    placeholder="e.g., Project Alpha"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
};

export default PresentationEditor;
