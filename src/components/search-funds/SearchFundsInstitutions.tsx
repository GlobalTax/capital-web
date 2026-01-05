import { motion } from 'framer-motion';

const institutions = [
  { name: 'IESE Business School', abbr: 'IESE' },
  { name: 'IE Business School', abbr: 'IE' },
  { name: 'ESADE Business School', abbr: 'ESADE' },
  { name: 'AcEF - Asociación de Search Funds', abbr: 'AcEF' },
];

export const SearchFundsInstitutions = () => {
  return (
    <section className="py-16 bg-slate-50 border-y border-border/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground mb-8 uppercase tracking-wider font-medium">
            Conectados con el ecosistema de Search Funds
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {institutions.map((institution, index) => (
              <motion.div
                key={institution.abbr}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div 
                  className="px-6 py-3 rounded-lg bg-background border border-border/50 
                             text-muted-foreground font-semibold text-lg
                             hover:border-primary/50 hover:text-primary hover:shadow-sm
                             transition-all cursor-default"
                  title={institution.name}
                >
                  {institution.abbr}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted-foreground mt-8"
          >
            Colaboramos con las principales escuelas de negocio y asociaciones del sector
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchFundsInstitutions;
