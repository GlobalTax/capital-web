import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import ImageUploadField from '@/components/admin/ImageUploadField';

interface PracticeAreaCard {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  href: string;
  display_order: number;
  is_active: boolean;
}

const PracticeAreasManager: React.FC = () => {
  const queryClient = useQueryClient();
  const [editCard, setEditCard] = useState<PracticeAreaCard | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', image_url: '', href: '', is_active: true });

  const { data: cards = [], isLoading } = useQuery({
    queryKey: ['practice-area-cards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('practice_area_cards')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data as PracticeAreaCard[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (card: typeof form & { id?: string }) => {
      if (card.id) {
        const { error } = await supabase.from('practice_area_cards').update({
          title: card.title,
          description: card.description,
          image_url: card.image_url || null,
          href: card.href,
          is_active: card.is_active,
        }).eq('id', card.id);
        if (error) throw error;
      } else {
        const maxOrder = cards.length > 0 ? Math.max(...cards.map(c => c.display_order)) : 0;
        const { error } = await supabase.from('practice_area_cards').insert({
          title: card.title,
          description: card.description,
          image_url: card.image_url || null,
          href: card.href,
          is_active: card.is_active,
          display_order: maxOrder + 1,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-area-cards'] });
      toast.success('Tarjeta guardada');
      closeDialog();
    },
    onError: () => toast.error('Error al guardar'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('practice_area_cards').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['practice-area-cards'] });
      toast.success('Tarjeta eliminada');
    },
  });

  const openNew = () => {
    setEditCard(null);
    setForm({ title: '', description: '', image_url: '', href: '', is_active: true });
    setIsDialogOpen(true);
  };

  const openEdit = (card: PracticeAreaCard) => {
    setEditCard(card);
    setForm({
      title: card.title,
      description: card.description,
      image_url: card.image_url || '',
      href: card.href,
      is_active: card.is_active,
    });
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditCard(null);
  };

  const handleSave = () => {
    if (!form.title || !form.href) {
      toast.error('Título y enlace son obligatorios');
      return;
    }
    saveMutation.mutate({ ...form, id: editCard?.id });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Áreas de Práctica</h1>
          <p className="text-sm text-muted-foreground">Gestiona las tarjetas de servicios de la home</p>
        </div>
        <Button onClick={openNew} size="sm">
          <Plus className="w-4 h-4 mr-1" /> Nueva tarjeta
        </Button>
      </div>

      <div className="space-y-3">
        {cards.map((card) => (
          <Card key={card.id} className={!card.is_active ? 'opacity-50' : ''}>
            <CardContent className="p-4 flex items-center gap-4">
              <GripVertical className="w-5 h-5 text-muted-foreground shrink-0" />
              {card.image_url && (
                <img src={card.image_url} alt={card.title} className="w-16 h-12 object-cover rounded" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{card.title}</p>
                <p className="text-xs text-muted-foreground truncate">{card.description}</p>
                <p className="text-xs text-muted-foreground/60">{card.href}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(card)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (confirm('¿Eliminar esta tarjeta?')) deleteMutation.mutate(card.id);
                  }}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editCard ? 'Editar tarjeta' : 'Nueva tarjeta'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Título</label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Descripción (hover)</label>
              <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} />
            </div>
            <div>
              <label className="text-sm font-medium">Enlace</label>
              <Input value={form.href} onChange={e => setForm(f => ({ ...f, href: e.target.value }))} placeholder="/servicios/..." />
            </div>
            <ImageUploadField
              label="Imagen"
              value={form.image_url || undefined}
              onChange={(url) => setForm(f => ({ ...f, image_url: url || '' }))}
              folder="practice-areas"
            />
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active} onCheckedChange={v => setForm(f => ({ ...f, is_active: v }))} />
              <span className="text-sm">Activa</span>
            </div>
            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full">
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PracticeAreasManager;
