import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import RevenueMultiplesManager from './RevenueMultiplesManager';
import EbitdaMultiplesManager from './EbitdaMultiplesManager';
import NetProfitMultiplesManager from './NetProfitMultiplesManager';

const AdvisorMultiplesRangesTabs = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Múltiplos por Rangos - Sistema Separado</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Configura múltiplos específicos para cada métrica financiera de forma independiente
        </p>
      </div>

      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">📊 Facturación</TabsTrigger>
          <TabsTrigger value="ebitda">💰 EBITDA</TabsTrigger>
          <TabsTrigger value="netprofit">📈 Resultado Neto</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="mt-6">
          <RevenueMultiplesManager />
        </TabsContent>

        <TabsContent value="ebitda" className="mt-6">
          <EbitdaMultiplesManager />
        </TabsContent>

        <TabsContent value="netprofit" className="mt-6">
          <NetProfitMultiplesManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvisorMultiplesRangesTabs;
