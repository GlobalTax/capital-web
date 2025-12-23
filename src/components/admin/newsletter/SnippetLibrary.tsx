import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Code, Copy, Check, Edit2 } from 'lucide-react';

interface Snippet {
  id: string;
  name: string;
  category: string;
  description: string | null;
  html_content: string;
  is_default: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

const CATEGORIES = [
  { value: 'header', label: 'Headers' },
  { value: 'footer', label: 'Footers' },
  { value: 'cta', label: 'CTAs' },
  { value: 'divider', label: 'Separadores' },
  { value: 'signature', label: 'Firmas' },
  { value: 'social', label: 'Redes Sociales' },
  { value: 'content', label: 'Contenido' },
];

const categoryColors: Record<string, string> = {
  header: 'bg-blue-100 text-blue-800',
  footer: 'bg-green-100 text-green-800',
  cta: 'bg-purple-100 text-purple-800',
  divider: 'bg-gray-100 text-gray-800',
  signature: 'bg-amber-100 text-amber-800',
  social: 'bg-pink-100 text-pink-800',
  content: 'bg-indigo-100 text-indigo-800',
};

export const SnippetLibrary: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState<Snippet | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: 'content',
    description: '',
    html_content: '',
  });

  const { data: snippets, isLoading } = useQuery({
    queryKey: ['newsletter-snippets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('newsletter_snippets')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('display_order');
      
      if (error) throw error;
      return data as Snippet[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from('newsletter_snippets')
        .insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-snippets'] });
      toast({ title: '✓ Snippet creado' });
      setIsCreateOpen(false);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo crear el snippet', variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from('newsletter_snippets')
        .update(data)
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-snippets'] });
      toast({ title: '✓ Snippet actualizado' });
      setEditingSnippet(null);
      resetForm();
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo actualizar el snippet', variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('newsletter_snippets')
        .update({ is_active: false })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['newsletter-snippets'] });
      toast({ title: '✓ Snippet eliminado' });
    },
    onError: () => {
      toast({ title: 'Error', description: 'No se pudo eliminar el snippet', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ name: '', category: 'content', description: '', html_content: '' });
  };

  const handleCopy = async (snippet: Snippet) => {
    await navigator.clipboard.writeText(snippet.html_content);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({ title: '📋 HTML copiado' });
  };

  const handleEdit = (snippet: Snippet) => {
    setFormData({
      name: snippet.name,
      category: snippet.category,
      description: snippet.description || '',
      html_content: snippet.html_content,
    });
    setEditingSnippet(snippet);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.html_content) {
      toast({ title: 'Error', description: 'Nombre y HTML son requeridos', variant: 'destructive' });
      return;
    }

    if (editingSnippet) {
      updateMutation.mutate({ id: editingSnippet.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredSnippets = snippets?.filter(
    s => selectedCategory === 'all' || s.category === selectedCategory
  );

  const SnippetForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Nombre</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Mi snippet"
          />
        </div>
        <div>
          <Label>Categoría</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Descripción (opcional)</Label>
        <Input
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Descripción breve..."
        />
      </div>
      <div>
        <Label>Código HTML</Label>
        <Textarea
          value={formData.html_content}
          onChange={(e) => setFormData({ ...formData, html_content: e.target.value })}
          placeholder="<table>...</table>"
          rows={10}
          className="font-mono text-xs"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => { setEditingSnippet(null); setIsCreateOpen(false); resetForm(); }}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
          {editingSnippet ? 'Actualizar' : 'Crear'} Snippet
        </Button>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Biblioteca de Snippets HTML
        </CardTitle>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Snippet
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Snippet</DialogTitle>
            </DialogHeader>
            <SnippetForm />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Category Filter */}
        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            variant={selectedCategory === 'all' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            Todos
          </Button>
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Snippets Grid */}
        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Cargando...</div>
          ) : filteredSnippets?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No hay snippets en esta categoría</div>
          ) : (
            <div className="grid gap-3">
              {filteredSnippets?.map((snippet) => (
                <div
                  key={snippet.id}
                  className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{snippet.name}</span>
                      <Badge variant="secondary" className={`text-xs ${categoryColors[snippet.category] || ''}`}>
                        {CATEGORIES.find(c => c.value === snippet.category)?.label || snippet.category}
                      </Badge>
                      {snippet.is_default && (
                        <Badge variant="outline" className="text-xs">Default</Badge>
                      )}
                    </div>
                    {snippet.description && (
                      <p className="text-xs text-muted-foreground truncate">{snippet.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(snippet)}
                    >
                      {copiedId === snippet.id ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Dialog open={editingSnippet?.id === snippet.id} onOpenChange={(open) => !open && setEditingSnippet(null)}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(snippet)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Editar Snippet</DialogTitle>
                        </DialogHeader>
                        <SnippetForm />
                      </DialogContent>
                    </Dialog>
                    {!snippet.is_default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMutation.mutate(snippet.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};