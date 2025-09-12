import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, Award, Building } from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const TrustSignals: React.FC = () => {
  const { certificaciones, polizas } = suiteloopData.trustSignals;

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Shield className="w-4 h-4 mr-2" />
              Confianza y Seguridad
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Certificaciones y garantías
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Certificaciones */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary" />
                Certificaciones
              </h3>
              {certificaciones.map((cert, index) => (
                <div key={index} className="bg-background p-4 rounded-lg border border-border">
                  <div className="font-medium text-foreground">{cert.nombre}</div>
                  <div className="text-sm text-muted-foreground">{cert.descripcion}</div>
                </div>
              ))}
            </div>

            {/* Pólizas */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center">
                <Building className="w-5 h-5 mr-2 text-primary" />
                Pólizas de Seguro
              </h3>
              {polizas.map((poliza, index) => (
                <div key={index} className="bg-background p-4 rounded-lg border border-border">
                  <div className="font-medium text-foreground">{poliza.tipo}</div>
                  <div className="text-sm text-muted-foreground">
                    {poliza.cantidad} • {poliza.aseguradora}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;