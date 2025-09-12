import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Maximize2, 
  Upload, 
  CheckCircle, 
  CreditCard,
  ArrowRight,
  Clock,
  FileText
} from 'lucide-react';

const ProductDemo: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: "Cliente sube documentos",
      description: "El cliente accede al portal BiLoop desde móvil/web y sube facturas, recibos o justificantes",
      icon: Upload,
      duration: "10 seg",
      visual: "portal-upload"
    },
    {
      title: "OCR extrae y propone",
      description: "OCRLoop analiza el documento, extrae datos clave y propone automáticamente el asiento contable",
      icon: FileText,
      duration: "5 seg",
      visual: "ocr-processing"
    },
    {
      title: "CashLoop concilia",
      description: "Si es un pago/cobro, CashLoop lo matchea automáticamente con el movimiento bancario vía PSD2",
      icon: CreditCard,
      duration: "2 seg",
      visual: "cash-reconciliation"
    }
  ];

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      // Simulate demo progression
      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          const next = prev + 1;
          if (next >= demoSteps.length) {
            setIsPlaying(false);
            clearInterval(interval);
            return 0;
          }
          return next;
        });
      }, 3000);
    }
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">
              <Play className="w-4 h-4 mr-2" />
              Demo Interactiva
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              El workflow completo en 17 segundos
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Desde que tu cliente sube un documento hasta que está contabilizado y conciliado automáticamente. 
              <strong>Sin intervención manual</strong>.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Demo Steps */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-bold text-lg mb-4">Flujo paso a paso</h3>
              
              {demoSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;
                
                return (
                  <Card 
                    key={index}
                    className={`cursor-pointer transition-all duration-300 ${
                      isActive ? 'border-primary shadow-lg bg-primary/5 scale-105' : 
                      isCompleted ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                      'hover:border-primary/50'
                    }`}
                    onClick={() => !isPlaying && setCurrentStep(index)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg flex-shrink-0 ${
                          isActive ? 'bg-primary text-primary-foreground' :
                          isCompleted ? 'bg-green-500 text-white' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold text-sm ${
                              isActive ? 'text-primary' : 'text-foreground'
                            }`}>
                              {step.title}
                            </h4>
                            <Badge variant="outline" className="text-xs">
                              {step.duration}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Demo Controls */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handlePlayPause}
                  size="sm"
                  className="flex-1"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pausar
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      {currentStep === 0 ? 'Iniciar' : 'Continuar'}
                    </>
                  )}
                </Button>
                <Button 
                  onClick={resetDemo}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Visual Demo */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl overflow-hidden">
                <CardContent className="p-0">
                  <div className="relative bg-gradient-to-br from-primary/5 via-background to-accent/5 h-96 flex items-center justify-center">
                    {/* Demo Visual Placeholder */}
                    <DemoVisual step={currentStep} isPlaying={isPlaying} />
                    
                    {/* Progress Indicator */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                          />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {currentStep + 1}/{demoSteps.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Fullscreen Button */}
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="absolute top-4 right-4"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Demo Stats */}
              <div className="grid grid-cols-3 gap-4 mt-6">
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">17s</div>
                    <div className="text-xs text-muted-foreground">Tiempo total</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">95%</div>
                    <div className="text-xs text-muted-foreground">Precisión OCR</div>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">0</div>
                    <div className="text-xs text-muted-foreground">Intervención manual</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Card className="inline-block bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">
                  ¿Quieres verlo con tus datos reales?
                </h3>
                <p className="text-muted-foreground mb-4">
                  Te preparamos una demo personalizada con documentos de tu despacho
                </p>
                <Button size="lg">
                  <Clock className="w-5 h-5 mr-2" />
                  Agendar demo de 30 minutos
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

// Demo Visual Component
const DemoVisual: React.FC<{ step: number; isPlaying: boolean }> = ({ step, isPlaying }) => {
  const visuals = [
    // Step 0: Upload
    <div className="text-center space-y-4 animate-fade-in">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Upload className="w-12 h-12 text-primary animate-bounce" />
      </div>
      <h3 className="text-xl font-bold">Cliente sube factura</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        Acceso desde cualquier dispositivo al portal BiLoop. Drag & drop o foto directa.
      </p>
      <div className="flex justify-center gap-2">
        <Badge>📱 Móvil</Badge>
        <Badge>💻 Web</Badge>
        <Badge>📧 Email</Badge>
      </div>
    </div>,
    
    // Step 1: OCR Processing  
    <div className="text-center space-y-4 animate-fade-in">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <FileText className={`w-12 h-12 text-primary ${isPlaying ? 'animate-spin' : ''}`} />
      </div>
      <h3 className="text-xl font-bold">IA extrae y categoriza</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        OCRLoop analiza: importe, fecha, proveedor, IVA. Propone asiento según plan contable.
      </p>
      <div className="flex justify-center gap-2">
        <Badge>🧠 IA</Badge>
        <Badge>⚡ 5 seg</Badge>
        <Badge>✅ 95% precisión</Badge>
      </div>
    </div>,

    // Step 2: Bank Reconciliation
    <div className="text-center space-y-4 animate-fade-in">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <CreditCard className={`w-12 h-12 text-primary ${isPlaying ? 'animate-pulse' : ''}`} />
      </div>
      <h3 className="text-xl font-bold">Conciliación automática</h3>
      <p className="text-sm text-muted-foreground max-w-md mx-auto">
        CashLoop matchea con movimientos bancarios PSD2. Todo cuadrado sin tocar nada.
      </p>
      <div className="flex justify-center gap-2">
        <Badge>🏦 PSD2</Badge>
        <Badge>⚡ Tiempo real</Badge>
        <Badge>✨ Auto-match</Badge>
      </div>
    </div>
  ];

  return (
    <div className="w-full h-full flex items-center justify-center">
      {visuals[step] || visuals[0]}
    </div>
  );
};

export default ProductDemo;