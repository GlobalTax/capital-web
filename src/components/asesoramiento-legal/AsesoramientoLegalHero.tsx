
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleButton } from '@/components/ui/simple-button';
import { Phone, Download } from 'lucide-react';

const AsesoramientoLegalHero = () => {
  return (
    <section className="relative py-20 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium mb-4">
                En colaboración con el equipo de Navarro Legal
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-black leading-tight">
                Asesoramiento Legal
                <span className="block text-primary">M&A Especializado</span>
              </h1>
              
              <p className="text-xl text-black leading-relaxed">
                Protege tu transacción con la experiencia combinada de nuestros consultores de M&A 
                y Navarro Legal. Gestionamos todos los aspectos legales para que tu operación sea un éxito.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center p-4 bg-card border rounded-lg">
                <div className="text-3xl font-bold text-black mb-2">+100</div>
                <div className="text-sm text-black">Operaciones Asesoradas</div>
              </div>
              <div className="text-center p-4 bg-card border rounded-lg">
                <div className="text-3xl font-bold text-black mb-2">905 millones</div>
                <div className="text-sm text-black">Valor Total Protegido</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <SimpleButton
                text="Consulta"
                variant="primary"
                size="lg"
                className="flex items-center gap-2"
                onClick={() => window.location.href = '/contacto'}
              />
            </div>
          </div>

          {/* Legal Case Progress Visualization */}
          <div className="relative">
            <Card className="max-w-md mx-auto">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <span>Progreso Legal - Operación TECH-2025</span>
                  <span className="text-primary font-mono">85%</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {[
                    { phase: 'Due Diligence Legal', status: 'completed', progress: 100 },
                    { phase: 'Revisión Contractual', status: 'completed', progress: 100 },
                    { phase: 'Negociación SPA', status: 'active', progress: 75 },
                    { phase: 'Compliance Check', status: 'pending', progress: 20 },
                    { phase: 'Cierre Legal', status: 'pending', progress: 0 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className={
                          item.status === 'completed' ? 'text-green-600' :
                          item.status === 'active' ? 'text-primary' :
                          'text-muted-foreground'
                        }>
                          {item.phase}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            item.status === 'completed' ? 'bg-green-500' :
                            item.status === 'active' ? 'bg-primary' :
                            'bg-muted'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Próximo Hito:</span>
                    <span className="text-muted-foreground">Firma SPA - 3 días</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating indicators */}
            <div className="absolute -top-4 -right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Sin Contingencias
            </div>
            <div className="absolute -bottom-4 -left-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
              Riesgo: Bajo
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AsesoramientoLegalHero;
