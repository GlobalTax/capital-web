import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw, Save } from 'lucide-react';
import { generateBrevoHtml } from './brevoTemplate';

interface Operation {
  id: string;
  company_name: string;
  sector: string;
  geographic_location: string | null;
  revenue_amount: number | null;
  ebitda_amount: number | null;
  short_description: string | null;
  project_status: string;
}

interface Campaign {
  id: string;
  subject: string;
  intro_text: string | null;
  notes: string | null;
  operations_included: string[];
  html_content: string | null;
}

interface EditDraftModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
  operations: Operation[];
  onSaved: () => void;
}

export const EditDraftModal: React.FC<EditDraftModalProps> = ({
  open,
  onOpenChange,
  campaign,
  operations,
  onSaved,
}) => {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [introText, setIntroText] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (campaign) {
      setSubject(campaign.subject || '');
      setIntroText(campaign.intro_text || '');
      setNotes(campaign.notes || '');
    }
  }, [campaign]);

  const handleSave = async () => {
    if (!campaign) return;

    setIsSaving(true);
    try {
      // Get operations for HTML regeneration
      const selectedOps = operations.filter(op => 
        campaign.operations_included?.includes(op.id)
      );

      // Regenerate HTML with updated text
      const htmlContent = generateBrevoHtml(selectedOps, subject, introText);

      const { error } = await supabase
        .from('newsletter_campaigns')
        .update({
          subject,
          intro_text: introText,
          notes,
          html_content: htmlContent,
        })
        .eq('id', campaign.id);

      if (error) throw error;

      toast({
        title: '✓ Borrador actualizado',
        description: 'Los cambios se han guardado correctamente',
      });
      onOpenChange(false);
      onSaved();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo guardar el borrador',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar Borrador</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="subject">Asunto del email</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Asunto..."
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="intro">Texto introductorio</Label>
            <Textarea
              id="intro"
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              placeholder="Texto introductorio..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notas internas</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas para el equipo..."
              className="mt-1"
            />
          </div>

          <p className="text-sm text-muted-foreground">
            El HTML se regenerará automáticamente con los cambios.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="gap-2">
            {isSaving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
