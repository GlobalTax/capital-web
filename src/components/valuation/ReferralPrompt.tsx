import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share2, Mail, MessageCircle, Copy } from 'lucide-react';

interface ReferralPromptProps {
  companyData?: any;
}

const ReferralPrompt: React.FC<ReferralPromptProps> = ({ companyData }) => {
  const { toast } = useToast();

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/lp/calculadora`
    : 'https://capittal.es/lp/calculadora';

  const subject = 'Te recomiendo la Calculadora de Valoración de Capittal';
  const message = `Hola${companyData?.contactName ? ` ${companyData.contactName}` : ''},\n\nTe comparto esta calculadora gratuita para estimar la valoración orientativa de una empresa.\n\n${shareUrl}\n\nEs rápida y sencilla de usar. Un saludo,`;

  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${subject}\n\n${message}`)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: 'Enlace copiado',
        description: 'El enlace a la calculadora se ha copiado al portapapeles.',
      });
    } catch (e) {
      toast({
        title: 'No se pudo copiar',
        description: 'Inténtalo de nuevo o utiliza los botones de compartir.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-blue-900">Recomiéndala a un tercero</h3>
        <p className="text-blue-700 mt-1">Comparte la calculadora con alguien a quien le pueda interesar.</p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button asChild variant="default" className="flex-1">
          <a href={mailtoHref} aria-label="Recomendar por email">
            <Mail className="h-4 w-4 mr-2" /> Enviar por email
          </a>
        </Button>
        <Button asChild variant="secondary" className="flex-1">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" aria-label="Recomendar por WhatsApp">
            <MessageCircle className="h-4 w-4 mr-2" /> Compartir por WhatsApp
          </a>
        </Button>
        <Button onClick={handleCopy} variant="outline" className="flex-1">
          <Copy className="h-4 w-4 mr-2" /> Copiar enlace
        </Button>
      </div>
    </section>
  );
};

export default ReferralPrompt;
