import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Users } from 'lucide-react';
import { InteractiveHoverButton } from '@/components/ui/interactive-hover-button';
import { SearchFundsDataVisual } from './SearchFundsDataVisual';

const SearchFundsHero: React.FC = () => {
  const navigate = useNavigate();
  
  const benefits = [
    "Emprendedores de élite que invierten su futuro en tu empresa",
    "Proceso de due diligence riguroso y profesional",
    "Horizonte de 5-7 años con implicación operativa total"
  ];

  const scrollToContact = () => {
    const element = document.getElementById('contact');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative bg-background py-20 md:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              <Users className="w-4 h-4" />
              Servicio especializado en M&A
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-foreground leading-tight">
                Search Funds: <br />
                <span className="text-primary">El futuro de la sucesión empresarial</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                Conectamos tu empresa con emprendedores de primer nivel que buscan 
                liderar y hacer crecer negocios consolidados.
              </p>
            </div>

            {/* Benefits */}
            <ul className="space-y-3">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <InteractiveHoverButton 
                text="Quiero vender"
                onClick={scrollToContact}
                size="lg"
              />
              <InteractiveHoverButton 
                text="Busco dealflow"
                onClick={() => navigate('/contacto?origen=search-funds-searcher')}
                variant="secondary"
                size="lg"
              />
            </div>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>+200 empresas valoradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Confidencialidad 100%</span>
              </div>
            </div>
          </div>

          {/* Right Column - Animated Data Visual */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <SearchFundsDataVisual />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SearchFundsHero;
