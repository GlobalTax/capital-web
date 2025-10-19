import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProcessStepsManager from './ProcessStepsManager';
import ComparisonsManager from './ComparisonsManager';
import TestimonialsManager from './TestimonialsManager';

const VentaEmpresasContentManager = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Gestión de Contenidos - Venta de Empresas</h2>
        <p className="text-muted-foreground">
          Administra los textos que se muestran en la landing page de venta de empresas
        </p>
      </div>

      <Tabs defaultValue="process" className="w-full">
        <TabsList>
          <TabsTrigger value="process">Nuestro Proceso</TabsTrigger>
          <TabsTrigger value="comparison">Comparación</TabsTrigger>
          <TabsTrigger value="testimonials">Testimonios</TabsTrigger>
        </TabsList>

        <TabsContent value="process" className="space-y-4">
          <ProcessStepsManager />
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <ComparisonsManager />
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <TestimonialsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VentaEmpresasContentManager;
