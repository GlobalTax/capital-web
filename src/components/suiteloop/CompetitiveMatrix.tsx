import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Check, 
  X, 
  Minus, 
  Target, 
  ArrowRight,
  Shield,
  Zap,
  Users,
  Smartphone
} from 'lucide-react';
import { suiteloopData } from '@/data/suiteloop-data';

const CompetitiveMatrix: React.FC = () => {
  const competidores = suiteloopData.mixCompetidores;

  // Matriz de características comparativas
  const features = [
    {
      category: "Integración & Convivencia",
      items: [
        { 
          feature: "Convive con A3/Sage", 
          suiteloop: "check", 
          a3: "partial", 
          sage: "partial", 
          startups: "x",
          description: "Mantiene ERP actual sin migración"
        },
        { 
          feature: "APIs abiertas", 
          suiteloop: "check", 
          a3: "partial", 
          sage: "partial", 
          startups: "check",
          description: "Conectividad con terceros"
        }
      ]
    },
    {
      category: "Portal & Colaboración",
      items: [
        { 
          feature: "Portal cliente nativo", 
          suiteloop: "check", 
          a3: "x", 
          sage: "partial", 
          startups: "check",
          description: "Colaboración asesoría-cliente"
        },
        { 
          feature: "Workflows automáticos", 
          suiteloop: "check", 
          a3: "x", 
          sage: "partial", 
          startups: "partial",
          description: "Automatización de procesos"
        }
      ]
    },
    {
      category: "IA & Automatización",
      items: [
        { 
          feature: "OCR + IA contable", 
          suiteloop: "check", 
          a3: "partial", 
          sage: "partial", 
          startups: "partial",
          description: "Extracción y categorización automática"
        },
        { 
          feature: "Conciliación bancaria IA", 
          suiteloop: "check", 
          a3: "partial", 
          sage: "check", 
          startups: "partial",
          description: "Matching automático con reglas ML"
        }
      ]
    },
    {
      category: "Fintech & Banking",
      items: [
        { 
          feature: "Tesorería PSD2 nativa", 
          suiteloop: "check", 
          a3: "x", 
          sage: "partial", 
          startups: "partial",
          description: "Conexión directa con +150 bancos"
        },
        { 
          feature: "Cash flow predictivo", 
          suiteloop: "check", 
          a3: "x", 
          sage: "x", 
          startups: "partial",
          description: "Análisis y forecasting automático"
        }
      ]
    },
    {
      category: "Compliance & Regulación",
      items: [
        { 
          feature: "SIF Ready automatizado", 
          suiteloop: "check", 
          a3: "partial", 
          sage: "partial", 
          startups: "partial",
          description: "Reporte automático a Hacienda"
        },
        { 
          feature: "e-Factura compliance", 
          suiteloop: "check", 
          a3: "check", 
          sage: "check", 
          startups: "partial",
          description: "Validación y formato normativo"
        }
      ]
    },
    {
      category: "Implementación",
      items: [
        { 
          feature: "Time to Value < 2 semanas", 
          suiteloop: "check", 
          a3: "x", 
          sage: "x", 
          startups: "partial",
          description: "Configuración rápida sin disrupciones"
        },
        { 
          feature: "Cobertura asesoría completa", 
          suiteloop: "check", 
          a3: "check", 
          sage: "partial", 
          startups: "partial",
          description: "Fiscal, laboral, contable, jurídico"
        }
      ]
    }
  ];

  const renderIcon = (value: string) => {
    switch (value) {
      case "check":
        return <Check className="w-5 h-5 text-green-600" />;
      case "partial":
        return <Minus className="w-5 h-5 text-yellow-600" />;
      case "x":
        return <X className="w-5 h-5 text-red-500" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Target className="w-4 h-4 mr-2" />
              Panorama Competitivo
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              SuiteLoop vs. Alternativas del mercado
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Análisis comparativo detallado: <strong>post-on-premise</strong> vs. reemplazos completos. 
              SuiteLoop convive con tu infraestructura actual mientras añade capacidades cloud nativas.
            </p>
          </div>

          {/* Market Share Overview */}
          <div className="grid md:grid-cols-4 gap-4 mb-12">
            {competidores.map((comp, index) => (
              <Card key={index} className="text-center border-2 hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-lg">{comp.proveedor}</h3>
                    <div className="text-3xl font-bold text-primary">
                      {comp.marketShare}%
                    </div>
                    <div className="space-y-2">
                      <Badge variant="outline" className="text-xs">
                        💪 {comp.fuerza}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        ⚠️ {comp.gap}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Comparison Matrix */}
          <Card className="overflow-hidden">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-center">
                Matriz de Características Detallada
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left p-4 font-semibold">Característica</th>
                      <th className="text-center p-4 font-semibold text-primary">
                        <div className="flex items-center justify-center gap-2">
                          <Shield className="w-4 h-4" />
                          SuiteLoop
                        </div>
                      </th>
                      <th className="text-center p-4">A3-Innuva</th>
                      <th className="text-center p-4">Sage</th>
                      <th className="text-center p-4">Startups Cloud</th>
                    </tr>
                  </thead>
                  <tbody>
                    {features.map((category, catIndex) => (
                      <React.Fragment key={catIndex}>
                        <tr className="bg-muted/10">
                          <td colSpan={5} className="p-3 font-semibold text-sm text-primary">
                            {category.category}
                          </td>
                        </tr>
                        {category.items.map((item, itemIndex) => (
                          <tr key={itemIndex} className="border-b hover:bg-muted/20 transition-colors">
                            <td className="p-4">
                              <div>
                                <div className="font-medium">{item.feature}</div>
                                <div className="text-sm text-muted-foreground">{item.description}</div>
                              </div>
                            </td>
                            <td className="text-center p-4 bg-primary/5">
                              {renderIcon(item.suiteloop)}
                            </td>
                            <td className="text-center p-4">
                              {renderIcon(item.a3)}
                            </td>
                            <td className="text-center p-4">
                              {renderIcon(item.sage)}
                            </td>
                            <td className="text-center p-4">
                              {renderIcon(item.startups)}
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Competitive Advantage Summary */}
          <Card className="mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold flex items-center gap-2">
                    <Zap className="w-6 h-6 text-primary" />
                    Ventaja diferencial post-on-premise
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Mientras los competidores requieren <strong>migración completa</strong> o tienen 
                    <strong>gaps funcionales</strong>, SuiteLoop es la única plataforma que convive 
                    con A3/Sage añadiendo capacidades cloud sin disrupciones.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <Check className="w-3 h-3 mr-1" />
                      Sin migración
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <Smartphone className="w-3 h-3 mr-1" />
                      TTV &lt; 2 semanas
                    </Badge>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      <Users className="w-3 h-3 mr-1" />
                      Cobertura completa
                    </Badge>
                  </div>
                </div>
                
                <div className="text-center">
                  <Button size="lg" className="inline-flex items-center gap-2">
                    Ver demo comparativa
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <p className="text-sm text-muted-foreground mt-2">
                    Comparamos SuiteLoop con tu solución actual en vivo
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CompetitiveMatrix;