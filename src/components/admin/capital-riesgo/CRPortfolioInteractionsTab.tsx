// ============= CR PORTFOLIO INTERACTIONS TAB =============
// Pestaña de historial de comunicaciones con una empresa del portfolio
// Soporta: Crear, Editar, Eliminar interacciones

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Mail,
  Phone,
  Calendar,
  FileText,
  Linkedin,
  Plus,
  Clock,
  MessageSquare,
  Loader2,
  MoreVertical,
  Pencil,
  Trash2,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  useCRPortfolioInteractions,
  useCreateCRPortfolioInteraction,
  useUpdateCRPortfolioInteraction,
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

// ============= INTERACTION CARD =============
function InteractionCard({ 
  interaction, 
  onEdit,
  onDelete,
}: { 
  interaction: CRPortfolioInteraction; 
  onEdit: () => void;
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
        
        {/* Kebab Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

// ============= INTERACTION FORM (shared between Add/Edit) =============
interface InteractionFormProps {
  mode: 'create' | 'edit';
  initialData?: CRPortfolioInteraction;
  portfolioId: string;
  companyName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function InteractionForm({
  mode,
  initialData,
  portfolioId,
  companyName,
  onSuccess,
  onCancel,
}: InteractionFormProps) {
  const [type, setType] = useState<InteractionType>(
    initialData?.interaction_type || 'note'
  );
  const [subject, setSubject] = useState(initialData?.subject || '');
  const [body, setBody] = useState(initialData?.body || '');
  const [contactName, setContactName] = useState(initialData?.contact_name || '');
  const [contactEmail, setContactEmail] = useState(initialData?.contact_email || '');
  const [sentAt, setSentAt] = useState(
    initialData?.sent_at 
      ? format(new Date(initialData.sent_at), "yyyy-MM-dd'T'HH:mm")
      : format(new Date(), "yyyy-MM-dd'T'HH:mm")
  );

  const createInteraction = useCreateCRPortfolioInteraction();
  const updateInteraction = useUpdateCRPortfolioInteraction();

  const isLoading = createInteraction.isPending || updateInteraction.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (mode === 'create') {
        await createInteraction.mutateAsync({
          portfolio_id: portfolioId,
          interaction_type: type,
          subject: subject || undefined,
          body: body || undefined,
          contact_name: contactName || undefined,
          contact_email: contactEmail || undefined,
          sent_at: new Date(sentAt).toISOString(),
        });
      } else if (initialData) {
        await updateInteraction.mutateAsync({
          id: initialData.id,
          portfolio_id: portfolioId,
          interaction_type: type,
          subject,
          body,
          contact_name: contactName,
          contact_email: contactEmail,
          sent_at: new Date(sentAt).toISOString(),
        });
      }
      onSuccess();
    } catch (error) {
      // Error ya manejado en los hooks
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        <Label>Fecha y hora</Label>
        <Input
          type="datetime-local"
          value={sentAt}
          onChange={(e) => setSentAt(e.target.value)}
        />
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

      <DialogFooter className="gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {mode === 'create' ? 'Guardar' : 'Guardar cambios'}
        </Button>
      </DialogFooter>
    </form>
  );
}

// ============= ADD INTERACTION DIALOG =============
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

  const handleSuccess = () => {
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
          <DialogDescription>
            Con {companyName}
          </DialogDescription>
        </DialogHeader>
        <InteractionForm
          mode="create"
          portfolioId={portfolioId}
          companyName={companyName}
          onSuccess={handleSuccess}
          onCancel={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// ============= EDIT INTERACTION DIALOG =============
function EditInteractionDialog({ 
  interaction,
  portfolioId, 
  companyName,
  open,
  onOpenChange,
  onSuccess 
}: { 
  interaction: CRPortfolioInteraction;
  portfolioId: string;
  companyName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar interacción</DialogTitle>
          <DialogDescription>
            Con {companyName}
          </DialogDescription>
        </DialogHeader>
        <InteractionForm
          mode="edit"
          initialData={interaction}
          portfolioId={portfolioId}
          companyName={companyName}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

// ============= DELETE CONFIRMATION DIALOG =============
function DeleteInteractionDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar interacción?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. La interacción será eliminada permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm} 
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============= MAIN COMPONENT =============
export function CRPortfolioInteractionsTab({ portfolioId, companyName }: CRPortfolioInteractionsTabProps) {
  const { data: interactions, isLoading, refetch } = useCRPortfolioInteractions(portfolioId);
  const deleteInteraction = useDeleteCRPortfolioInteraction();
  
  // Edit state
  const [editingInteraction, setEditingInteraction] = useState<CRPortfolioInteraction | null>(null);
  
  // Delete state
  const [deletingInteraction, setDeletingInteraction] = useState<CRPortfolioInteraction | null>(null);

  const handleEdit = (interaction: CRPortfolioInteraction) => {
    setEditingInteraction(interaction);
  };

  const handleDelete = (interaction: CRPortfolioInteraction) => {
    setDeletingInteraction(interaction);
  };

  const confirmDelete = async () => {
    if (!deletingInteraction) return;
    
    try {
      await deleteInteraction.mutateAsync({ 
        id: deletingInteraction.id, 
        portfolioId 
      });
      setDeletingInteraction(null);
    } catch (error) {
      // Error ya manejado en el hook
    }
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
              onEdit={() => handleEdit(interaction)}
              onDelete={() => handleDelete(interaction)}
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

      {/* Edit Dialog */}
      {editingInteraction && (
        <EditInteractionDialog
          interaction={editingInteraction}
          portfolioId={portfolioId}
          companyName={companyName}
          open={!!editingInteraction}
          onOpenChange={(open) => !open && setEditingInteraction(null)}
          onSuccess={refetch}
        />
      )}

      {/* Delete Confirmation */}
      <DeleteInteractionDialog
        open={!!deletingInteraction}
        onOpenChange={(open) => !open && setDeletingInteraction(null)}
        onConfirm={confirmDelete}
        isDeleting={deleteInteraction.isPending}
      />
    </div>
  );
}
