import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Plus, Pencil, GripVertical, ArrowUp, ArrowDown, ArrowLeft, PauseCircle, ToggleLeft,
} from 'lucide-react';
import { usePausedReasons, type PausedReason } from '@/hooks/usePausedReasons';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function PausedReasonsSettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { reasons, isLoading, createReason, updateReason, swapOrder } = usePausedReasons();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReason, setEditingReason] = useState<PausedReason | null>(null);
  const [formName, setFormName] = useState('');
  const [formActive, setFormActive] = useState(true);

  const handleOpenDialog = (reason?: PausedReason) => {
    if (reason) {
      setEditingReason(reason);
      setFormName(reason.name);
      setFormActive(reason.is_active);
    } else {
      setEditingReason(null);
      setFormName('');
      setFormActive(true);
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) return;
    try {
      if (editingReason) {
        await updateReason.mutateAsync({ id: editingReason.id, name: formName.trim(), is_active: formActive });
        toast({ title: 'Motivo actualizado' });
      } else {
        await createReason.mutateAsync(formName.trim());
        toast({ title: 'Motivo creado' });
      }
      setIsDialogOpen(false);
    } catch {
      // errors handled by hook
    }
  };

  const handleSwap = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= reasons.length) return;
    const a = reasons[index];
    const b = reasons[targetIndex];
    swapOrder.mutate({ id1: a.id, order1: a.sort_order, id2: b.id, order2: b.sort_order });
  };

  const handleToggleActive = (reason: PausedReason) => {
    updateReason.mutate({ id: reason.id, is_active: !reason.is_active });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/settings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Motivos de Deal Paused</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los motivos para marcar deals como pausados
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Motivo
        </Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : reasons.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <PauseCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No hay motivos configurados</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Crea tu primer motivo de pausa para clasificar deals
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Crear motivo
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Orden</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="w-24">Estado</TableHead>
                  <TableHead className="w-36 text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reasons.map((reason, index) => (
                  <TableRow key={reason.id} className={!reason.is_active ? 'opacity-50' : ''}>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{index + 1}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{reason.name}</TableCell>
                    <TableCell>
                      <Badge variant={reason.is_active ? 'default' : 'secondary'} className="text-xs">
                        {reason.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleOpenDialog(reason)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={index === 0} onClick={() => handleSwap(index, 'up')}>
                          <ArrowUp className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={index === reasons.length - 1} onClick={() => handleSwap(index, 'down')}>
                          <ArrowDown className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleToggleActive(reason)} title={reason.is_active ? 'Desactivar' : 'Activar'}>
                          <ToggleLeft className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingReason ? 'Editar Motivo' : 'Nuevo Motivo'}</DialogTitle>
            <DialogDescription>
              {editingReason ? 'Modifica el nombre o estado del motivo.' : 'Añade un nuevo motivo de pausa para deals.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del motivo</label>
              <Input
                placeholder="Ej: Esperando documentación, Revisión interna..."
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              />
            </div>
            {editingReason && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Activo</label>
                <Switch checked={formActive} onCheckedChange={setFormActive} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSave}
              disabled={!formName.trim() || createReason.isPending || updateReason.isPending}
            >
              {editingReason ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
