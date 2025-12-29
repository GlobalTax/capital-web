import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  GripVertical,
  Megaphone,
  ArrowLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useAcquisitionChannels, 
  CATEGORY_LABELS, 
  CATEGORY_COLORS,
  type ChannelCategory,
  type AcquisitionChannel,
} from '@/hooks/useAcquisitionChannels';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

export default function AcquisitionChannelsSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { channels, isLoading, createChannel, updateChannel, deleteChannel } = useAcquisitionChannels();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<AcquisitionChannel | null>(null);
  const [formData, setFormData] = useState({ name: '', category: 'paid' as ChannelCategory });

  const handleOpenDialog = (channel?: AcquisitionChannel) => {
    if (channel) {
      setEditingChannel(channel);
      setFormData({ name: channel.name, category: channel.category });
    } else {
      setEditingChannel(null);
      setFormData({ name: '', category: 'paid' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) return;

    try {
      if (editingChannel) {
        await updateChannel.mutateAsync({
          id: editingChannel.id,
          name: formData.name.trim(),
          category: formData.category,
        });
        toast({ title: 'Canal actualizado' });
      } else {
        await createChannel.mutateAsync({
          name: formData.name.trim(),
          category: formData.category,
        });
        toast({ title: 'Canal creado' });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo guardar el canal', variant: 'destructive' });
    }
  };

  const handleDelete = async (channel: AcquisitionChannel) => {
    if (!window.confirm(`¿Eliminar el canal "${channel.name}"?`)) return;

    try {
      await deleteChannel.mutateAsync(channel.id);
      toast({ title: 'Canal eliminado' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el canal', variant: 'destructive' });
    }
  };

  const channelsByCategory = Object.entries(
    channels.reduce((acc, channel) => {
      if (!acc[channel.category]) acc[channel.category] = [];
      acc[channel.category].push(channel);
      return acc;
    }, {} as Record<ChannelCategory, AcquisitionChannel[]>)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/settings')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Canales de Adquisición</h1>
            <p className="text-sm text-muted-foreground">
              Gestiona los canales para clasificar el origen de los contactos
            </p>
          </div>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Canal
        </Button>
      </div>

      {/* Channels by category */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <div className="grid gap-6">
          {channelsByCategory.map(([category, categoryChannels]) => (
            <Card key={category}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={cn("h-6", CATEGORY_COLORS[category as ChannelCategory])}>
                    {CATEGORY_LABELS[category as ChannelCategory]}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {categoryChannels.length} canal{categoryChannels.length !== 1 ? 'es' : ''}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12"></TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead className="w-24 text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryChannels.map((channel) => (
                      <TableRow key={channel.id}>
                        <TableCell>
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Megaphone className="h-4 w-4 text-muted-foreground" />
                            {channel.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleOpenDialog(channel)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              onClick={() => handleDelete(channel)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}

          {channelsByCategory.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay canales configurados</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crea tu primer canal de adquisición para clasificar contactos
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Crear canal
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChannel ? 'Editar Canal' : 'Nuevo Canal'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del canal</label>
              <Input
                placeholder="Ej: Meta Ads, Google Ads..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Categoría</label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as ChannelCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("h-5 text-[10px]", CATEGORY_COLORS[key as ChannelCategory])}>
                          {label}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSave}
              disabled={!formData.name.trim() || createChannel.isPending || updateChannel.isPending}
            >
              {editingChannel ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
