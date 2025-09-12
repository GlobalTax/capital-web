import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Network, 
  Users, 
  ScanLine, 
  CreditCard, 
  Calendar,
  ArrowRight,
  Check,
  Zap,
  Shield
} from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const ValueProposition: React.FC = () => {
  const [activeProduct, setActiveProduct] = useState(0);
  const propuesta = suiteloopData.propuestaValor;

  const iconMap = {
    Network,
    Users,
    ScanLine,
    CreditCard,
    Calendar
  };

  const beneficios = [
    "Portal cliente que elimina 60% de emails",
    "OCR + IA que ahorra 35% del tiempo contable",
    "Tesorería PSD2 con +150 bancos",
    "SIF & e-factura compliance automático",
    "Convivencia real con A3/Sage sin migraciones"
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Zap className="w-4 h-4 mr-2" />
              Propuesta de Valor SuiteLoop
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {propuesta.tagline}
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto mb-6">
              {propuesta.descripcion}
            </p>
            
            {/* Key Benefits */}
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {beneficios.map((beneficio, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" />
                  {beneficio}
                </Badge>
              ))}
            </div>
          </div>

          {/* Product Showcase */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Product Navigation */}
            <div className="space-y-6">
              <div className="space-y-4">
                {propuesta.productos.map((producto, index) => {
                  const Icon = iconMap[producto.icon as keyof typeof iconMap];
                  const isActive = index === activeProduct;
                  
                  return (
                    <Card 
                      key={index}
                      className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        isActive ? 'border-primary shadow-lg bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      onClick={() => setActiveProduct(index)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-lg ${
                            isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                          }`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          
                          <div className="flex-1 space-y-2">
                            <h3 className={`font-bold text-lg ${
                              isActive ? 'text-primary' : 'text-foreground'
                            }`}>
                              {producto.nombre}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {producto.descripcion}
                            </p>
                            <div className={`inline-flex items-center gap-2 text-sm font-medium ${
                              isActive ? 'text-primary' : 'text-muted-foreground'
                            }`}>
                              <Check className="w-4 h-4" />
                              {producto.beneficio}
                            </div>
                          </div>
                          
                          {isActive && (
                            <ArrowRight className="w-5 h-5 text-primary animate-pulse" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              
              <Button size="lg" className="w-full">
                Ver demo de la suite completa
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* Right: Product Detail */}
            <div className="space-y-6">
              <Card className="border-0 shadow-xl">
                <CardContent className="p-8">
                  {propuesta.productos[activeProduct] && (
                    <>
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-4 bg-primary/10 rounded-xl">
                          {React.createElement(
                            iconMap[propuesta.productos[activeProduct].icon as keyof typeof iconMap],
                            { className: "w-8 h-8 text-primary" }
                          )}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold">
                            {propuesta.productos[activeProduct].nombre}
                          </h3>
                          <Badge variant="outline">
                            Módulo especializado
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <p className="text-lg text-muted-foreground">
                          {propuesta.productos[activeProduct].descripcion}
                        </p>
                        
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 text-green-700 dark:text-green-300 font-semibold">
                            <Check className="w-5 h-5" />
                            Beneficio clave
                          </div>
                          <p className="mt-2 text-green-600 dark:text-green-400">
                            {propuesta.productos[activeProduct].beneficio}
                          </p>
                        </div>

                        {/* Use Cases Based on Product */}
                        <div className="space-y-3">
                          <h4 className="font-semibold">Casos de uso típicos:</h4>
                          {getUseCases(activeProduct).map((useCase, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-primary rounded-full" />
                              <span>{useCase}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Integration Highlight */}
              <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
                <CardContent className="p-6 text-center">
                  <Shield className="w-8 h-8 text-primary mx-auto mb-3" />
                  <h4 className="font-bold mb-2">Integración certificada</h4>
                  <p className="text-sm text-muted-foreground">
                    Conectores nativos con A3, Sage, +150 bancos PSD2 y principales ERPs del mercado
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Helper function to get use cases based on product
function getUseCases(productIndex: number): string[] {
  const useCases = [
    // DataLoop (iPaaS)
    [
      "Sincronización A3/Sage ↔ BiLoop automática",
      "Webhooks en tiempo real con terceros",
      "Orquestación de workflows complejos",
      "APIs REST para integraciones custom"
    ],
    // BiLoop (Portal Cliente)
    [
      "Cliente sube facturas y justificantes desde móvil",
      "Notificaciones automáticas de vencimientos",
      "Dashboard personalizado por cliente",
      "Firma digital de documentos fiscales"
    ],
    // OCRLoop
    [
      "Escaneo de facturas con extracción automática",
      "Proposición de asientos contables inteligente",
      "Clasificación automática por categorías fiscales",
      "Validación contra catálogo de cuentas"
    ],
    // CashLoop (PSD2)
    [
      "Conciliación bancaria automática en tiempo real",
      "Agregación multi-banco en un dashboard",
      "Previsiones de cash flow por cliente",
      "Alertas de descuadres y excepciones"
    ],
    // Planner (SIF Ready)
    [
      "Generación automática de informes SIF",
      "Calendario fiscal inteligente con alertas",
      "Validación e-factura antes del envío",
      "Reporting regulatorio automatizado"
    ]
  ];
  
  return useCases[productIndex] || [];
}

export default ValueProposition;