import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Type, Link, Image, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ContentBlock {
  id: string;
  type: 'text' | 'cta' | 'image';
  content: string;
  ctaText?: string;
  ctaUrl?: string;
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onBlocksChange: (blocks: ContentBlock[]) => void;
  maxBlocks?: number;
}

const generateId = () => Math.random().toString(36).substring(2, 9);

export const ContentBlockEditor: React.FC<ContentBlockEditorProps> = ({
  blocks,
  onBlocksChange,
  maxBlocks = 5,
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
      ...(type === 'cta' && { ctaText: 'Leer más', ctaUrl: 'https://capittal.es' }),
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

  const moveBlock = (fromIndex: number, toIndex: number) => {
    const newBlocks = [...blocks];
    const [removed] = newBlocks.splice(fromIndex, 1);
    newBlocks.splice(toIndex, 0, removed);
    onBlocksChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Bloques de contenido</Label>
        <span className="text-xs text-muted-foreground">
          {blocks.length}/{maxBlocks} bloques
        </span>
      </div>

      {/* Blocks list */}
      <div className="space-y-3">
        {blocks.map((block, index) => (
          <Card key={block.id} className="relative">
            <CardContent className="p-4">
              <div className="flex gap-3">
                {/* Drag handle */}
                <div className="flex flex-col items-center gap-1 pt-2">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  {index > 0 && (
                    <button
                      onClick={() => moveBlock(index, index - 1)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ↑
                    </button>
                  )}
                  {index < blocks.length - 1 && (
                    <button
                      onClick={() => moveBlock(index, index + 1)}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ↓
                    </button>
                  )}
                </div>

                {/* Block content */}
                <div className="flex-1 space-y-3">
                  {block.type === 'text' && (
                    <>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4" />
                          Bloque de texto
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
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
                        placeholder="Escribe el contenido del bloque..."
                        rows={4}
                      />
                    </>
                  )}

                  {block.type === 'cta' && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link className="h-4 w-4" />
                        Botón CTA
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Texto del botón</Label>
                          <Input
                            value={block.ctaText || ''}
                            onChange={(e) =>
                              updateBlock(block.id, { ctaText: e.target.value })
                            }
                            placeholder="Ver más"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">URL del enlace</Label>
                          <Input
                            value={block.ctaUrl || ''}
                            onChange={(e) =>
                              updateBlock(block.id, { ctaUrl: e.target.value })
                            }
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {block.type === 'image' && (
                    <>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Image className="h-4 w-4" />
                        Imagen
                      </div>
                      <Input
                        value={block.content}
                        onChange={(e) =>
                          updateBlock(block.id, { content: e.target.value })
                        }
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
        ))}
      </div>

      {/* Add block buttons */}
      {blocks.length < maxBlocks && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBlock('text')}
            className="gap-2"
          >
            <Type className="h-4 w-4" />
            Añadir texto
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBlock('cta')}
            className="gap-2"
          >
            <Link className="h-4 w-4" />
            Añadir CTA
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addBlock('image')}
            className="gap-2"
          >
            <Image className="h-4 w-4" />
            Añadir imagen
          </Button>
        </div>
      )}

      {blocks.length === 0 && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No hay bloques de contenido</p>
          <p className="text-xs">Usa los botones de arriba para añadir contenido</p>
        </div>
      )}
    </div>
  );
};
