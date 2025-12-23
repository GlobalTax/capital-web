import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Type, Link, Image, Sparkles, Loader2, Minus, Quote, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

export type CTAStyle = 'primary' | 'secondary' | 'outline' | 'minimal';

export interface ContentBlock {
  id: string;
  type: 'text' | 'cta' | 'image' | 'divider' | 'quote' | 'list';
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  ctaStyle?: CTAStyle;
  listItems?: string[];
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
  maxBlocks?: number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

const ctaStyles: { value: CTAStyle; label: string; preview: string }[] = [
  { value: 'primary', label: 'Primary', preview: 'bg-slate-900 text-white' },
  { value: 'secondary', label: 'Secondary', preview: 'bg-slate-200 text-slate-900' },
  { value: 'outline', label: 'Outline', preview: 'bg-transparent border-2 border-slate-900 text-slate-900' },
  { value: 'minimal', label: 'Minimal', preview: 'bg-transparent text-slate-900 underline' },
];

export const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  blocks,
  onBlocksChange,
  maxBlocks = 10,
}) => {
  const [generatingBlockId, setGeneratingBlockId] = useState<string | null>(null);
  const { toast } = useToast();

  const generateBlockContent = async (blockId: string, existingContent?: string) => {
    setGeneratingBlockId(blockId);
    try {
      const { data, error } = await supabase.functions.invoke('ai-content-studio', {
        body: {
          type: 'newsletter',
          template: existingContent ? 'newsletter-improve' : 'newsletter-text-block',
          prompt: existingContent || 'Genera un párrafo informativo para un newsletter de M&A.',
          options: { temperature: 0.7, maxTokens: 500 }
        }
      });

      if (error) throw error;

      onBlocksChange(
        blocks.map((block) =>
          block.id === blockId ? { ...block, content: data.content } : block
        )
      );

      toast({
        title: "✨ Contenido generado",
        description: existingContent ? "Texto mejorado con IA" : "Nuevo contenido generado con IA",
      });
    } catch (error) {
      console.error('Error generating block content:', error);
      toast({
        title: "Error al generar",
        description: "No se pudo generar el contenido",
        variant: "destructive",
      });
    } finally {
      setGeneratingBlockId(null);
    }
  };

  const addBlock = (type: ContentBlock['type']) => {
    if (blocks.length >= maxBlocks) return;

    const newBlock: ContentBlock = {
      id: generateId(),
      type,
      content: '',
      ...(type === 'cta' && { ctaText: 'Leer más', ctaUrl: 'https://capittal.es', ctaStyle: 'primary' as CTAStyle }),
      ...(type === 'list' && { listItems: [''] }),
    };
    onBlocksChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<ContentBlock>) => {
    onBlocksChange(
      blocks.map((block) =>
        block.id === id ? { ...block, ...updates } : block
      )
    );
  };

  const removeBlock = (id: string) => {
    onBlocksChange(blocks.filter((block) => block.id !== id));
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(result.source.index, 1);
    newBlocks.splice(result.destination.index, 0, removed);
    onBlocksChange(newBlocks);
  };

  const updateListItem = (blockId: string, itemIndex: number, value: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.listItems) return;
    
    const newItems = [...block.listItems];
    newItems[itemIndex] = value;
    updateBlock(blockId, { listItems: newItems });
  };

  const addListItem = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block) return;
    
    const newItems = [...(block.listItems || []), ''];
    updateBlock(blockId, { listItems: newItems });
  };

  const removeListItem = (blockId: string, itemIndex: number) => {
    const block = blocks.find(b => b.id === blockId);
    if (!block || !block.listItems || block.listItems.length <= 1) return;
    
    const newItems = block.listItems.filter((_, i) => i !== itemIndex);
    updateBlock(blockId, { listItems: newItems });
  };

  const getBlockIcon = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />;
      case 'cta': return <Link className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'divider': return <Minus className="h-4 w-4" />;
      case 'quote': return <Quote className="h-4 w-4" />;
      case 'list': return <List className="h-4 w-4" />;
      default: return <Type className="h-4 w-4" />;
    }
  };

  const getBlockLabel = (type: ContentBlock['type']) => {
    switch (type) {
      case 'text': return 'Bloque de texto';
      case 'cta': return 'Botón CTA';
      case 'image': return 'Imagen';
      case 'divider': return 'Separador';
      case 'quote': return 'Cita destacada';
      case 'list': return 'Lista con viñetas';
      default: return 'Bloque';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Bloques de contenido</Label>
        <span className="text-xs text-muted-foreground">
          {blocks.length}/{maxBlocks} bloques
        </span>
      </div>

      {/* Blocks list with Drag and Drop */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="blocks">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-3"
            >
              {blocks.map((block, index) => (
                <Draggable key={block.id} draggableId={block.id} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`relative ${snapshot.isDragging ? 'shadow-lg ring-2 ring-primary/20' : ''}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          {/* Drag handle */}
                          <div
                            {...provided.dragHandleProps}
                            className="flex items-center pt-2 cursor-grab active:cursor-grabbing"
                          >
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>

                          {/* Block content */}
                          <div className="flex-1 space-y-3">
                            {/* Text Block */}
                            {block.type === 'text' && (
                              <>
                                <div className="flex items-center justify-between text-sm text-muted-foreground">
                                  <div className="flex items-center gap-2">
                                    {getBlockIcon(block.type)}
                                    {getBlockLabel(block.type)}
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => generateBlockContent(block.id, block.content || undefined)}
                                    disabled={generatingBlockId === block.id}
                                    className="h-7 px-2 text-primary hover:text-primary hover:bg-primary/10"
                                  >
                                    {generatingBlockId === block.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                    ) : (
                                      <Sparkles className="h-4 w-4 mr-1" />
                                    )}
                                    {block.content ? 'Mejorar' : 'Generar'}
                                  </Button>
                                </div>
                                <Textarea
                                  value={block.content}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  placeholder="Escribe el contenido del bloque..."
                                  rows={4}
                                />
                              </>
                            )}

                            {/* CTA Block */}
                            {block.type === 'cta' && (
                              <>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {getBlockIcon(block.type)}
                                  {getBlockLabel(block.type)}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <Label className="text-xs">Texto del botón</Label>
                                    <Input
                                      value={block.ctaText || ''}
                                      onChange={(e) => updateBlock(block.id, { ctaText: e.target.value })}
                                      placeholder="Ver más"
                                    />
                                  </div>
                                  <div>
                                    <Label className="text-xs">URL del enlace</Label>
                                    <Input
                                      value={block.ctaUrl || ''}
                                      onChange={(e) => updateBlock(block.id, { ctaUrl: e.target.value })}
                                      placeholder="https://..."
                                    />
                                  </div>
                                </div>
                                {/* CTA Style Selector */}
                                <div>
                                  <Label className="text-xs mb-2 block">Estilo del botón</Label>
                                  <div className="flex gap-2">
                                    {ctaStyles.map((style) => (
                                      <button
                                        key={style.value}
                                        type="button"
                                        onClick={() => updateBlock(block.id, { ctaStyle: style.value })}
                                        className={`px-3 py-1.5 text-xs rounded-md transition-all ${style.preview} ${
                                          block.ctaStyle === style.value
                                            ? 'ring-2 ring-primary ring-offset-2'
                                            : 'opacity-70 hover:opacity-100'
                                        }`}
                                      >
                                        {style.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Image Block */}
                            {block.type === 'image' && (
                              <>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {getBlockIcon(block.type)}
                                  {getBlockLabel(block.type)}
                                </div>
                                <Input
                                  value={block.content}
                                  onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                  placeholder="URL de la imagen..."
                                />
                                {block.content && (
                                  <img
                                    src={block.content}
                                    alt="Preview"
                                    className="w-full h-32 object-cover rounded-lg border"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                )}
                              </>
                            )}

                            {/* Divider Block */}
                            {block.type === 'divider' && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {getBlockIcon(block.type)}
                                {getBlockLabel(block.type)}
                                <div className="flex-1 border-t border-muted-foreground/30 mx-2" />
                              </div>
                            )}

                            {/* Quote Block */}
                            {block.type === 'quote' && (
                              <>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {getBlockIcon(block.type)}
                                  {getBlockLabel(block.type)}
                                </div>
                                <div className="border-l-4 border-primary/50 pl-4">
                                  <Textarea
                                    value={block.content}
                                    onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                                    placeholder="Escribe una cita destacada..."
                                    rows={2}
                                    className="italic"
                                  />
                                </div>
                              </>
                            )}

                            {/* List Block */}
                            {block.type === 'list' && (
                              <>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  {getBlockIcon(block.type)}
                                  {getBlockLabel(block.type)}
                                </div>
                                <div className="space-y-2">
                                  {(block.listItems || ['']).map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center gap-2">
                                      <span className="text-muted-foreground">•</span>
                                      <Input
                                        value={item}
                                        onChange={(e) => updateListItem(block.id, itemIndex, e.target.value)}
                                        placeholder={`Ítem ${itemIndex + 1}`}
                                        className="flex-1"
                                      />
                                      {(block.listItems?.length || 0) > 1 && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                          onClick={() => removeListItem(block.id, itemIndex)}
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  ))}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => addListItem(block.id)}
                                    className="text-xs text-muted-foreground"
                                  >
                                    <Plus className="h-3.5 w-3.5 mr-1" />
                                    Añadir ítem
                                  </Button>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Delete button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeBlock(block.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add block buttons */}
      {blocks.length < maxBlocks && (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => addBlock('text')} className="gap-2">
            <Type className="h-4 w-4" />
            Texto
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('cta')} className="gap-2">
            <Link className="h-4 w-4" />
            CTA
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('image')} className="gap-2">
            <Image className="h-4 w-4" />
            Imagen
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('divider')} className="gap-2">
            <Minus className="h-4 w-4" />
            Separador
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('quote')} className="gap-2">
            <Quote className="h-4 w-4" />
            Cita
          </Button>
          <Button variant="outline" size="sm" onClick={() => addBlock('list')} className="gap-2">
            <List className="h-4 w-4" />
            Lista
          </Button>
        </div>
      )}

      {blocks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay bloques de contenido</p>
          <p className="text-xs">Arrastra para reordenar o usa los botones para añadir contenido</p>
        </div>
      )}
    </div>
  );
};