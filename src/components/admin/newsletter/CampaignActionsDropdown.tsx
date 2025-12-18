import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  MoreHorizontal, 
  Copy, 
  CheckCircle2, 
  Eye, 
  MessageSquare,
  Files
} from 'lucide-react';

type NewsletterType = 'opportunities' | 'news' | 'updates' | 'educational';

interface Campaign {
  id: string;
  subject: string;
  status: string;
  html_content?: string | null;
  notes?: string | null;
  sent_via?: string | null;
  operations_included: string[];
  recipients_count: number;
  sent_at: string | null;
  created_at: string;
  open_count?: number;
  click_count?: number;
  intro_text?: string | null;
  type?: NewsletterType | null;
}

interface CampaignActionsDropdownProps {
  campaign: Campaign;
  onRefresh: () => void;
  onDuplicate?: (campaign: Campaign) => void;
}

export const CampaignActionsDropdown: React.FC<CampaignActionsDropdownProps> = ({
  campaign,
  onRefresh,
  onDuplicate,
}) => {
  const { toast } = useToast();
  const [showNotesDialog, setShowNotesDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [notes, setNotes] = useState(campaign.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopyHtml = async () => {
    if (!campaign.html_content) {
      toast({
        title: 'Sin HTML',
        description: 'Esta campaña no tiene HTML guardado',
        variant: 'destructive',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(campaign.html_content);
      toast({
        title: '✓ HTML copiado',
        description: 'Pega el código en Brevo',
      });
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = campaign.html_content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast({
        title: '✓ HTML copiado',
        description: 'Pega el código en Brevo',
      });
    }
  };

  const handleMarkAsSent = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .update({ 
          status: 'sent',
          sent_at: new Date().toISOString(),
        })
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: '✓ Campaña marcada como enviada',
        description: 'El estado se ha actualizado correctamente',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el estado',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveNotes = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('newsletter_campaigns')
        .update({ notes })
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: '✓ Nota guardada',
      });
      setShowNotesDialog(false);
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar la nota',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {campaign.html_content && (
            <DropdownMenuItem onClick={handleCopyHtml} className="gap-2">
              <Copy className="h-4 w-4" />
              Copiar HTML
            </DropdownMenuItem>
          )}
          
          {campaign.status === 'draft' && (
            <DropdownMenuItem onClick={handleMarkAsSent} className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Marcar Enviado
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={() => setShowDetailsDialog(true)} className="gap-2">
            <Eye className="h-4 w-4" />
            Ver Detalles
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => setShowNotesDialog(true)} className="gap-2">
            <MessageSquare className="h-4 w-4" />
            {campaign.notes ? 'Editar Nota' : 'Añadir Nota'}
          </DropdownMenuItem>
          
          {onDuplicate && (
            <DropdownMenuItem onClick={() => onDuplicate(campaign)} className="gap-2">
              <Files className="h-4 w-4" />
              Duplicar
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notes Dialog */}
      <Dialog open={showNotesDialog} onOpenChange={setShowNotesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Notas de la Campaña</DialogTitle>
          </DialogHeader>
          <Input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añadir nota..."
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotesDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveNotes} disabled={isUpdating}>
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Detalles de la Campaña</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Asunto</p>
              <p className="font-medium">{campaign.subject}</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="capitalize">{campaign.status}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Origen</p>
                <p className="capitalize">{campaign.sent_via || 'internal'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tipo</p>
                <p className="capitalize">{campaign.type || 'opportunities'}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operaciones</p>
                <p>{campaign.operations_included?.length || 0}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Destinatarios</p>
                <p>{campaign.recipients_count || 0}</p>
              </div>
            </div>
            {campaign.notes && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Notas</p>
                <p>{campaign.notes}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
