import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, FileText, Linkedin } from 'lucide-react';

interface VentaEmpresasSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const VentaEmpresasSuccessModal: React.FC<VentaEmpresasSuccessModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            ¡Solicitud Enviada con Éxito!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <p className="text-center text-muted-foreground">
            Hemos recibido tu solicitud de valoración gratuita. Nuestro equipo de expertos la revisará de inmediato.
          </p>
          
          <div className="bg-primary/5 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Próximos Pasos
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">1.</span>
                <span>Revisaremos tu información en las próximas <strong>24 horas</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">2.</span>
                <span>Te contactaremos para agendar una <strong>reunión confidencial</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">3.</span>
                <span>Prepararemos tu <strong>valoración gratuita</strong> personalizada</span>
              </li>
            </ul>
          </div>
          
          <div className="flex flex-col gap-2 pt-4">
            <Button onClick={onClose} className="w-full">
              Volver a la Página
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('https://www.linkedin.com/company/capittal', '_blank')}
              >
                <Linkedin className="h-4 w-4 mr-2" />
                Síguenos
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => window.open('/recursos', '_blank')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Recursos
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VentaEmpresasSuccessModal;
