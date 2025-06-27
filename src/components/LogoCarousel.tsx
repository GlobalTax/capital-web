
import React from 'react';
import AutoScroll from "embla-carousel-auto-scroll";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";

const LogoCarousel = () => {
  const logos = [
    {
      id: "logo-1",
      description: "TechCorp",
      image: "/placeholder.svg",
      className: "h-7 w-auto",
    },
    {
      id: "logo-2",
      description: "InnovateLab",
      image: "/placeholder.svg",
      className: "h-7 w-auto",
    },
    {
      id: "logo-3",
      description: "DataFlow",
      image: "/placeholder.svg",
      className: "h-7 w-auto",
    },
    {
      id: "logo-4",
      description: "CloudVision",
      image: "/placeholder.svg",
      className: "h-7 w-auto",
    },
    {
      id: "logo-5",
      description: "FinanceMax",
      image: "/placeholder.svg",
      className: "h-7 w-auto",
    },
    {
      id: "logo-6",
      description: "RetailPro",
      image: "/placeholder.svg",
      className: "h-5 w-auto",
    },
    {
      id: "logo-7",
      description: "HealthTech",
      image: "/placeholder.svg",
      className: "h-7 w-auto",
    },
    {
      id: "logo-8",
      description: "AutoMotive",
      image: "/placeholder.svg",
      className: "h-7 w-auto",
    },
  ];

  const testimonials = [
    {
      quote: "Capittal nos ayudó a lograr una valoración excepcional en la venta de nuestra empresa. Su experiencia en M&A es incomparable.",
      name: "CEO, TechStartup",
      image: "/placeholder.svg",
    },
    {
      quote: "El proceso fue transparente y eficiente. Conseguimos el mejor precio posible gracias a su metodología probada.",
      name: "Fundador, Industrial Solutions",
      image: "/placeholder.svg",
    },
    {
      quote: "Profesionales excepcionales que entienden perfectamente el mercado español. Recomendamos Capittal sin dudas.",
      name: "Director General, Retail Chain",
      image: "/placeholder.svg",
    },
  ];

  return (
    <section className="py-16 bg-white border-t border-b border-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-black mb-4">
          Empresas que Confían en Nosotros
        </h2>
        <p className="text-gray-600 text-lg mb-8">
          Más de 200 empresas han confiado en nuestros servicios
        </p>
      </div>

      <div className="relative mx-auto flex items-center justify-center pt-8 lg:max-w-5xl">
        <Carousel
          opts={{ loop: true }}
          plugins={[AutoScroll({ playOnInit: true })]}
        >
          <CarouselContent className="ml-0">
            {logos.map((logo) => (
              <CarouselItem
                key={logo.id}
                className="flex basis-1/3 justify-center pl-0 sm:basis-1/4 md:basis-1/5 lg:basis-1/6"
              >
                <div className="flex shrink-0 items-center justify-center lg:mx-10">
                  <div className="w-32 h-16 bg-gray-100 border-0.5 border-gray-300 rounded-lg flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300">
                    <span className="text-gray-500 font-medium text-sm">
                      {logo.description}
                    </span>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-white to-transparent"></div>
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-white to-transparent"></div>
      </div>
      
      <Separator className="my-16 mx-auto max-w-5xl border-gray-300" />

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-black mb-4">
            Lo que Dicen Nuestros Clientes
          </h3>
        </div>
        <Carousel opts={{ loop: true }} className="mx-auto w-full">
          <CarouselContent>
            {testimonials.map((testimonial, index) => (
              <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                <div
                  className={cn(
                    "relative w-full border-r border-gray-300 px-12 text-center md:px-8 md:text-left",
                    index === 0 && "lg:border-l border-gray-300",
                  )}
                >
                  <h5 className="text-gray-600 mb-14 mt-5 line-clamp-3 text-lg tracking-tight md:mb-28">
                    "{testimonial.quote}"
                  </h5>
                  <div className="mt-auto">
                    <p className="text-black text-lg font-semibold tracking-tight">
                      {testimonial.name}
                    </p>
                    <div className="mx-auto my-5 w-24 h-12 bg-gray-100 border-0.5 border-gray-300 rounded-lg flex items-center justify-center md:mx-0">
                      <span className="text-gray-500 text-xs">Logo</span>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
};

export default LogoCarousel;
