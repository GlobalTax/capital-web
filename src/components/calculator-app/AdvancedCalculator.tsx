import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calculator, Settings, Save } from 'lucide-react';

export const AdvancedCalculator: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Nueva Valoración</h1>
          <p className="text-muted-foreground">
            Crea una nueva valoración empresarial con herramientas avanzadas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Save className="h-4 w-4 mr-2" />
            Guardar Borrador
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configurar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Calculadora Avanzada
          </CardTitle>
          <CardDescription>
            Calculadora con funcionalidades premium para usuarios registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Calculator className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Calculadora Avanzada en Desarrollo</h3>
            <p className="text-muted-foreground mb-4">
              Pronto tendrás acceso a nuestra calculadora mejorada con:
            </p>
            <ul className="text-left max-w-md mx-auto space-y-2 text-sm text-muted-foreground">
              <li>• Guardado automático progresivo</li>
              <li>• Plantillas por sector e industria</li>
              <li>• Comparativas entre valoraciones</li>
              <li>• Exportación a PDF profesional</li>
              <li>• Notas personales y comentarios</li>
              <li>• Análisis de sensibilidad avanzado</li>
            </ul>
            <div className="mt-6">
              <Button 
                onClick={() => window.open('https://capittal.es/lp/calculadora', '_blank')}
              >
                Usar Calculadora Básica
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};