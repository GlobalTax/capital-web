import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    name: "Carlos Mendoza",
    role: "Senior M&A Analyst",
    company: "Ex-Goldman Sachs",
    avatar: "",
    rating: 5,
    content: "El programa de colaboradores de Capittal me ha permitido trabajar en transacciones de alto nivel mientras mantengo la flexibilidad que buscaba. El equipo es excepcional.",
    sector: "Financial Services",
    joinedYear: "2022"
  },
  {
    id: 2,
    name: "María García",
    role: "Valuations Director",
    company: "Ex-PwC",
    avatar: "",
    rating: 5,
    content: "La calidad de los proyectos y el nivel de los clientes es impresionante. He podido desarrollar mi expertise en valoraciones complejas con el respaldo de un equipo profesional.",
    sector: "Industrial",
    joinedYear: "2021"
  },
  {
    id: 3,
    name: "Alejandro Ruiz",
    role: "Corporate Development",
    company: "Ex-McKinsey",
    avatar: "",
    rating: 5,
    content: "Capittal ofrece una oportunidad única de participar en el ecosistema M&A español. Los proyectos son desafiantes y el aprendizaje constante.",
    sector: "Technology",
    joinedYear: "2023"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Testimonios
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              Lo que dicen nuestros colaboradores
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Profesionales de primer nivel que han encontrado en Capittal la plataforma 
              perfecta para desarrollar su carrera en M&A.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="admin-card group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-8">
                  {/* Rating */}
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star 
                        key={i} 
                        className="w-4 h-4 fill-yellow-400 text-yellow-400" 
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <div className="relative mb-6">
                    <Quote className="w-8 h-8 text-primary/20 absolute -top-2 -left-1" />
                    <p className="text-muted-foreground leading-relaxed pl-6">
                      "{testimonial.content}"
                    </p>
                  </div>

                  {/* Author */}
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {testimonial.company}
                      </p>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <Badge variant="secondary" className="text-xs">
                      {testimonial.sector}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Desde {testimonial.joinedYear}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-border">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50+</div>
              <div className="text-sm text-muted-foreground">Colaboradores Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Satisfacción</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">€500M+</div>
              <div className="text-sm text-muted-foreground">Valor Gestionado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">15</div>
              <div className="text-sm text-muted-foreground">Años Experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;