import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, X, TrendingUp } from 'lucide-react';

const comparisonData = [
  {
    aspect: 'Precio de Venta',
    withCapittal: 'Precio optimizado hasta +40% sobre valor inicial',
    withoutCapittal: 'Precio basado en intuición o primera oferta',
    critical: true
  },
  {
    aspect: 'Tiempo de Venta',
    withCapittal: '4-9 meses con proceso estructurado',
    withoutCapittal: '1-3 años o más con múltiples intentos fallidos'
  },
  {
    aspect: 'Confidencialidad',
    withCapittal: 'NDA profesional con todos los compradores',
    withoutCapittal: 'Alto riesgo de filtración a empleados y competencia'
  },
  {
    aspect: 'Due Diligence',
    withCapittal: 'Documentación preparada profesionalmente',
    withoutCapittal: 'Preparación deficiente que reduce el precio'
  },
  {
    aspect: 'Negociación',
    withCapittal: 'Expertos negociadores con +200 operaciones',
    withoutCapittal: 'Negociación emocional sin experiencia'
  },
  {
    aspect: 'Compradores',
    withCapittal: 'Acceso a red exclusiva de +5,000 inversores',
    withoutCapittal: 'Limitado a tu red personal o intermediarios generalistas'
  },
  {
    aspect: 'Aspectos Fiscales',
    withCapittal: 'Optimización fiscal con equipo especializado',
    withoutCapittal: 'Posible pérdida de ahorros fiscales significativos'
  },
  {
    aspect: 'Estrés y Tiempo',
    withCapittal: 'Nosotros gestionamos todo mientras tú diriges tu empresa',
    withoutCapittal: 'Dedicación de 20+ horas semanales durante meses'
  },
  {
    aspect: 'Garantías',
    withCapittal: 'Garantía de mejora de precio o no cobras',
    withoutCapittal: 'Sin garantías ni protección profesional'
  },
  {
    aspect: 'Soporte Legal',
    withCapittal: 'Equipo legal experto en M&A incluido',
    withoutCapittal: 'Necesitas contratar (y pagar) múltiples asesores'
  }
];

const VentaEmpresasComparison = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <TrendingUp className="h-4 w-4" />
            Comparativa Objetiva
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Vender Con Capittal vs Por Tu Cuenta
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La diferencia entre una operación exitosa y una oportunidad perdida
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Desktop View */}
          <div className="hidden md:block">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center font-semibold text-muted-foreground">
                Aspecto
              </div>
              <div className="text-center">
                <div className="bg-primary text-primary-foreground rounded-lg py-3 font-bold">
                  ✓ Con Capittal
                </div>
              </div>
              <div className="text-center">
                <div className="bg-secondary rounded-lg py-3 font-bold">
                  ✗ Por Tu Cuenta
                </div>
              </div>
            </div>

            {comparisonData.map((item, index) => (
              <div 
                key={index} 
                className={`grid grid-cols-3 gap-4 mb-3 ${item.critical ? 'bg-primary/5 rounded-lg p-4' : ''}`}
              >
                <div className="flex items-center font-medium">
                  {item.critical && <span className="text-red-500 mr-2">★</span>}
                  {item.aspect}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>{item.withCapittal}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <X className="h-5 w-5 text-red-500 flex-shrink-0" />
                  <span>{item.withoutCapittal}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4">
            {comparisonData.map((item, index) => (
              <Card key={index} className={item.critical ? 'border-primary' : ''}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    {item.critical && <span className="text-red-500">★</span>}
                    {item.aspect}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-primary mb-1">Con Capittal</div>
                      <div className="text-sm">{item.withCapittal}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-sm text-muted-foreground mb-1">Por Tu Cuenta</div>
                      <div className="text-sm text-muted-foreground">{item.withoutCapittal}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-2">
              <span className="text-red-500">★</span> Aspectos críticos que afectan directamente el resultado final
            </p>
            <div className="inline-block bg-primary/10 rounded-lg px-6 py-4">
              <p className="font-bold text-lg text-primary mb-1">
                En promedio, nuestros clientes obtienen un 32% más
              </p>
              <p className="text-sm text-muted-foreground">
                El coste de nuestros servicios se compensa con creces con el mejor precio obtenido
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VentaEmpresasComparison;
