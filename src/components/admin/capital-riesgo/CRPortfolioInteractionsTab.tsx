// ============= CR PORTFOLIO INTERACTIONS TAB =============
// Pestaña de historial de comunicaciones con una empresa del portfolio

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Linkedin,
  Plus,
  Clock,
  Trash2,
  MessageSquare,
  Loader2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useCRPortfolioInteractions,
  useCreateCRPortfolioInteraction,
  useDeleteCRPortfolioInteraction,
  type InteractionType,
  type CRPortfolioInteraction,
} from '@/hooks/useCRPortfolioInteractions';

interface CRPortfolioInteractionsTabProps {
  portfolioId: string;
  companyName: string;
}

const INTERACTION_ICONS: Record<InteractionType, React.ReactNode> = {
  email: <Mail className="h-4 w-4" />,
  call: <Phone className="h-4 w-4" />,
  meeting: <Calendar className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
};

const INTERACTION_LABELS: Record<InteractionType, string> = {
  email: 'Email',
  call: 'Llamada',
  meeting: 'Reunión',
  note: 'Nota',
  linkedin: 'LinkedIn',
};

const INTERACTION_COLORS: Record<InteractionType, string> = {
  email: 'bg-blue-500/10 text-blue-700 border-blue-200',
  call: 'bg-green-500/10 text-green-700 border-green-200',
  meeting: 'bg-purple-500/10 text-purple-700 border-purple-200',
  note: 'bg-yellow-500/10 text-yellow-700 border-yellow-200',
  linkedin: 'bg-sky-500/10 text-sky-700 border-sky-200',
};

function InteractionCard({ 
  interaction, 
  onDelete 
}: { 
  interaction: CRPortfolioInteraction; 
  onDelete: () => void;
}) {
  const sentDate = new Date(interaction.sent_at);
  const type = interaction.interaction_type as InteractionType;

  return (
    <div className="border rounded-lg p-4 hover:bg-muted/30 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className={`p-2 rounded-lg ${INTERACTION_COLORS[type]}`}>
            {INTERACTION_ICONS[type]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className={`text-xs ${INTERACTION_COLORS[type]}`}>
                {INTERACTION_LABELS[type]}
              </Badge>
              {interaction.contact_name && (
                <span className="text-xs text-muted-foreground truncate">
                  con {interaction.contact_name}
                </span>
              )}
            </div>
            {interaction.subject && (
              <p className="font-medium text-sm mb-1">{interaction.subject}</p>
            )}
            {interaction.body && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {interaction.body}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span title={format(sentDate, "d 'de' MMMM 'de' yyyy, HH:mm", { locale: es })}>
                {formatDistanceToNow(sentDate, { addSuffix: true, locale: es })}
              </span>
              {interaction.contact_email && (
                <>
                  <span>·</span>
                  <span className="truncate">{interaction.contact_email}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function AddInteractionDialog({ 
  portfolioId, 
  companyName,
  onSuccess 
}: { 
  portfolioId: string;
  companyName: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<InteractionType>('note');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const createInteraction = useCreateCRPortfolioInteraction();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await createInteraction.mutateAsync({
      portfolio_id: portfolioId,
      interaction_type: type,
      subject: subject || undefined,
      body: body || undefined,
      contact_name: contactName || undefined,
      contact_email: contactEmail || undefined,
    });

    // Reset form
    setType('note');
    setSubject('');
    setBody('');
    setContactName('');
    setContactEmail('');
    setOpen(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nueva interacción
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar interacción</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Con {companyName}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label>Tipo de interacción</Label>
            <Select value={type} onValueChange={(v) => setType(v as InteractionType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(INTERACTION_LABELS) as InteractionType[]).map((t) => (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      {INTERACTION_ICONS[t]}
                      {INTERACTION_LABELS[t]}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Contacto (nombre)</Label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>
            <div className="space-y-2">
              <Label>Email del contacto</Label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@ejemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asunto</Label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Breve descripción"
            />
          </div>

          <div className="space-y-2">
            <Label>Contenido / Notas</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Detalles de la interacción..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createInteraction.isPending}>
              {createInteraction.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CRPortfolioInteractionsTab({ portfolioId, companyName }: CRPortfolioInteractionsTabProps) {
  const { data: interactions, isLoading, refetch } = useCRPortfolioInteractions(portfolioId);
  const deleteInteraction = useDeleteCRPortfolioInteraction();

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta interacción?')) return;
    await deleteInteraction.mutateAsync({ id, portfolioId });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {interactions?.length || 0} interacciones registradas
          </span>
        </div>
        <AddInteractionDialog 
          portfolioId={portfolioId} 
          companyName={companyName}
          onSuccess={refetch}
        />
      </div>

      {interactions && interactions.length > 0 ? (
        <div className="space-y-3">
          {interactions.map((interaction) => (
            <InteractionCard
              key={interaction.id}
              interaction={interaction}
              onDelete={() => handleDelete(interaction.id)}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              No hay interacciones registradas con esta empresa
            </p>
            <AddInteractionDialog 
              portfolioId={portfolioId} 
              companyName={companyName}
              onSuccess={refetch}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
