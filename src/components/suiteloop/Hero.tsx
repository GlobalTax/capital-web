import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Download, ArrowRight, Zap, Shield, Users } from 'lucide-react';
import { LeadForm } from './LeadForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface HeroProps {
  onDownloadReport: () => void;
}

const Hero: React.FC<HeroProps> = ({ onDownloadReport }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-muted/20 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 right-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-accent/10 rounded-full blur-2xl animate-pulse delay-1000" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <Badge variant="secondary" className="inline-flex items-center gap-2 px-4 py-2 text-sm">
            <Zap className="w-4 h-4" />
            Análisis Sector Asesorías 2025
          </Badge>

          {/* Headline */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              El futuro de las asesorías:
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                colaboración, automatización y datos
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Radiografía del sector en España y guía del software que marcará la próxima ola 
              <span className="font-semibold text-foreground">(e-factura, SIF e IA)</span>
            </p>
          </div>

          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span>67k asesorías analizadas</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>Post-on-premise certificado</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>SIF & e-factura ready</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  size="lg" 
                  className="inline-flex items-center gap-2 px-8 py-6 text-lg font-semibold hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
                >
                  <Play className="w-5 h-5" />
                  Solicitar demo
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <LeadForm 
                  onSuccess={() => setIsModalOpen(false)}
                  title="Solicita tu demo personalizada"
                  description="Te mostramos SuiteLoop con datos reales de tu despacho en 30 minutos"
                />
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              size="lg"
              onClick={onDownloadReport}
              className="inline-flex items-center gap-2 px-8 py-6 text-lg hover:shadow-md transition-all duration-300"
            >
              <Download className="w-5 h-5" />
              Descargar informe PDF
            </Button>
          </div>

          {/* Trust Line */}
          <p className="text-sm text-muted-foreground">
            Convive con A3/Sage • TTV &lt; 2 semanas • +150 bancos PSD2 • ISO 27001
          </p>
        </div>
      </div>
    </section>
  );
};

export default Hero;