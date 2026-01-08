import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Search } from 'lucide-react';

export const SearchFundsHubCTA: React.FC = () => {
  return (
    <section className="py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl p-8 md:p-12"
      >
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-normal text-foreground mb-4">
            ¿Listo para dar el siguiente paso?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Ya seas empresario pensando en vender o un searcher buscando oportunidades, 
            Capittal te acompaña en cada paso del proceso.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="gap-2">
              <Link to="/servicios/search-funds">
                <Building2 className="w-4 h-4" />
                Quiero vender mi empresa
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="gap-2">
              <Link to="/contacto?origen=search-funds-searcher">
                <Search className="w-4 h-4" />
                Busco dealflow cualificado
              </Link>
            </Button>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Confidencialidad 100% garantizada · Sin compromiso
          </p>
        </div>
      </motion.div>
    </section>
  );
};
