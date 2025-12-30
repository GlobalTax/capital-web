import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, Copy, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateBookingToken } from '@/components/booking/hooks/useBookingSlots';

interface GenerateBookingLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const GenerateBookingLinkModal = ({ open, onOpenChange }: GenerateBookingLinkModalProps) => {
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleGenerate = () => {
    if (!clientName || !clientEmail) {
      toast.error('Nombre y email son obligatorios');
      return;
    }

    // Generate a simple unique ID for this booking link
    const linkId = `link_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const token = generateBookingToken({
      leadId: linkId,
      email: clientEmail,
      name: clientName,
      company: companyName || undefined,
    });

    const baseUrl = window.location.origin;
    const link = `${baseUrl}/reservar?token=${token}`;
    setGeneratedLink(link);
    setCopied(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Enlace copiado al portapapeles');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Error al copiar el enlace');
    }
  };

  const handleSendEmail = async () => {
    if (!generatedLink) return;
    
    setIsSendingEmail(true);
    
    // Open default email client with pre-filled content
    const subject = encodeURIComponent('Reserva tu llamada con Capittal');
    const body = encodeURIComponent(
      `Hola ${clientName},\n\n` +
      `Te invitamos a reservar una llamada con nuestro equipo de asesores.\n\n` +
      `Puedes elegir el horario que mejor te convenga en el siguiente enlace:\n` +
      `${generatedLink}\n\n` +
      `El enlace es válido durante 7 días.\n\n` +
      `Un saludo,\n` +
      `El equipo de Capittal`
    );
    
    window.open(`mailto:${clientEmail}?subject=${subject}&body=${body}`, '_blank');
    
    setIsSendingEmail(false);
    toast.success('Cliente de email abierto');
  };

  const handleClose = () => {
    setClientName('');
    setClientEmail('');
    setCompanyName('');
    setGeneratedLink('');
    setCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Generar Enlace de Reserva</DialogTitle>
          <DialogDescription>
            Crea un enlace personalizado para que el cliente pueda reservar su llamada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link_client_name">Nombre del cliente *</Label>
            <Input
              id="link_client_name"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Juan García"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_client_email">Email *</Label>
            <Input
              id="link_client_email"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="juan@empresa.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_company_name">Empresa (opcional)</Label>
            <Input
              id="link_company_name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Nombre de la empresa"
            />
          </div>

          <Button 
            onClick={handleGenerate} 
            className="w-full"
            disabled={!clientName || !clientEmail}
          >
            Generar Enlace
          </Button>

          {generatedLink && (
            <div className="space-y-3 pt-4 border-t">
              <Label>Enlace generado (válido 7 días)</Label>
              <div className="flex gap-2">
                <Input
                  value={generatedLink}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={handleSendEmail}
                disabled={isSendingEmail}
              >
                {isSendingEmail ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Enviar por Email
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
