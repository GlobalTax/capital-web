
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const Hero = () => {
  return (
    <section className="pt-32 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Content */}
          <div className="animate-fade-in">
            {/* Main heading */}
            <h1 className="text-5xl md:text-6xl font-normal text-black mb-8 leading-tight tracking-tight">
              Maximizamos el
              <br />
              <span className="text-gray-600">valor</span>
              {' '}de tu empresa
            </h1>
            
            <p className="text-xl text-gray-600 mb-12 leading-relaxed font-normal max-w-lg">
              Somos especialistas en fusiones y adquisiciones con más de 15 años de experiencia. 
              Te acompañamos en cada paso para conseguir la mejor valoración.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="capittal-button text-lg px-10 py-5 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                Evaluar mi Empresa
                <ArrowRight className="ml-3" size={20} />
              </Button>
              
              <Button 
                variant="outline" 
                className="bg-transparent border-0.5 border-black rounded-lg px-10 py-5 text-lg font-normal hover:bg-black hover:text-white transition-all duration-300 shadow-sm"
              >
                Ver Casos de Éxito
              </Button>
            </div>
          </div>

          {/* Right Column - Video */}
          <div className="relative animate-fade-in">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-white rounded-2xl transform rotate-3"></div>
            
            {/* Video container */}
            <div className="relative bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
              {/* Video placeholder - replace with your actual video */}
              <div className="aspect-video bg-white flex items-center justify-center">
                <video 
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  poster="/placeholder.svg"
                >
                  {/* Replace with your actual video file */}
                  <source src="/your-video.mp4" type="video/mp4" />
                  <source src="/your-video.webm" type="video/webm" />
                  
                  {/* Fallback content if video doesn't load */}
                  <div className="w-full h-full bg-white flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-800 mb-2">Valoración Optimizada</div>
                      <div className="text-sm text-gray-600">Maximizamos el valor de tu empresa</div>
                    </div>
                  </div>
                </video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
