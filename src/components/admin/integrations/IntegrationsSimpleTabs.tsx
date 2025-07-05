import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface IntegrationsSimpleTabsProps {
  children: React.ReactNode;
  defaultValue?: string;
}

const IntegrationsSimpleTabs = ({ children, defaultValue = "overview" }: IntegrationsSimpleTabsProps) => {
  return (
    <Tabs defaultValue={defaultValue} className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Resumen</TabsTrigger>
        <TabsTrigger value="email">Email</TabsTrigger>
        <TabsTrigger value="apis">APIs Externas</TabsTrigger>
      </TabsList>
      
      <TabsContent value="overview" className="space-y-6">
        {children}
      </TabsContent>
      
      <TabsContent value="email" className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Configuración de integraciones de email próximamente</p>
        </div>
      </TabsContent>
      
      <TabsContent value="apis" className="space-y-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Configuración de APIs externas próximamente</p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default IntegrationsSimpleTabs;