import React, { useState } from 'react';
import { useOutboundPipelineStages, OutboundPipelineStage } from '@/hooks/useOutboundPipelineStages';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Settings2, Plus, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';

export function OutboundStagesEditor() {
  const { stages, createStage, updateStage, deleteStage } = useOutboundPipelineStages();
  const [open, setOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newColor, setNewColor] = useState('#6b7280');

  const handleCreate = () => {
    if (!newLabel.trim()) return;
    const key = newLabel.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
    if (stages.some(s => s.stage_key === key)) {
      toast.error('Ya existe una etapa con esa clave');
      return;
    }
    createStage.mutate({ stage_key: key, label: newLabel.trim(), color: newColor, icon: 'Circle' });
    setNewLabel('');
    setNewColor('#6b7280');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs gap-1.5">
          <Settings2 className="h-3.5 w-3.5" />
          Gestionar etapas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Etapas del Pipeline</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {stages.map(stage => (
            <StageRow
              key={stage.id}
              stage={stage}
              onToggle={(active) => updateStage.mutate({ id: stage.id, is_active: active })}
              onDelete={() => deleteStage.mutate(stage.id)}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 pt-3 border-t">
          <Input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            placeholder="Nueva etapa..."
            className="h-8 text-sm flex-1"
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <input
            type="color"
            value={newColor}
            onChange={e => setNewColor(e.target.value)}
            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
          />
          <Button size="sm" className="h-8" onClick={handleCreate} disabled={!newLabel.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function StageRow({ stage, onToggle, onDelete }: {
  stage: OutboundPipelineStage;
  onToggle: (active: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-muted/30">
      <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
      <span className="text-sm flex-1 truncate">{stage.label}</span>
      <Switch
        checked={stage.is_active}
        onCheckedChange={onToggle}
        className="scale-75"
      />
      {!stage.is_system && (
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onDelete}>
          <Trash2 className="h-3 w-3 text-destructive" />
        </Button>
      )}
    </div>
  );
}
