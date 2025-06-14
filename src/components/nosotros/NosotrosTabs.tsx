
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PorQueElegirnosExperience from '@/components/por-que-elegirnos/PorQueElegirnosExperience';
import PorQueElegirnosApproach from '@/components/por-que-elegirnos/PorQueElegirnosApproach';
import PorQueElegirnosResults from '@/components/por-que-elegirnos/PorQueElegirnosResults';
import Team from '@/components/Team';
import CaseStudies from '@/components/CaseStudies';

const NosotrosTabs = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-6">
            Conócenos Mejor
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre por qué somos la mejor opción para tus necesidades de M&A
          </p>
        </div>

        <Tabs defaultValue="por-que-elegirnos" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-12">
            <TabsTrigger value="por-que-elegirnos" className="text-sm font-medium">
              Por Qué Elegirnos
            </TabsTrigger>
            <TabsTrigger value="casos-exito" className="text-sm font-medium">
              Casos de Éxito
            </TabsTrigger>
            <TabsTrigger value="equipo" className="text-sm font-medium">
              Equipo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="por-que-elegirnos" className="space-y-0">
            <PorQueElegirnosExperience />
            <PorQueElegirnosApproach />
            <PorQueElegirnosResults />
          </TabsContent>

          <TabsContent value="casos-exito" className="space-y-0">
            <CaseStudies />
          </TabsContent>

          <TabsContent value="equipo" className="space-y-0">
            <Team />
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default NosotrosTabs;
