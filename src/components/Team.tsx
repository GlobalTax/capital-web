
import React from 'react';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const Team = () => {
  const teamMembers = [
    {
      name: 'Carlos Martínez',
      image: '/lovable-uploads/5459d292-9157-404f-915b-a1608e1f4779.png',
    },
    {
      name: 'Ana Rodriguez',
      image: '/lovable-uploads/b3d6115b-5184-49d6-8c1d-3493d1d72ca7.png',
    },
    {
      name: 'Miguel Santos',
      image: '/lovable-uploads/3aeb6303-e888-4dde-846f-88ec5c6606ae.png',
    },
    {
      name: 'David López',
      image: '/lovable-uploads/8c3bfca2-1cf0-42a1-935b-61cf6c319ecb.png',
    },
    {
      name: 'Roberto García',
      image: '/lovable-uploads/20da2e90-43c8-4c44-a119-a68b49bf41c0.png',
    },
    {
      name: 'Antonio Navarro',
      image: '/lovable-uploads/dfc75c41-289d-4bfd-963f-7838a1a06225.png',
    },
  ];

  return (
    <section id="equipo" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-6">
            Nuestro Equipo
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Profesionales con trayectorias excepcionales en las principales firmas 
            de inversión y consultoría del mundo.
          </p>
        </div>

        <div className="relative">
          <Carousel
            plugins={[
              Autoplay({
                delay: 3000,
                stopOnInteraction: true,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {teamMembers.map((member, index) => (
                <CarouselItem key={index} className="pl-2 basis-auto">
                  <div className="w-64 h-64 overflow-hidden rounded-lg border-0.5 border-gray-300">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-white text-black border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 -left-12" />
            <CarouselNext className="bg-white text-black border-0.5 border-gray-300 rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 -right-12" />
          </Carousel>
        </div>

        <div className="text-center mt-16">
          <Link 
            to="/equipo"
            className="inline-flex items-center px-6 py-3 bg-white text-black border-0.5 border-black rounded-lg hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out font-medium"
          >
            Ver Equipo Completo
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Team;
