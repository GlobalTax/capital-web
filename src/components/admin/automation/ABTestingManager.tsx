import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useMarketingAutomation } from '@/hooks/useMarketingAutomation';
import { TestTube, Plus, TrendingUp, Users, Target, Trophy } from 'lucide-react';

const ABTestingManager = () => {
  const { abTests, createABTest, getABTestResults } = useMarketingAutomation();
  
  const [newTest, setNewTest] = useState({
    test_name: '',
    page_path: '',
    variant_a_config: {
      title: 'Descargar Informe',
      fields: ['name', 'email', 'company'],
      cta: 'Descargar Ahora',
      color: 'blue'
    },
    variant_b_config: {
      title: 'Acceso Completo al Análisis',
      fields: ['name', 'email', 'company', 'phone', 'revenue'],
      cta: 'Obtener Acceso Premium',
      color: 'green'
    },
    traffic_split: 0.5,
    start_date: new Date().toISOString(),
    is_active: true
  });

  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    // Cargar resultados de todos los tests
    if (abTests) {
      abTests.forEach(async (test) => {
        const results = await getABTestResults(test.id);
        setTestResults(prev => ({
          ...prev,
          [test.id]: results
        }));
      });
    }
  }, [abTests, getABTestResults]);

  const handleCreateTest = () => {
    createABTest.mutate(newTest);
    setNewTest({
      test_name: '',
      page_path: '',
      variant_a_config: {
        title: 'Descargar Informe',
        fields: ['name', 'email', 'company'],
        cta: 'Descargar Ahora',
        color: 'blue'
      },
      variant_b_config: {
        title: 'Acceso Completo al Análisis',
        fields: ['name', 'email', 'company', 'phone', 'revenue'],
        cta: 'Obtener Acceso Premium',
        color: 'green'
      },
      traffic_split: 0.5,
      start_date: new Date().toISOString(),
      is_active: true
    });
    setDialogOpen(false);
  };

  const calculateSignificance = (resultA: any, resultB: any) => {
    if (!resultA || !resultB || resultA.views < 100 || resultB.views < 100) {
      return { significant: false, confidence: 0 };
    }

    const rateA = resultA.conversions / resultA.views;
    const rateB = resultB.conversions / resultB.views;
    const diff = Math.abs(rateA - rateB);
    
    // Simplified significance calculation
    const pooledRate = (resultA.conversions + resultB.conversions) / (resultA.views + resultB.views);
    const standardError = Math.sqrt(pooledRate * (1 - pooledRate) * (1/resultA.views + 1/resultB.views));
    const zScore = diff / standardError;
    
    let confidence = 0;
    if (zScore > 1.96) confidence = 95;
    else if (zScore > 1.645) confidence = 90;
    else if (zScore > 1.28) confidence = 80;
    
    return {
      significant: confidence >= 95,
      confidence,
      winner: rateA > rateB ? 'A' : 'B',
      improvement: ((Math.max(rateA, rateB) / Math.min(rateA, rateB) - 1) * 100).toFixed(1)
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Testing</h2>
          <p className="text-gray-600">Optimiza conversiones con tests estadísticamente válidos</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Test A/B
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Test A/B</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nombre del Test</Label>
                  <Input
                    value={newTest.test_name}
                    onChange={(e) => setNewTest({...newTest, test_name: e.target.value})}
                    placeholder="Test Landing Page Valoración"
                  />
                </div>
                
                <div>
                  <Label>Página</Label>
                  <Input
                    value={newTest.page_path}
                    onChange={(e) => setNewTest({...newTest, page_path: e.target.value})}
                    placeholder="/calculadora-valoracion"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Variante A (Control)</h4>
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={newTest.variant_a_config.title}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variant_a_config: {...newTest.variant_a_config, title: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label>CTA</Label>
                    <Input
                      value={newTest.variant_a_config.cta}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variant_a_config: {...newTest.variant_a_config, cta: e.target.value}
                      })}
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium">Variante B (Test)</h4>
                  <div>
                    <Label>Título</Label>
                    <Input
                      value={newTest.variant_b_config.title}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variant_b_config: {...newTest.variant_b_config, title: e.target.value}
                      })}
                    />
                  </div>
                  <div>
                    <Label>CTA</Label>
                    <Input
                      value={newTest.variant_b_config.cta}
                      onChange={(e) => setNewTest({
                        ...newTest,
                        variant_b_config: {...newTest.variant_b_config, cta: e.target.value}
                      })}
                    />
                  </div>
                </div>
              </div>
              
              <Button onClick={handleCreateTest} className="w-full">
                Crear Test A/B
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Tests */}
      <div className="grid gap-6">
        {abTests?.map((test) => {
          const results = testResults[test.id];
          const significance = results ? calculateSignificance(results.variantA, results.variantB) : null;
          
          return (
            <Card key={test.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TestTube className="h-5 w-5 text-green-500" />
                    <div>
                      <CardTitle>{test.test_name}</CardTitle>
                      <p className="text-sm text-gray-500">{test.page_path}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {significance?.significant && (
                      <Badge variant="default" className="bg-green-500">
                        <Trophy className="h-3 w-3 mr-1" />
                        {significance.confidence}% Confianza
                      </Badge>
                    )}
                    <Badge variant={test.is_active ? "default" : "secondary"}>
                      {test.is_active ? 'Activo' : 'Finalizado'}
                    </Badge>
                    {test.winner_variant && (
                      <Badge variant="outline">
                        Ganador: {test.winner_variant}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {results ? (
                  <div className="space-y-6">
                    {/* Resultados */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Variante A */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Variante A (Control)</h4>
                          <Badge variant="outline">
                            {results.variantA.rate.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Vistas</span>
                            <span>{results.variantA.views}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Conversiones</span>
                            <span>{results.variantA.conversions}</span>
                          </div>
                          <Progress value={results.variantA.rate} className="h-2" />
                        </div>
                      </div>
                      
                      {/* Variante B */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Variante B (Test)</h4>
                          <Badge variant="outline">
                            {results.variantB.rate.toFixed(1)}%
                          </Badge>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Vistas</span>
                            <span>{results.variantB.views}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Conversiones</span>
                            <span>{results.variantB.conversions}</span>
                          </div>
                          <Progress value={results.variantB.rate} className="h-2" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Análisis estadístico */}
                    {significance && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Target className="h-4 w-4 text-blue-500" />
                          <span className="font-medium">Análisis Estadístico</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Confianza:</span>
                            <span className="ml-2 font-medium">{significance.confidence}%</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Ganador:</span>
                            <span className="ml-2 font-medium">Variante {significance.winner}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Mejora:</span>
                            <span className="ml-2 font-medium">+{significance.improvement}%</span>
                          </div>
                        </div>
                        
                        {!significance.significant && (
                          <p className="text-sm text-amber-600 mt-2">
                            ⚠️ Necesitas más datos para resultados estadísticamente significativos
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Cargando resultados del test...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
        
        {!abTests || abTests.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TestTube className="h-16 w-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No hay tests A/B configurados</h3>
              <p className="text-gray-500 mb-4">
                Crea tu primer test para optimizar las conversiones
              </p>
              <Button onClick={() => setDialogOpen(true)}>
                Crear Primer Test A/B
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ABTestingManager;
