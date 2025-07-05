import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, XCircle, PlayCircle } from 'lucide-react';
import { uxValidation } from '@/utils/uxValidation';

interface TestResults {
  accessibility: string[];
  performance: string[];
  errorHandling: string[];
  responsiveness: string[];
  summary: {
    totalIssues: number;
    passed: boolean;
    score: number;
  };
}

export const UXTestRunner = () => {
  const [results, setResults] = useState<TestResults | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    
    // Simulate test running time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const testResults = uxValidation.runAllTests();
    setResults(testResults);
    setIsRunning(false);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 90) return 'default';
    if (score >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <PlayCircle className="h-5 w-5" />
          UX Test Runner
        </CardTitle>
        <p className="text-muted-foreground">
          Ejecuta pruebas automáticas de experiencia de usuario
        </p>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="w-full sm:w-auto"
            >
              {isRunning ? 'Ejecutando tests...' : 'Ejecutar Tests de UX'}
            </Button>
          </div>

          {results && (
            <div className="space-y-6">
              {/* Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Resumen de Resultados</span>
                    <Badge variant={getScoreBadgeVariant(results.summary.score)}>
                      Puntuación: {results.summary.score}/100
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    {results.summary.passed ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <XCircle className="h-8 w-8 text-red-600" />
                    )}
                    <div>
                      <p className={`text-2xl font-bold ${getScoreColor(results.summary.score)}`}>
                        {results.summary.totalIssues === 0 ? '¡Perfecto!' : `${results.summary.totalIssues} problemas encontrados`}
                      </p>
                      <p className="text-muted-foreground">
                        {results.summary.passed ? 'Todos los tests pasaron' : 'Revisar los problemas encontrados'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Test Categories */}
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(results).map(([category, issues]) => {
                  if (category === 'summary') return null;
                  
                  const categoryLabels = {
                    accessibility: 'Accesibilidad',
                    performance: 'Rendimiento',
                    errorHandling: 'Manejo de Errores',
                    responsiveness: 'Responsividad'
                  };

                  return (
                    <Card key={category}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between text-base">
                          <span>{categoryLabels[category as keyof typeof categoryLabels]}</span>
                          {issues.length === 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertCircle className="h-5 w-5 text-yellow-600" />
                          )}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {issues.length === 0 ? (
                          <p className="text-green-600 text-sm">✓ Todos los tests pasaron</p>
                        ) : (
                          <ul className="space-y-2">
                            {issues.map((issue, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-yellow-600 mt-0.5">⚠</span>
                                {issue}
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default UXTestRunner;