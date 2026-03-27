import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useCollaboratorTestimonials, useCollaboratorTestimonialsMutations, CollaboratorTestimonial } from '@/hooks/useCollaboratorTestimonials';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Star, Eye, EyeOff, Loader2 } from 'lucide-react';

const emptyForm = {
  name: '',
  position: '',
  company: '',
  sector: '',
  rating: 5,
  testimonial_text: '',
  joined_year: new Date().getFullYear().toString(),
  avatar_initials: '',
  is_active: true,
  display_order: 0,
};

const CollaboratorTestimonialsManager = () => {
  const { data: testimonials, isLoading } = useCollaboratorTestimonials(false);
  const { upsert, remove, toggleActive } = useCollaboratorTestimonialsMutations();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openNew = () => {
    setEditingId(null);
    setForm({ ...emptyForm, display_order: (testimonials?.length || 0) + 1 });
    setDialogOpen(true);
  };

  const openEdit = (t: CollaboratorTestimonial) => {
    setEditingId(t.id);
    setForm({
      name: t.name,
      position: t.position,
      company: t.company,
      sector: t.sector,
      rating: t.rating,
      testimonial_text: t.testimonial_text,
      joined_year: t.joined_year,
      avatar_initials: t.avatar_initials,
      is_active: t.is_active,
      display_order: t.display_order,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.testimonial_text) {
      toast({ title: 'Error', description: 'Nombre y texto son obligatorios', variant: 'destructive' });
      return;
    }
    try {
      await upsert.mutateAsync({ ...form, ...(editingId ? { id: editingId } : {}) });
      toast({ title: editingId ? 'Actualizado' : 'Creado', description: 'Testimonio guardado correctamente' });
      setDialogOpen(false);
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este testimonio?')) return;
    try {
      await remove.mutateAsync(id);
      toast({ title: 'Eliminado' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !current });
      toast({ title: !current ? 'Activado' : 'Desactivado' });
    } catch {
      toast({ title: 'Error', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testimonios Colaboradores</h2>
          <p className="text-muted-foreground">Gestiona los testimonios de la sección "Lo que dicen nuestros colaboradores"</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" /> Añadir Testimonio
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {testimonials?.map((t) => (
          <div
            key={t.id}
            className={`border rounded-lg p-5 space-y-3 ${t.is_active ? 'bg-card' : 'bg-muted/50 opacity-60'}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">Orden: {t.display_order}</span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3">"{t.testimonial_text}"</p>

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">
                {t.avatar_initials}
              </div>
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.position} · {t.company}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-xs text-muted-foreground">{t.sector} · Desde {t.joined_year}</span>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => handleToggle(t.id, t.is_active)}>
                  {t.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(t)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleDelete(t.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Editar' : 'Nuevo'} Testimonio</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nombre *</Label>
                <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value, avatar_initials: e.target.value.split(' ').map(n => n[0] || '').join('').toUpperCase().slice(0, 2) })} />
              </div>
              <div>
                <Label>Iniciales Avatar</Label>
                <Input value={form.avatar_initials} onChange={e => setForm({ ...form, avatar_initials: e.target.value.toUpperCase() })} maxLength={3} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cargo</Label>
                <Input value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} />
              </div>
              <div>
                <Label>Empresa</Label>
                <Input value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Sector</Label>
                <Input value={form.sector} onChange={e => setForm({ ...form, sector: e.target.value })} />
              </div>
              <div>
                <Label>Año incorporación</Label>
                <Input value={form.joined_year} onChange={e => setForm({ ...form, joined_year: e.target.value })} />
              </div>
              <div>
                <Label>Rating (1-5)</Label>
                <Input type="number" min={1} max={5} value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <Label>Orden</Label>
              <Input type="number" value={form.display_order} onChange={e => setForm({ ...form, display_order: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Texto del testimonio *</Label>
              <Textarea rows={4} value={form.testimonial_text} onChange={e => setForm({ ...form, testimonial_text: e.target.value })} />
            </div>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {editingId ? 'Guardar Cambios' : 'Crear Testimonio'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollaboratorTestimonialsManager;
