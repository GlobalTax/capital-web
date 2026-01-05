import { motion } from 'framer-motion';

interface GlossaryCardProps {
  term: string;
  definition: string;
  example?: string;
  category: string;
}

export const GlossaryCard = ({ term, definition, example, category }: GlossaryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border bg-card hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="text-lg font-semibold">{term}</h3>
        <span className="text-xs font-medium px-2 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
          {category}
        </span>
      </div>
      
      <p className="text-muted-foreground text-sm mb-3">{definition}</p>
      
      {example && (
        <div className="pt-3 border-t">
          <p className="text-sm">
            <span className="font-medium text-foreground">Ejemplo: </span>
            <span className="text-muted-foreground">{example}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
};
