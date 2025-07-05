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
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Lo que dicen nuestros colaboradores
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Profesionales de primer nivel que han encontrado en Capittal la plataforma 
            perfecta para desarrollar su carrera en M&A.
          </p>
        </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
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
                  <Quote className="w-6 h-6 text-gray-300 absolute -top-1 -left-1" />
                  <p className="text-gray-600 leading-relaxed pl-4">
                    "{testimonial.content}"
                  </p>
                </div>

                {/* Author */}
                <div className="flex items-center space-x-4">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                    <AvatarFallback className="bg-black text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-black">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {testimonial.role}
                    </p>
                    <p className="text-xs text-gray-500">
                      {testimonial.company}
                    </p>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-300">
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {testimonial.sector}
                  </div>
                  <span className="text-xs text-gray-500">
                    Desde {testimonial.joinedYear}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-gray-300">
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">50+</div>
              <div className="text-gray-600 font-medium text-base">Colaboradores Activos</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">95%</div>
              <div className="text-gray-600 font-medium text-base">Satisfacción</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">€500M+</div>
              <div className="text-gray-600 font-medium text-base">Valor Gestionado</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">15</div>
              <div className="text-gray-600 font-medium text-base">Años Experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;