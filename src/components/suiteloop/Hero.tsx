import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, BarChart3, Shield } from 'lucide-react';
import { LeadForm } from './LeadForm';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';

interface HeroProps {
  onDownloadReport: () => void;
}

const Hero: React.FC<HeroProps> = ({ onDownloadReport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 text-foreground">
            El futuro de las asesorías<br />
            <span className="text-primary">post-on-premise</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma que convive con A3/Sage para digitalizar procesos y mejorar la eficiencia operativa
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <InteractiveHoverButton
              text="Solicitar demo"
              variant="primary"
              size="lg"
              onClick={() => setIsModalOpen(true)}
            />
            <InteractiveHoverButton
              text="Descargar informe PDF"
              variant="outline"
              size="lg"
              onClick={onDownloadReport}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">67k</div>
              <div className="text-sm text-muted-foreground">asesorías analizadas</div>
            </div>
            <div className="text-center">
              <BarChart3 className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">35%</div>
              <div className="text-sm text-muted-foreground">ahorro tiempo administrativo</div>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold text-foreground">ROI 300%</div>
              <div className="text-sm text-muted-foreground">retorno primer año</div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Demo de SuiteLoop</DialogTitle>
          </DialogHeader>
          <LeadForm 
            source="suiteloop_hero"
            onSuccess={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default Hero;