import React from 'react';
import UnifiedLayout from '@/components/shared/UnifiedLayout';
import { useDynamicSEO } from '@/hooks/useDynamicSEO';
import {
  SearchFundsHubHero,
  TableOfContents,
  SearchFundsModels,
  SearchFundsIdealTarget,
  SearchFundsDealStructure,
  SearchFundsFinancing,
  SearchFundsSpainEcosystem,
  SearchFundsHubResources,
  SearchFundsHubFAQ,
  SearchFundsHubCTA,
} from '@/components/search-funds-hub';
import { SearchFundsComparison } from '@/components/search-funds/SearchFundsComparison';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

const SearchFundsHub: React.FC = () => {
  useDynamicSEO({
    title: 'Guía Completa de Search Funds en España | Capittal',
    description: 'Aprende todo sobre Search Funds: qué son, cómo funcionan, modelos de financiación, proceso de adquisición y por qué España es líder europeo. Guía actualizada 2025.',
    keywords: 'search funds, search fund españa, emprendimiento por adquisición, compra de empresas, IESE, IE, ESADE, M&A',
  });

  return (
    <UnifiedLayout variant="home">
      <SearchFundsHubHero />
      
      <div className="container mx-auto px-4">
        <div className="flex gap-8">
          {/* Sidebar TOC */}
          <aside className="w-64 flex-shrink-0">
            <TableOfContents />
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
            {/* What is a Search Fund */}
            <section id="que-es" className="py-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                ¿Qué es un Search Fund?
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg text-muted-foreground mb-6">
                  Un <strong>Search Fund</strong> (fondo de búsqueda) es un vehículo de inversión 
                  creado por uno o dos emprendedores —llamados <em>searchers</em>— con el objetivo 
                  de identificar, adquirir y operar una pequeña o mediana empresa.
                </p>
                
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">Concepto clave</h4>
                      <p className="text-muted-foreground text-sm">
                        A diferencia del emprendimiento tradicional (crear algo nuevo), el Search Fund 
                        representa el <strong>emprendimiento por adquisición</strong>: tomar el control 
                        de un negocio existente y rentable para hacerlo crecer.
                      </p>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-foreground mt-8 mb-4">
                  El modelo en 4 fases
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { phase: '1. Fundraising', desc: 'El searcher levanta capital (€300-500K) de inversores para financiar la búsqueda.' },
                    { phase: '2. Búsqueda', desc: 'Durante 18-24 meses, identifica y evalúa empresas candidatas.' },
                    { phase: '3. Adquisición', desc: 'Negocia, estructura y cierra la compra de la empresa objetivo.' },
                    { phase: '4. Operación', desc: 'El searcher se convierte en CEO durante 5-7 años, creando valor hasta el exit.' },
                  ].map((item) => (
                    <div key={item.phase} className="bg-muted/50 rounded-lg p-4">
                      <h4 className="font-semibold text-foreground mb-1">{item.phase}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <SearchFundsModels />
            <SearchFundsIdealTarget />
            
            {/* Process Section - reuse comparison from service page */}
            <section id="proceso" className="py-16 scroll-mt-24">
              <h2 className="text-3xl font-bold text-foreground mb-6">
                El Proceso de Adquisición
              </h2>
              <p className="text-muted-foreground mb-8">
                Desde el primer contacto hasta el cierre, el proceso sigue una estructura 
                predecible que protege a ambas partes.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="grid md:grid-cols-5 gap-4"
              >
                {[
                  { step: '1', title: 'Contacto', duration: '1-2 sem' },
                  { step: '2', title: 'Valoración', duration: '2-4 sem' },
                  { step: '3', title: 'LOI', duration: '2-4 sem' },
                  { step: '4', title: 'Due Diligence', duration: '4-8 sem' },
                  { step: '5', title: 'Cierre', duration: '2-4 sem' },
                ].map((item, i) => (
                  <div key={item.step} className="relative">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 text-lg font-bold">
                        {item.step}
                      </div>
                      <h4 className="font-semibold text-foreground text-sm">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.duration}</p>
                    </div>
                    {i < 4 && (
                      <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-border" />
                    )}
                  </div>
                ))}
              </motion.div>
            </section>

            <SearchFundsDealStructure />
            <SearchFundsFinancing />
            
            {/* Comparison Section */}
            <section id="comparativa" className="py-16 scroll-mt-24">
              <SearchFundsComparison />
            </section>

            <SearchFundsSpainEcosystem />
            <SearchFundsHubResources />
            <SearchFundsHubFAQ />
            <SearchFundsHubCTA />
          </main>
        </div>
      </div>
    </UnifiedLayout>
  );
};

export default SearchFundsHub;
