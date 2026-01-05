import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface GuideHeroProps {
  icon: LucideIcon;
  tag: string;
  title: string;
  description: string;
  readTime?: string;
}

export const GuideHero = ({ icon: Icon, tag, title, description, readTime }: GuideHeroProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-12"
    >
      <Link 
        to="/search-funds/recursos" 
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver al Centro de Recursos
      </Link>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="inline-flex p-3 rounded-xl bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <span className="text-xs font-medium text-primary uppercase tracking-wider">
          {tag}
        </span>
        {readTime && (
          <>
            <span className="text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{readTime}</span>
          </>
        )}
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold mb-4">
        {title}
      </h1>
      
      <p className="text-lg text-muted-foreground max-w-3xl">
        {description}
      </p>
    </motion.div>
  );
};
