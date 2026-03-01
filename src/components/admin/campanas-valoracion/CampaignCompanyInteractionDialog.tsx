import { useState } from 'react';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2 } from 'lucide-react';
import {
  useCampaignCompanyInteractions,
  INTERACTION_TYPES,
  INTERACTION_RESULTS,
  FOLLOW_UP_STATUSES,
  CampaignCompanyInteraction,
} from '@/hooks/useCampaignCompanyInteractions';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignCompanyId: string;
  companyName: string;
  currentFollowUpStatus?: string;
}

export function CampaignCompanyInteractionDialog({
  open, onOpenChange, campaignCompanyId, companyName, currentFollowUpStatus,
}: Props) {
  const { interactions, isLoading, addInteraction, deleteInteraction, isAdding, isDeleting } = useCampaignCompanyInteractions(campaignCompanyId);

  const [tipo, setTipo] = useState<string>('email_followup');
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [resultado, setResultado] = useState<string>('sin_respuesta');
  const [followUpStatus, setFollowUpStatus] = useState<string>(currentFollowUpStatus || 'none');

  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    await addInteraction({
      campaign_company_id: campaignCompanyId,
      tipo,
      titulo: titulo.trim(),
      descripcion: descripcion.trim() || undefined,
      resultado,
      follow_up_status: followUpStatus,
    });
    setTitulo('');
    setDescripcion('');
  };

  const handleDelete = async (interaction: CampaignCompanyInteraction) => {
    await deleteInteraction({ id: interaction.id, campaignCompanyId });
  };

  const getTypeInfo = (t: string) => INTERACTION_TYPES.find(it => it.value === t);
  const getResultInfo = (r: string) => INTERACTION_RESULTS.find(ir => ir.value === r);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-base">Seguimiento — {companyName}</DialogTitle>
        </DialogHeader>

        {/* New interaction form */}
        <div className="space-y-3 border rounded-lg p-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERACTION_TYPES.map(t => (
                    <SelectItem key={t.value} value={t.value} className="text-xs">
                      {t.icon} {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Resultado</Label>
              <Select value={resultado} onValueChange={setResultado}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INTERACTION_RESULTS.map(r => (
                    <SelectItem key={r.value} value={r.value} className="text-xs">
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Título</Label>
            <Input
              className="h-8 text-xs"
              placeholder="Ej: 2º correo enviado, Llamada - no contesta..."
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs">Notas (opcional)</Label>
            <Textarea
              className="text-xs min-h-[60px]"
              placeholder="Detalles adicionales..."
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
            />
          </div>

          <div>
            <Label className="text-xs">Estado de seguimiento</Label>
            <Select value={followUpStatus} onValueChange={setFollowUpStatus}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOLLOW_UP_STATUSES.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" onClick={handleSubmit} disabled={!titulo.trim() || isAdding} className="w-full">
            {isAdding ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : null}
            Registrar interacción
          </Button>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto space-y-2 mt-2">
          {isLoading ? (
            <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : interactions.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">Sin interacciones registradas</p>
          ) : (
            interactions.map(interaction => {
              const typeInfo = getTypeInfo(interaction.tipo);
              const resultInfo = interaction.resultado ? getResultInfo(interaction.resultado) : null;
              return (
                <div key={interaction.id} className="flex items-start gap-2 p-2 rounded border bg-background text-xs group">
                  <span className="text-base mt-0.5">{typeInfo?.icon || '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium">{interaction.titulo}</span>
                      {resultInfo && (
                        <Badge variant="secondary" className={`text-[10px] ${resultInfo.color}`}>
                          {resultInfo.label}
                        </Badge>
                      )}
                    </div>
                    {interaction.descripcion && (
                      <p className="text-muted-foreground mt-0.5">{interaction.descripcion}</p>
                    )}
                    <p className="text-muted-foreground mt-0.5">
                      {format(new Date(interaction.fecha), "d MMM yyyy · HH:mm", { locale: es })}
                    </p>
                  </div>
                  <Button
                    variant="ghost" size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 shrink-0"
                    onClick={() => handleDelete(interaction)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
