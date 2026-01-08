import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  sector: string;
  rating: number;
  type: 'seller' | 'searcher';
}

const testimonials: Testimonial[] = [
  {
    id: '1',
    quote: 'Tras 30 años en mi empresa, temía que la venta fuera fría e impersonal. Con el Search Fund encontré a alguien que genuinamente quería continuar mi legado. La transición fue gradual y mi equipo está en buenas manos.',
    author: 'Carlos M.',
    role: 'Empresario vendedor',
    sector: 'Servicios industriales',
    rating: 5,
    type: 'seller',
  },
  {
    id: '2',
    quote: 'Capittal nos ayudó a encontrar la empresa perfecta para nuestro perfil. Su conocimiento del mercado español y red de contactos fue clave. Cerramos la operación en 8 meses con condiciones excelentes.',
    author: 'Ana R.',
    role: 'Searcher - MBA IESE',
    sector: 'Distribución B2B',
    rating: 5,
    type: 'searcher',
  },
  {
    id: '3',
    quote: 'Lo que más valoré fue la confidencialidad del proceso. Nadie en mi sector supo que estaba vendiendo hasta que todo estuvo cerrado. El searcher conocía mi industria y eso facilitó mucho la negociación.',
    author: 'Roberto S.',
    role: 'Empresario vendedor',
    sector: 'Manufactura especializada',
    rating: 5,
    type: 'seller',
  },
];

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex gap-1">
    {[...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
      />
    ))}
  </div>
);

export const SearchFundsTestimonials = () => {
  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-normal text-foreground mb-4">
            Historias de éxito reales
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Lo que dicen empresarios y searchers que han confiado en nosotros.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 h-full flex flex-col bg-background hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <Quote className="w-8 h-8 text-primary/30" />
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    testimonial.type === 'seller' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {testimonial.type === 'seller' ? 'Vendedor' : 'Searcher'}
                  </span>
                </div>

                <blockquote className="text-foreground mb-6 flex-grow leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>

                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.author}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      <div className="text-xs text-muted-foreground mt-1">{testimonial.sector}</div>
                    </div>
                    <StarRating rating={testimonial.rating} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 text-center"
        >
          <div className="inline-flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              Empresarios vendedores
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              Searchers
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default SearchFundsTestimonials;
