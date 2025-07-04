import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const ContentPerformancePage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Performance de Contenido</h1>
        <p className="text-muted-foreground">Métricas y análisis del rendimiento del contenido</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Dashboard de Performance</CardTitle>
          <CardDescription>
            Aquí se mostrarán las métricas de rendimiento del contenido
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Próximamente...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContentPerformancePage;