
import React from 'react';
import { Search, FileText, Users, TrendingUp, Handshake, Award } from 'lucide-react';

const VentaEmpresasProcess = () => {
  const steps = [
    {
      icon: Search,
      title: 'Análisis Inicial',
      description: 'Evaluación completa de tu empresa, incluyendo situación financiera, posición en el mercado y potencial de crecimiento.',
      duration: '1-2 semanas'
    },
    {
      icon: FileText,
      title: 'Preparación de Documentación',
      description: 'Creación del memorando de venta, análisis financiero detallado y documentación legal necesaria.',
      duration: '2-3 semanas'
    },
    {
      icon: Users,
      title: 'Identificación de Compradores',
      description: 'Búsqueda activa de compradores estratégicos e inversores financieros que encajen con tu empresa.',
      duration: '3-4 semanas'
    },
    {
      icon: TrendingUp,
      title: 'Marketing y Presentación',
      description: 'Presentación profesional a compradores cualificados manteniendo la confidencialidad del proceso.',
      duration: '4-6 semanas'
    },
    {
      icon: Handshake,
      title: 'Negociación',
      description: 'Gestión de ofertas, negociación de términos y condiciones para maximizar el valor de la transacción.',
      duration: '2-4 semanas'
    },
    {
      icon: Award,
      title: 'Cierre',
      description: 'Acompañamiento en el proceso de due diligence y cierre final de la operación.',
      duration: '4-8 semanas'
    }
  ];

  return (
    <section className="carta-section">
      <div className="carta-container">
        <div className="text-center mb-16">
          <h2 className="font-semibold text-foreground mb-6">
            Nuestro Proceso de Venta
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Un método probado que garantiza los mejores resultados. Cada paso está diseñado 
            para maximizar el valor de tu empresa y asegurar un proceso eficiente.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="carta-card h-full">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary text-primary-foreground rounded-lg w-12 h-12 flex items-center justify-center mr-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {step.duration}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {index + 1}. {step.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                    <div className="w-8 h-0.5 bg-border"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-16">
          <div className="carta-card max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-foreground mb-4">
              Duración Total del Proceso
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              El proceso completo suele durar entre <strong>4 a 6 meses</strong>, 
              dependiendo de la complejidad de la empresa y las condiciones del mercado.
            </p>
            <div className="flex justify-center space-x-8 text-center">
              <div>
                <div className="text-3xl font-bold text-foreground">85%</div>
                <div className="text-sm text-muted-foreground">Tasa de éxito</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">4.2x</div>
                <div className="text-sm text-muted-foreground">Múltiplo promedio</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground">120</div>
                <div className="text-sm text-muted-foreground">Días promedio</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasProcess;
