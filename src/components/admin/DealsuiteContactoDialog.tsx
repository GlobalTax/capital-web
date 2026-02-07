import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import type { DealsuiteContacto } from '@/hooks/useDealsuiteEmpresas';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contacto?: DealsuiteContacto | null;
  empresaId: string;
  onSave: (data: Partial<DealsuiteContacto> & { empresa_id: string }) => void;
  isSaving?: boolean;
}

export const DealsuiteContactoDialog = ({ open, onOpenChange, contacto, empresaId, onSave, isSaving }: Props) => {
  const [nombre, setNombre] = useState(contacto?.nombre || '');
  const [cargo, setCargo] = useState(contacto?.cargo || '');
  const [email, setEmail] = useState(contacto?.email || '');
  const [telefono, setTelefono] = useState(contacto?.telefono || '');
  const [notas, setNotas] = useState(contacto?.notas || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(contacto?.id ? { id: contacto.id } : {}),
      nombre: nombre.trim() || 'Sin nombre',
      cargo: cargo.trim() || null,
      email: email.trim() || null,
      telefono: telefono.trim() || null,
      notas: notas.trim() || null,
      empresa_id: empresaId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{contacto ? 'Editar contacto' : 'Nuevo contacto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="c-nombre">Nombre</Label>
            <Input id="c-nombre" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre completo" />
          </div>
          <div>
            <Label htmlFor="c-cargo">Cargo</Label>
            <Input id="c-cargo" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="Ej: Managing Partner" />
          </div>
          <div>
            <Label htmlFor="c-email">Email</Label>
            <Input id="c-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@ejemplo.com" />
          </div>
          <div>
            <Label htmlFor="c-telefono">Teléfono</Label>
            <Input id="c-telefono" value={telefono} onChange={e => setTelefono(e.target.value)} placeholder="+34..." />
          </div>
          <div>
            <Label htmlFor="c-notas">Notas</Label>
            <Textarea id="c-notas" value={notas} onChange={e => setNotas(e.target.value)} rows={2} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              {contacto ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
