import React from 'react';
import { Search, FileText, Users, Handshake, CheckCircle, Loader2 } from 'lucide-react';
import { useProcessSteps } from '@/hooks/useVentaEmpresasContent';

const VentaEmpresasProcessLanding = () => {
  const { data: steps, isLoading } = useProcessSteps();

  const iconMap: Record<string, any> = {
    Search: <Search className="h-8 w-8" />,
    FileText: <FileText className="h-8 w-8" />,
    Users: <Users className="h-8 w-8" />,
    Handshake: <Handshake className="h-8 w-8" />,
    CheckCircle: <CheckCircle className="h-8 w-8" />,
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (!steps || steps.length === 0) {
    return null;
  }

  return (
    <section id="proceso" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Nuestro <span className="text-primary">Proceso</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Un proceso estructurado y profesional que maximiza el valor de tu empresa 
            y asegura una transacción exitosa en el menor tiempo posible.
          </p>
        </div>

        {/* Process Steps */}
        <div className="relative max-w-4xl mx-auto">
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex items-start space-x-6">
                  {/* Step Number */}
                  <div className="flex-shrink-0 w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-bold shadow-lg">
                    {step.step_number}
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-md transition-shadow duration-300">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-muted text-primary rounded-lg flex items-center justify-center">
                          {iconMap[step.icon_name] || <Search className="h-8 w-8" />}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xl font-bold text-foreground">
                              {step.title}
                            </h3>
                            <span className="px-3 py-1 bg-muted text-muted-foreground rounded-full text-sm font-medium">
                              {step.duration}
                            </span>
                          </div>
                          
                          <p className="text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-border"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Success Summary */}
        <div className="mt-16 bg-card border border-border rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-6">Resultados Comprobados</h3>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">6-12</div>
              <div className="text-lg font-semibold text-foreground">Meses</div>
              <div className="text-sm text-muted-foreground">Proceso promedio</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">98,7%</div>
              <div className="text-lg font-semibold text-foreground">Éxito</div>
              <div className="text-sm text-muted-foreground">Operaciones completadas</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">+25%</div>
              <div className="text-lg font-semibold text-foreground">Valor adicional</div>
              <div className="text-sm text-muted-foreground">Vs. mercado</div>
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">48h</div>
              <div className="text-lg font-semibold text-foreground">Valoración</div>
              <div className="text-sm text-muted-foreground">Sin compromiso</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasProcessLanding;